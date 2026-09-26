import uuid
import time
from typing import Any, Dict, List, Optional
from .serializer import CanonicalSerializer
from .hash_chain import HashChain

class PWEHLogger:
    """
    The central logger for Prime-Weighted Execution Hashing.
    Orchestrates serialization, hashing, and step recording.
    """
    def __init__(self, run_id: Optional[str] = None, genesis_hash: Optional[bytes] = None):
        self.run_id = run_id or str(uuid.uuid4())
        self.chain = HashChain(genesis_hash)
        self.steps: List[Dict[str, Any]] = []
        self.serializer = CanonicalSerializer()

    def log_step(
        self, 
        time_t: float, 
        active_prime: int, 
        operator_id: str, 
        norm_mult: float, 
        lambda_m_cert: bool, 
        oracle_score: float, 
        state_digest: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> str:
        """
        Records a new step in the PWEH chain.
        Returns the new chain head hash (hex).
        """
        step_index = len(self.steps)
        
        step_data = {
            "run_id": self.run_id,
            "step_index": step_index,
            "time": time_t,
            "active_prime": active_prime,
            "operator_id": operator_id,
            "operator_norm_mult": norm_mult,
            "lambda_m_cert": lambda_m_cert,
            "oracle_score": oracle_score,
            "state_digest": state_digest
        }
        
        if metadata:
            step_data["metadata"] = metadata

        # Canonicalize and Update Hash Chain
        step_bytes = self.serializer.serialize(step_data)
        new_hash = self.chain.update(step_bytes)
        
        # Store step with its hash head
        record = step_data.copy()
        record["pweh_head"] = new_hash.hex()
        self.steps.append(record)
        
        return record["pweh_head"]

    def get_log(self) -> List[Dict[str, Any]]:
        """
        Returns the complete execution log.
        """
        return self.steps

    def export_json(self) -> str:
        """
        Exports the entire log as a JSON string.
        """
        return json.dumps({
            "run_id": self.run_id,
            "genesis_head": b'\x00' * 32 if not hasattr(self.chain, 'initial_hash') else self.chain.initial_hash.hex(), # Initial hash not stored yet in HashChain, using default
            "steps": self.steps
        }, indent=2)

import json # Added missing import
