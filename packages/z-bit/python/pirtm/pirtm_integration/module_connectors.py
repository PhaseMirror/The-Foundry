"""Module-specific connectors for PIRTM integration.

Provides specialized connectors for each Top-Secret module to integrate
with PIRTM's prime-indexed tensor mathematics.
"""

import sys
import os
from typing import Dict, Optional, Any
import numpy as np

# Add module paths
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from .prime_encoder import PrimeEncoder
from .contraction_bridge import ContractionBridge
from .state_adapter import StateAdapter, PrimeStateVector


class ACFLConnector:
    """Connector between ACFL and PIRTM.
    
    Augmented Compensatory Fuzzy Logic (ACFL) uses geometric means
    and prime decompositions. This connector enhances ACFL with PIRTM's
    contraction certification.
    """
    
    def __init__(self):
        """Initialize ACFL connector."""
        self.encoder = PrimeEncoder()
        self.adapter = StateAdapter()
        self.bridge = ContractionBridge()
        
    def enhance_acfl_result(
        self,
        acfl_result: Dict,
        validate_contraction: bool = True
    ) -> Dict:
        """Enhance ACFL result with PIRTM certification.
        
        Args:
            acfl_result: Result from ACFL operator (conjunction/disjunction)
            validate_contraction: Whether to validate contraction properties
            
        Returns:
            Enhanced result with PIRTM certification metadata
        """
        enhanced = dict(acfl_result)
        
        # Convert to prime state
        prime_state = self.adapter.acfl_to_prime_state(acfl_result)
        enhanced["prime_state"] = prime_state.to_dict()
        
        if validate_contraction and "prime_decomposition" in acfl_result:
            # Create operator from prime decomposition
            operator = self.adapter.create_operator_from_primes(
                acfl_result["prime_decomposition"]
            )
            
            # Certify contraction
            is_stable, radius, metadata = self.bridge.certify_convergence(
                operator=operator,
                state=prime_state.vector,
                prime_decomposition=acfl_result["prime_decomposition"]
            )
            
            enhanced["pirtm_certification"] = {
                "is_stable": is_stable,
                "spectral_radius": radius,
                "metadata": metadata,
            }
        
        return enhanced
    
    def pirtm_weighted_conjunction(
        self,
        inputs: list,
        prime_weights: Optional[Dict[int, float]] = None
    ) -> Dict:
        """ACFL conjunction enhanced with PIRTM prime weighting.
        
        Args:
            inputs: Input values for conjunction
            prime_weights: Optional prime-based weights
            
        Returns:
            ACFL result with PIRTM prime decomposition
        """
        from acfl.operators import standard_conjunction
        
        # Compute standard conjunction
        result = standard_conjunction(inputs)
        result_dict = {
            "value": result.value,
            "operator": result.operator,
            "arity": result.arity,
        }
        
        # Add prime decomposition
        if prime_weights:
            result_dict["prime_decomposition"] = prime_weights
        else:
            # Create default prime decomposition
            num_inputs = len(inputs)
            result_dict["prime_decomposition"] = self.encoder.decompose_to_primes(
                result.value,
                num_components=min(num_inputs, 5)
            )
        
        return self.enhance_acfl_result(result_dict)


class CRMFConnector:
    """Connector between CRMF and PIRTM.
    
    Certified Resonant Multiplicity Field (CRMF) provides contraction
    certificates. This connector upgrades CRMF with PIRTM's certified
    recurrence dynamics.
    """
    
    def __init__(self):
        """Initialize CRMF connector."""
        self.adapter = StateAdapter()
        self.bridge = ContractionBridge()
        
    def upgrade_certificate(
        self,
        crmf_certificate: Dict,
        operator_field: Optional[np.ndarray] = None
    ) -> Dict:
        """Upgrade CRMF certificate with PIRTM certification.
        
        Args:
            crmf_certificate: CRMF ContractionCertificate dict
            operator_field: Optional operator field for analysis
            
        Returns:
            Upgraded certificate with PIRTM analysis
        """
        # Convert to prime state
        prime_state = self.adapter.crmf_to_prime_state(
            crmf_certificate,
            operator_field
        )
        
        upgraded = dict(crmf_certificate)
        upgraded["pirtm_prime_state"] = prime_state.to_dict()
        
        if operator_field is not None:
            # Run PIRTM step for validation
            state_vector = self.adapter.prime_state_to_pirtm(prime_state)
            next_state, pirtm_cert = self.bridge.pirtm_step_to_crmf(
                x0=state_vector,
                operator=operator_field,
                trace_id=crmf_certificate.get("trace_id", "unknown")
            )
            
            upgraded["pirtm_validation"] = pirtm_cert
            upgraded["pirtm_next_state"] = next_state.tolist()
        
        return upgraded
    
    def create_from_pirtm(
        self,
        trace_id: str,
        operator: np.ndarray,
        state: np.ndarray
    ) -> Dict:
        """Create CRMF certificate directly from PIRTM step.
        
        Args:
            trace_id: Trace identifier
            operator: System operator
            state: Current state
            
        Returns:
            CRMF-compatible certificate from PIRTM
        """
        _, crmf_cert = self.bridge.pirtm_step_to_crmf(
            x0=state,
            operator=operator,
            trace_id=trace_id
        )
        
        return crmf_cert


class CCREConnector:
    """Connector between CCRE and PIRTM.
    
    Certified Convergent Resonance Envelope (CCRE) manages drift tracking
    and resonance guards. This connector integrates PIRTM's prime-indexed
    dynamics with CCRE's stability monitoring.
    """
    
    def __init__(self):
        """Initialize CCRE connector."""
        self.encoder = PrimeEncoder()
        self.bridge = ContractionBridge()
        
    def prime_encode_resonance(
        self,
        resonance_state: Dict
    ) -> Dict:
        """Encode CCRE resonance state with prime indices.
        
        Args:
            resonance_state: CCRE resonance state dictionary
            
        Returns:
            Prime-encoded resonance state
        """
        # Extract key resonance parameters
        drift_level = resonance_state.get("drift_level", 0.0)
        guard_active = resonance_state.get("guard_active", False)
        witness_data = resonance_state.get("witness_data", {})
        
        # Create prime decomposition for resonance
        prime_decomp = {
            2: drift_level,                        # p=2: drift magnitude
            3: 1.0 if guard_active else 0.0,      # p=3: guard state
            5: len(witness_data) / 10.0,          # p=5: witness density
        }
        
        encoded = dict(resonance_state)
        encoded["prime_decomposition"] = prime_decomp
        encoded["prime_encoding_version"] = "0.1.0"
        
        return encoded
    
    def validate_resonance_stability(
        self,
        resonance_state: Dict,
        operator: Optional[np.ndarray] = None
    ) -> Dict:
        """Validate CCRE resonance stability using PIRTM.
        
        Args:
            resonance_state: CCRE resonance state
            operator: Optional operator for stability check
            
        Returns:
            Validation results with PIRTM certification
        """
        encoded = self.prime_encode_resonance(resonance_state)
        
        if operator is not None:
            # Create state vector from prime decomposition
            primes = list(encoded["prime_decomposition"].keys())
            state = np.array([encoded["prime_decomposition"][p] for p in primes])
            
            # Certify convergence
            is_stable, radius, metadata = self.bridge.certify_convergence(
                operator=operator,
                state=state,
                prime_decomposition=encoded["prime_decomposition"]
            )
            
            validation = {
                "pirtm_certified": is_stable,
                "spectral_radius": radius,
                "stability_metadata": metadata,
                "prime_encoded_state": encoded,
            }
        else:
            validation = {
                "pirtm_certified": None,
                "message": "No operator provided for validation",
                "prime_encoded_state": encoded,
            }
        
        return validation


class DHTConnector:
    """Connector between DHT and PIRTM.
    
    Digital Health Tracker (DHT) manages state evolution. This connector
    integrates PIRTM's certified dynamics with DHT's state engine.
    """
    
    def __init__(self):
        """Initialize DHT connector."""
        self.adapter = StateAdapter()
        self.bridge = ContractionBridge()
        
    def pirtm_step_evolution(
        self,
        dht_state: Dict,
        spectral_radius: float,
        prime_decomposition: Dict[int, float]
    ) -> Dict:
        """Evolve DHT state using PIRTM certified step.
        
        Args:
            dht_state: Current DHT state
            spectral_radius: System spectral radius
            prime_decomposition: Prime decomposition of operator
            
        Returns:
            Updated DHT state with PIRTM certification
        """
        # Convert DHT state to prime state vector
        prime_state = self.adapter.dht_to_prime_state(dht_state)
        
        # Create operator from prime decomposition
        operator = self.adapter.create_operator_from_primes(
            prime_decomposition,
            dim=prime_state.dimension
        )
        
        # Execute PIRTM step
        state_vector = self.adapter.prime_state_to_pirtm(prime_state)
        next_state, cert = self.bridge.pirtm_step_to_crmf(
            x0=state_vector,
            operator=operator,
            trace_id=dht_state.get("trace_id", "dht_evolution")
        )
        
        # Update DHT state
        updated_dht = dict(dht_state)
        updated_dht["drift_level"] = cert["spectral_radius"]
        updated_dht["crmf_decomposition"] = prime_decomposition
        updated_dht["pirtm_state"] = next_state.tolist()
        updated_dht["pirtm_certificate"] = cert
        updated_dht["witness_count"] = updated_dht.get("witness_count", 0) + 1
        
        return updated_dht
    
    def certify_dht_trajectory(
        self,
        state_history: list,
        prime_decomposition: Dict[int, float]
    ) -> Dict:
        """Certify entire DHT state trajectory using PIRTM.
        
        Args:
            state_history: List of DHT states over time
            prime_decomposition: System prime decomposition
            
        Returns:
            Trajectory certification report
        """
        if not state_history:
            return {"certified": False, "reason": "Empty history"}
        
        # Convert all states to prime vectors
        prime_states = [
            self.adapter.dht_to_prime_state(state)
            for state in state_history
        ]
        
        # Compute trajectory stability metrics
        drift_values = [state.get("drift_level", 0.0) for state in state_history]
        max_drift = max(drift_values)
        avg_drift = sum(drift_values) / len(drift_values)
        
        # Check if trajectory is contracting
        is_contracting = all(
            drift_values[i+1] <= drift_values[i]
            for i in range(len(drift_values) - 1)
        )
        
        certification = {
            "certified": max_drift < 1.0 and is_contracting,
            "trajectory_length": len(state_history),
            "max_drift": max_drift,
            "avg_drift": avg_drift,
            "is_contracting": is_contracting,
            "prime_decomposition": prime_decomposition,
            "prime_states_count": len(prime_states),
        }
        
        return certification
