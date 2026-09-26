import argparse
import sys
import os
import json
import numpy as np
from typing import List, Dict, Any, Optional

from pirtm.transpiler.pirtm_link import PIRTMLinker
from pirtm.transpiler.pirtm_link_xi import (
    link_with_xi_execution,
    ModuleNode,
    format_verification_report,
)

def main(argv: List[str] = None) -> int:
    parser = argparse.ArgumentParser(
        prog="pirtm link",
        description="PIRTM Linker: network-wide contractivity and entanglement verification."
    )
    
    parser.add_argument(
        "--coupling", "-c",
        type=str,
        required=True,
        help="Path to coupling.json configuration"
    )
    
    parser.add_argument(
        "--check-entanglement",
        action="store_true",
        help="Run ADR-021 Phase 2 Ξ(t) entanglement verification"
    )
    
    parser.add_argument(
        "--link-time",
        type=float,
        default=1.0,
        help="Time parameter for Ξ(t) evolution (default: 1.0)"
    )
    
    parser.add_argument(
        "--verify-all",
        action="store_true",
        help="Verify all sessions in the coupling configuration"
    )

    args = parser.parse_args(argv if argv is not None else sys.argv[1:])
    
    try:
        linker = PIRTMLinker(args.coupling)
        
        # Pass 1: Name Resolution
        linker.pass1_name_resolution()
        
        # Pass 2: Commitment Crosscheck
        linker.pass2_commitment_crosscheck()
        
        # Pass 3: Matrix Construction
        coupling_info = linker.pass3_matrix_construction()
        
        # Entanglement Check (ADR-021)
        if args.check_entanglement:
            print("\n" + "=" * 50)
            print("PIRTM Linker: ADR-021 Entanglement Verification")
            print("=" * 50 + "\n")
            
            all_passed = True
            for session_name, session_data in linker.sessions.items():
                print(f"Verifying session: {session_name}...")
                
                # Extract modules for this session
                session_modules = {}
                module_names = session_data["modules"]
                for m_name in module_names:
                    m_key = f"{session_name}:{m_name}"
                    m_info = linker.modules[m_key]
                    session_modules[m_info["prime_index"]] = ModuleNode(
                        prime_index=m_info["prime_index"],
                        epsilon=m_info["epsilon"],
                        op_norm_T=m_info["op_norm_T"]
                    )
                
                # Extract sub-matrix for this session
                offset, size = coupling_info["mapping"][session_name]
                full_matrix = np.array(coupling_info["matrix"])
                session_matrix = full_matrix[offset : offset + size, offset : offset + size]
                
                # Run verification
                result = link_with_xi_execution(
                    modules=session_modules,
                    coupling_matrix=session_matrix,
                    link_time=args.link_time,
                    session_id=session_name
                )
                
                print(format_verification_report(result))
                if not result.passed:
                    all_passed = False
            
            if not all_passed:
                print("\n❌ ENTANGLEMENT VERIFICATION FAILED")
                return 1
            else:
                print("\n✅ ENTANGLEMENT VERIFICATION PASSED")
        
        # Final contractivity check
        spectral_radius, is_contractive = linker.spectral_small_gain(coupling_info["matrix"])
        
        if is_contractive:
            print(f"\n✅ LINKING SUCCESSFUL (r={spectral_radius:.6f} < 1.0)")
            return 0
        else:
            print(f"\n❌ LINKING FAILED (r={spectral_radius:.6f} ≥ 1.0)")
            return 1
            
    except Exception as e:
        print(f"Error during linking: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        return 1

if __name__ == "__main__":
    sys.exit(main())
