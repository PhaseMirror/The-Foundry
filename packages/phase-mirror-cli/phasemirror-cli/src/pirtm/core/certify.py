import sys
import json

def certify_pro_state(witness_path="artifacts/unified_witness_final.json"):
    """
    Executes the 4-stage Spectral Veto (ADR-028).
    Exits with 110-113 on failure.
    """
    try:
        with open(witness_path, 'r') as f:
            witness = json.load(f)
    except FileNotFoundError:
        print(f"FAIL: Witness artifact missing at {witness_path}")
        sys.exit(1)

    # 1. Fetch Spectral Shard
    # In a real system, the bridge would have been called already to populate this.
    spectral = witness.get("SpectralWitness", {})
    if not spectral:
        # Fallback for stub: check if we can generate it from a bridge if not present
        from z_mos.bridge import ZetaBridge
        try:
            bridge = ZetaBridge()
            spectral = bridge.emit_witness()
        except Exception as e:
            print(f"FAIL: Spectral witness could not be generated: {e}")
            sys.exit(110)

    # --- 4-STAGE VETO LOGIC ---

    # Stage 1: Banach Stability (q < 1 - epsilon)
    # We'll use lambda_m from drift_report as a proxy for q
    q = 1.0 - witness.get("lambda_m", 1.0)
    epsilon = 0.05
    if q >= 1.0 - epsilon:
        print(f"VETO [Stage 1]: Banach instability detected (q={q:.4f} >= {1.0-epsilon})")
        sys.exit(110)

    # Stage 2: Production Scale (N_0 >= 64)
    n_0 = spectral.get("n_0", 0)
    if n_0 < 64:
        print(f"VETO [Stage 2]: Insufficient production scale (N_0={n_0} < 64)")
        sys.exit(111)

    # Stage 3: Spectral Gap Guard (Delta_pz > N_0^-(0.5 + epsilon))
    # For the stub, we'll check if zero_spacings has any values too small
    zero_spacings = spectral.get("zero_spacings", [])
    min_gap = min(zero_spacings) if zero_spacings else 0
    threshold = n_0 ** (-0.55)
    if min_gap < threshold:
        print(f"VETO [Stage 3]: Spectral gap violation (Delta_pz={min_gap:.6f} < {threshold:.6f})")
        sys.exit(112)

    # Stage 4: Tier 4 Recovery (GUE Compliance)
    gue_stats = spectral.get("gue_stats", {})
    if not gue_stats.get("is_gue_compliant", False):
        print(f"VETO [Stage 4]: GUE non-compliance (Actual Var: {gue_stats.get('actual_variance', 0):.4f})")
        sys.exit(113)

    print("SUCCESS: Pro-tier spectral certification achieved.")
    return True

if __name__ == "__main__":
    # Allow passing path as arg
    path = sys.argv[1] if len(sys.argv) > 1 else "artifacts/unified_witness_final.json"
    certify_pro_state(path)
