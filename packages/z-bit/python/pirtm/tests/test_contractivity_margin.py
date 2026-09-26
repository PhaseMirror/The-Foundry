import pytest
from pirtm.core.multiplicity_core import MultiplicityCoreEngine, ProtectedEngine

class DummyParams:
    # Replace with actual MultiplicityParams or mock as needed
    pass

def test_contractivity_margin_exposed_and_consistent():
    # Setup: create a MultiplicityCoreEngine and wrap with ProtectedEngine
    core = MultiplicityCoreEngine()
    protected = ProtectedEngine(core)

    # Replace with actual valid/invalid params for your context
    valid_params = DummyParams()
    invalid_params = DummyParams()

    # These should be replaced with real logic for your engine
    # For demonstration, assume both methods exist and return numeric values
    margin_valid = protected.contractivity_margin(valid_params)
    margin_invalid = protected.contractivity_margin(invalid_params)
    is_valid = protected.validate_contractivity(valid_params)
    is_invalid = protected.validate_contractivity(invalid_params)

    # If contractivity is valid, margin should be >= 0; if invalid, < 0
    assert (margin_valid >= 0) == is_valid
    assert (margin_invalid < 0) == (not is_invalid)
