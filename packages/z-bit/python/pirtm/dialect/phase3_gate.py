"""
ADR-087 Phase 3: Type System Mirror

Phase 3 Gate: Executes the MLIR Contractivity Verification Pass.

This gate verifies that:
1. A sample MLIR file can be parsed.
2. The forward pass (type inference) completes successfully.
3. The backward pass (spectral verification) completes successfully.
4. The MLIR is deemed valid and contractive.
"""
from pirtm.mlir.verification_pass import verify_mlir_contractivity
import os

def execute_phase_3_gate() -> bool:
    print("======================================================================")
    print("ADR-087 PHASE 3 GATE: Type System Mirror")
    print("======================================================================")
    
    mlir_file_path = os.path.join(os.path.dirname(__file__), '..', 'tests', 'fixtures', 'tensor_contraction_valid.mlir')
    
    try:
        with open(mlir_file_path, 'r') as f:
            mlir_text = f.read()
        print(f"Loaded MLIR file: {mlir_file_path}")
    except FileNotFoundError:
        print(f"❌ ERROR: MLIR file not found at {mlir_file_path}")
        return False

    is_valid, types_map, errors, warnings = verify_mlir_contractivity(mlir_text)
    
    print(f"Verification Result: {'VALID' if is_valid else 'INVALID'}")
    print(f"Inferred Types: {len(types_map)}")
    print(f"Errors: {len(errors)}")
    print(f"Warnings: {len(warnings)}")

    if is_valid:
        print("\n✅ Phase 3 complete. Ready for Phase 4 (LLVM Lowering)")
        return True
    else:
        print("\n❌ Phase 3 BLOCKED. Fix errors above before proceeding.")
        for error in errors:
            print(f"  - {error}")
        return False

if __name__ == "__main__":
    execute_phase_3_gate()
