from typing import Any, Dict, List
from .serializer import CanonicalSerializer
from .hash_chain import HashChain

class PWEHVerifier:
    """
    Verifies the integrity of a PWEH log.
    """
    def __init__(self):
        self.serializer = CanonicalSerializer()

    def verify_log(self, log_data: Dict[str, Any]) -> bool:
        """
        Replays a log and verifies all hashes in the chain.
        """
        run_id = log_data.get("run_id")
        steps = log_data.get("steps", [])
        
        # Initialize chain with a default or specified genesis (defaulting to 0s for now)
        chain = HashChain()
        
        for i, step in enumerate(steps):
            # Extract step data without the pweh_head field
            step_to_verify = {k: v for k, v in step.items() if k != "pweh_head"}
            
            # Basic validation
            if step_to_verify.get("run_id") != run_id:
                print(f"Error: Step {i} has mismatched run_id")
                return False
            if step_to_verify.get("step_index") != i:
                print(f"Error: Step {i} has mismatched index")
                return False
            
            # Re-serialize and update chain
            step_bytes = self.serializer.serialize(step_to_verify)
            calculated_head = chain.update(step_bytes).hex()
            
            # Compare with stored head
            if calculated_head != step.get("pweh_head"):
                print(f"Error: Integrity violation at step {i}")
                print(f"  Stored:     {step.get('pweh_head')}")
                print(f"  Calculated: {calculated_head}")
                return False
                
        return True
