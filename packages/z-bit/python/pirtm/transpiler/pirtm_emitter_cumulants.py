"""
PIRTM Cumulant Emitter: Transform Sigma output into MLIR cumulant bundles.

Implements ADR-011 Part 3: MLIR emitter for cumulant storage and persistence.

This module:
  1. Takes RGFlowResult from Sigma Kernel (ADR-010)
  2. Emits pirtm.cumulant_embed operations into MLIR
  3. Serializes cumulant bundles to bytecode sections
  4. Maintains deterministic blake3 commitments

Spec Reference:
  - ADR-011: Cumulant Storage and Persistence Model
  - ADR-010: Sigma Kernel (RGFlowResult producer)
  - docs/formats/pirtm-bc-v2.md: Binary format specification
"""

import struct
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass
import numpy as np
from datetime import datetime, timezone
from blake3 import blake3

from pirtm.sigma.kernel import RGFlowResult
from pirtm.dialect.pirtm_types import CumulantBundleType, create_cumulant_bundle


@dataclass
class CumulantRecord:
    """In-memory representation of a single cumulant record (before serialization)."""
    scale_k: float
    prime_mod: int
    order: int
    spectral_radius: float
    data: np.ndarray  # Will be serialized to bytes
    commitment: str   # Blake3 hex string


@dataclass
class CumulantBytecodeSection:
    """Bytecode section containing multiple cumulant records."""
    section_id: bytes  # 0x434D5552 ("CMUR")
    records: List[CumulantRecord]
    encoding: int = 1  # 1 = blake3, 2 = blake2b (future)


class CumulantEmitter:
    """
    Emit cumulants from Sigma Kernel output into MLIR and bytecode.
    
    Usage:
        emitter = CumulantEmitter(prime_index=2)
        result = sigma_solver.flow_to_scale(k_uv=1e16, k_ir=1e2)
        mlir_ops = emitter.emit_mlir_ops(result)
        bytecode_section = emitter.emit_bytecode_section(result)
    """
    
    def __init__(self, prime_index: int = 0, verbose: bool = False):
        """
        Initialize emitter.
        
        Args:
            prime_index: Prime modulus for this module (must be prime).
                         Defaults to 0 (unset); callers that don't have a
                         module-level prime yet pass through the pipeline
                         and set it via emit_mlir_ops.
            verbose: If True, emit diagnostic output during emission.
        """
        self.prime_index = prime_index
        self.verbose = verbose
        self.timestamp = datetime.now(timezone.utc).isoformat()
    
    def emit_mlir_ops(self, sigma_result: RGFlowResult) -> List[Dict[str, any]]:
        """
        Emit pirtm.cumulant_embed operations from Sigma output.
        
        For each (scale_k, order), create a CumulantBundle type and emit an op.
        
        Args:
            sigma_result: RGFlowResult from Sigma Kernel
        
        Returns:
            List of op dictionaries ready for insertion into MLIR module.
            Each dict contains:
              - "op_name": "pirtm.cumulant_embed"
              - "bundle_type": CumulantBundleType instance
              - "location": String for MLIR location info
        """
        ops = []
        
        # Extract scales from result
        scales = sigma_result.scales
        
        # For each combination of scale and available cumulant order
        for scale_idx, scale_k in enumerate(scales):
            for order in [2, 3, 4]:  # Handle up to 4th order
                
                # Get cumulant data for this scale and order
                if order == 2:
                    cumulant_data = sigma_result.c2[scale_idx:scale_idx+1]
                elif order == 3:
                    cumulant_data = sigma_result.c3[scale_idx:scale_idx+1]
                elif order == 4:
                    cumulant_data = sigma_result.c4[scale_idx:scale_idx+1]
                else:
                    continue
                
                # Compute deterministic blake3 hash
                data_bytes = self._serialize_cumulant_data(cumulant_data)
                commitment_hash = blake3(data_bytes).hexdigest()
                
                # Spectral radius (use global bound from result)
                spectral_radius = sigma_result.spectral_radius_global
                
                # Create CumulantBundle type with verification
                try:
                    bundle_type = create_cumulant_bundle(
                        scale_k=float(scale_k),
                        prime_mod=self.prime_index,
                        orders=[order],
                        spectral_radius=float(spectral_radius),
                        commitment=commitment_hash
                    )
                    
                    # Create MLIR operation
                    op_dict = {
                        "op_name": "pirtm.cumulant_embed",
                        "bundle_type": bundle_type,
                        "location": f"unknown(sigma:scale={scale_k:.2e},order={order})",
                        "cumulant_data": cumulant_data,
                        "commitment": commitment_hash
                    }
                    ops.append(op_dict)
                
                except Exception as e:
                    # Type verification failed; skip this record
                    print(f"WARNING: Skipping cumulant at scale {scale_k}, order {order}: {e}")
                    continue
        
        return ops
    
    def emit_bytecode_section(self, sigma_result: RGFlowResult) -> CumulantBytecodeSection:
        """
        Serialize cumulants to bytecode format (per pirtm-bc-v2.md).
        
        Args:
            sigma_result: RGFlowResult from Sigma Kernel
        
        Returns:
            CumulantBytecodeSection with serialized records
        
        Raises:
            ValueError: If any cumulant fails validation
        """
        records = []
        
        scales = sigma_result.scales
        
        for scale_idx, scale_k in enumerate(scales):
            for order in [2, 3, 4]:
                
                # Extract cumulant data
                if order == 2:
                    cumulant_data = sigma_result.c2[scale_idx:scale_idx+1]
                elif order == 3:
                    cumulant_data = sigma_result.c3[scale_idx:scale_idx+1]
                elif order == 4:
                    cumulant_data = sigma_result.c4[scale_idx:scale_idx+1]
                else:
                    continue
                
                # Serialize data to bytes (big-endian f64)
                data_bytes = self._serialize_cumulant_data(cumulant_data)
                
                # Compute blake3 commitment
                commitment_hash = blake3(data_bytes).hexdigest()
                
                # Create record
                record = CumulantRecord(
                    scale_k=float(scale_k),
                    prime_mod=self.prime_index,
                    order=order,
                    spectral_radius=float(sigma_result.spectral_radius_global),
                    data=cumulant_data,
                    commitment=commitment_hash
                )
                records.append(record)
        
        return CumulantBytecodeSection(
            section_id=b"CMUR",  # 0x434D5552
            records=records,
            encoding=1  # blake3
        )
    
    def serialize_bytecode_section(self, section: CumulantBytecodeSection) -> bytes:
        """
        Convert CumulantBytecodeSection to binary bytes (per pirtm-bc-v2.md).
        
        Binary layout:
          - Header (8 bytes):
            - Section ID: 4 bytes "CMUR"
            - Record count: u32 (4 bytes, big-endian)
            - Encoding: u8 (1 byte)
            - padding: 3 bytes (0x00)
          - Records (variable):
            - For each record:
              - scale_k: f64 (8 bytes, big-endian)
              - prime_mod: i32 (4 bytes, big-endian)
              - order: i8 (1 byte)
              - padding: 3 bytes (0x00)
              - spectral_radius: f64 (8 bytes, big-endian)
              - data_len: u32 (4 bytes, big-endian)
              - data: [data_len bytes]
              - hash: 32 bytes (blake3)
        
        Args:
            section: CumulantBytecodeSection to serialize
        
        Returns:
            Binary bytes ready to write to .pirtm.bc file
        """
        buffer = bytearray()
        
        # Section header (8 bytes)
        buffer.extend(b"CMUR")  # Section ID
        buffer.extend(struct.pack(">I B 3x", len(section.records), section.encoding))
        
        # Cumulant records
        for record in section.records:
            # Serialize data to bytes (big-endian f64, flattened)
            data_bytes = self._serialize_cumulant_data(record.data)
            
            # Compute hash
            hash_bytes = bytes.fromhex(record.commitment)  # Hex string to 32 bytes
            
            # Record header (28 bytes)
            header = struct.pack(
                ">d i b 3x d I",
                record.scale_k,
                record.prime_mod,
                record.order,
                record.spectral_radius,
                len(data_bytes)
            )
            buffer.extend(header)
            buffer.extend(data_bytes)
            buffer.extend(hash_bytes)
        
        return bytes(buffer)
    
    def deserialize_bytecode_section(self, data: bytes) -> CumulantBytecodeSection:
        """
        Parse binary cumulant section back to CumulantBytecodeSection.
        
        Args:
            data: Binary bytes from .pirtm.bc file
        
        Returns:
            Reconstructed CumulantBytecodeSection
        
        Raises:
            ValueError: If format is invalid or hash verification fails
        """
        if len(data) < 12:
            raise ValueError(f"Cumulant section too short ({len(data)} bytes)")
        
        # Parse header
        if data[0:4] != b"CMUR":
            raise ValueError(f"Invalid section ID: {data[0:4]}")
        
        # Header format: >I (u32) B (u8) 3x (padding) = 8 bytes total
        header = struct.unpack(">I B 3x", data[4:12])
        record_count = header[0]
        encoding = header[1]
        
        if encoding != 1:
            raise ValueError(f"Unsupported encoding: {encoding}")
        
        records = []
        offset = 12  # After section header (4 bytes magic + 8 bytes header)
        
        for _ in range(record_count):
            if offset + 28 > len(data):
                raise ValueError("Truncated record header")
            
            # Parse record header (28 bytes)
            record_header = struct.unpack(
                ">d i b 3x d I",
                data[offset:offset+28]
            )
            scale_k, prime_mod, order, spectral_radius, data_len = record_header
            offset += 28
            
            # Extract data payload
            if offset + data_len > len(data):
                raise ValueError(f"Truncated data: expected {data_len}, got {len(data) - offset}")
            
            cumulant_data = data[offset:offset+data_len]
            offset += data_len
            
            # Extract hash (32 bytes)
            if offset + 32 > len(data):
                raise ValueError("Truncated hash")
            
            hash_bytes = data[offset:offset+32]
            offset += 32
            
            # Verify hash
            computed_hash = blake3(cumulant_data).digest()
            if computed_hash != hash_bytes:
                raise ValueError(
                    f"Hash mismatch for scale_k={scale_k}, order={order}: "
                    f"expected {hash_bytes.hex()}, got {computed_hash.hex()}"
                )
            
            # Reconstruct record
            record = CumulantRecord(
                scale_k=scale_k,
                prime_mod=prime_mod,
                order=order,
                spectral_radius=spectral_radius,
                data=self._deserialize_cumulant_data(cumulant_data),
                commitment=computed_hash.hex()
            )
            records.append(record)
        
        return CumulantBytecodeSection(
            section_id=b"CMUR",
            records=records,
            encoding=encoding
        )
    
    @staticmethod
    def _serialize_cumulant_data(cumulant_array: np.ndarray) -> bytes:
        """
        Serialize a cumulant array to bytes (big-endian f64).
        
        Args:
            cumulant_array: numpy array of floats
        
        Returns:
            Binary representation (big-endian float64)
        """
        # Ensure float64
        arr = np.asarray(cumulant_array, dtype=np.float64)
        
        # Flatten and convert to bytes (big-endian)
        flat = arr.flatten()
        return struct.pack(">" + "d" * len(flat), *flat)
    
    @staticmethod
    def _deserialize_cumulant_data(data_bytes: bytes) -> np.ndarray:
        """
        Deserialize bytes back to cumulant array.
        
        Args:
            data_bytes: Binary representation
        
        Returns:
            numpy array of float64
        """
        count = len(data_bytes) // 8
        values = struct.unpack(">" + "d" * count, data_bytes)
        return np.array(values, dtype=np.float64)
    
    @staticmethod
    def _compute_spectral_radius(cumulant_data: np.ndarray) -> float:
        """
        Estimate spectral radius from cumulant data.
        
        For now, use max absolute value scaled by order-dependent factor.
        
        Args:
            cumulant_data: Cumulant values array
        
        Returns:
            Estimated spectral radius (float)
        """
        if len(cumulant_data) == 0:
            return 0.0
        
        # Spectral radius ~ max(|C|) / (1 + ||C||)
        max_val = np.max(np.abs(cumulant_data))
        norm = np.linalg.norm(cumulant_data)
        
        if norm == 0:
            return max_val
        
        return max_val / (1.0 + norm)
