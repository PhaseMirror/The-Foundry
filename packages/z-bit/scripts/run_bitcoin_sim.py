import numpy as np
import json
from zrsd.fock.bridge_link import FockZRSDBridge
from zrsd.oracle import Sha256Oracle, NonceDecoder
from zrsd.bitcoin_simulation import run_bitcoin_simulation
from zrsd.attestation import PWEHVerifier

def main():
    print("=== Bitcoin ZRSD + PWEH Integrated Simulation ===")
    
    # 1. Setup Bridge
    print("Setting up Fock-ZRSD Bridge...")
    primes = [2, 3, 5, 7, 11] # 5 primes -> dim 32
    bridge = FockZRSDBridge(primes=primes)
    
    # 2. Setup Oracle
    print("Setting up SHA-256 Oracle...")
    prefix = b"bitcoin-header-block-prefix"
    # Target with 4 leading zero bits (easy)
    target = 0x0FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF
    oracle = Sha256Oracle(prefix, target)
    decoder = NonceDecoder(bridge.dim, nonce_offset=5000)
    
    # 3. Simulation Config
    config = {
        "steps": 50,
        "dt": 0.1,
        "run_id": "test-bitcoin-sim-001",
        "oracle_strength": 0.2,
        "tunneling_strength": 0.05,
        "mode": "true", # true zeta zeros
        "amplitudes": 0.8
    }
    
    # 4. Initial State (Vacuum)
    rho0 = np.zeros((bridge.dim, bridge.dim), dtype=complex)
    rho0[0, 0] = 1.0
    
    # 5. Run Simulation
    print(f"Running simulation for {config['steps']} steps...")
    df = run_bitcoin_simulation(bridge, rho0, oracle, decoder, config)
    
    # 6. Verify Results
    print(f"Simulation complete. Final Oracle Score: {df['oracle_score'].iloc[-1]:.4f}")
    
    # 7. Verify PWEH Attestation
    print("Verifying PWEH Attestation Log...")
    pweh_log = df.attrs.get('pweh_log')
    verifier = PWEHVerifier()
    log_data = {
        "run_id": config["run_id"],
        "steps": pweh_log
    }
    
    if verifier.verify_log(log_data):
        print("SUCCESS: PWEH Log Integrity Verified.")
    else:
        print("FAILURE: PWEH Log Integrity Violation.")
        exit(1)

    # Save summary
    summary_path = "agi-os/bitcoin/simulation_summary.json"
    with open(summary_path, "w") as f:
        json.dump({
            "run_id": config["run_id"],
            "final_score": float(df["oracle_score"].iloc[-1]),
            "best_nonce": int(df.loc[df["oracle_score"].idxmin(), "nonce"]),
            "best_score": float(df["oracle_score"].min())
        }, f, indent=2)
    print(f"Summary saved to {summary_path}")

if __name__ == "__main__":
    main()
