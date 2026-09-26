import numpy as np
import pandas as pd
from zrsd.fock.bridge_link import FockZRSDBridge
from zrsd.oracle import Sha256Oracle, NonceDecoder
from zrsd.bitcoin_simulation import run_bitcoin_simulation

def run_experiment(
    bridge: FockZRSDBridge,
    oracle: Sha256Oracle,
    decoder: NonceDecoder,
    mode: str,
    seed: int,
    steps: int = 100
) -> float:
    """
    Runs a single simulation experiment and returns the best oracle score found.
    """
    config = {
        "steps": steps,
        "dt": 0.1,
        "run_id": f"benchmark-{mode}-{seed}",
        "oracle_strength": 0.2,
        "tunneling_strength": 0.05,
        "mode": mode,
        "seed": seed,
        "amplitudes": 1.0 if mode != "none" else 0.0
    }
    
    rho0 = np.zeros((bridge.dim, bridge.dim), dtype=complex)
    rho0[0, 0] = 1.0 # Start in vacuum
    
    df = run_bitcoin_simulation(bridge, rho0, oracle, decoder, config)
    return float(df["oracle_score"].min())

def run_benchmark():
    print("=== Bitcoin ZRSD Resonance Benchmark ===")
    
    primes = [2, 3, 5, 7, 11]
    bridge = FockZRSDBridge(primes=primes)
    
    prefix = b"bitcoin-header-block-prefix"
    target = 0x0FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF
    oracle = Sha256Oracle(prefix, target)
    decoder = NonceDecoder(bridge.dim, nonce_offset=10000)
    
    num_seeds = 5 # Reduced for speed in prototype
    results = []
    
    for mode in ["true", "random", "none"]:
        print(f"Testing mode: {mode}")
        for seed in range(num_seeds):
            score = run_experiment(bridge, oracle, decoder, mode, seed)
            results.append({
                "mode": mode,
                "seed": seed,
                "best_score": score
            })
            print(f"  Seed {seed}: {score:.4f}")
            
    df_results = pd.DataFrame(results)
    summary = df_results.groupby("mode")["best_score"].agg(["mean", "std", "min"])
    print("\nBenchmark Summary:")
    print(summary)
    
    # Save to CSV
    report_path = "agi-os/bitcoin/benchmark_results.csv"
    df_results.to_csv(report_path, index=False)
    print(f"\nDetailed results saved to {report_path}")

if __name__ == "__main__":
    run_benchmark()
