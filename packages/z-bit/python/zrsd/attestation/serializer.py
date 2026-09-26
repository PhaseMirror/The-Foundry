import json
from typing import Any, Dict

class CanonicalSerializer:
    """
    Handles deterministic serialization of PWEH steps for consistent hashing.
    """
    @staticmethod
    def serialize(step_data: Dict[str, Any]) -> bytes:
        """
        Serializes a dictionary to a deterministic JSON byte string.
        """
        # Ensure keys are sorted for determinism
        canonical_json = json.dumps(
            step_data, 
            sort_keys=True, 
            separators=(',', ':'),
            ensure_ascii=True
        )
        return canonical_json.encode('utf-8')
