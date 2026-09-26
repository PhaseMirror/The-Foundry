"""
PIRTM Layer-II: QuTiP Multi-Particle Visualization.

Visualizes empirical contraction ratios and spectral properties of the 
Fock-lifted update operator in truncated many-body space.

This tool helps validate the PIRTM-Fock bridge before formal sealing.
"""

import numpy as np
import matplotlib.pyplot as plt
try:
    import qutip as qt
except ImportError:
    print("QuTiP not found. Please install via: pip install qutip")
    exit(1)

def visualize_fock_contraction(num_modes=3, cutoff=3, lambda_m=0.5):
    """
    Simulates and visualizes the lifted PIRTM update in truncated Fock space.
    """
    print(f"Initializing {num_modes}-mode Fock space (cutoff={cutoff})...")
    
    # Dimensions: (cutoff)^num_modes
    dims = [cutoff] * num_modes
    
    # 1. Build ladder operators for each mode
    a_ops = [qt.tensor([qt.destroy(cutoff) if i == j else qt.identity(cutoff) 
                        for j in range(num_modes)]) 
             for i in range(num_modes)]
    
    # 2. Lifted Number Operator N = sum a_p^\dagger a_p
    N_op = sum(a.dag() * a for a in a_ops)
    
    # 3. Simulate a contractive Layer-I operator (e.g., linear decay Xi)
    # For visualization, we use a simple diagonal decay
    Xi_diag = np.linspace(0.2, 0.4, num_modes)
    Xi_op = sum(Xi_diag[i] * a_ops[i].dag() * a_ops[i] for i in range(num_modes))
    
    # 4. Lifted Update Operator T_lift = (1 - lambda_m)I + lambda_m * Xi
    # Note: In real PIRTM this involves many-body interactions
    I = qt.tensor([qt.identity(cutoff)] * num_modes)
    T_lift = (1 - lambda_m) * I + lambda_m * Xi_op
    
    # 5. Iterative empirical contraction check
    psi = qt.rand_ket(cutoff**num_modes, dims=dims)
    psi_star = qt.basis(cutoff**num_modes, 0) # Vacuum as fixed point for pure decay
    psi_star.dims = [dims, [1]*num_modes]
    
    ratios = []
    current_psi = psi
    
    print("Running iterations...")
    for t in range(20):
        prev_dist = (current_psi - psi_star).norm()
        next_psi = T_lift * current_psi
        next_psi = next_psi / next_psi.norm() # Normalize to simulate projection P
        next_dist = (next_psi - psi_star).norm()
        
        ratios.append(next_dist / prev_dist if prev_dist > 1e-10 else 0)
        current_psi = next_psi

    # --- Plotting ---
    fig, axes = plt.subplots(1, 2, figsize=(12, 5))
    
    # Plot 1: Contraction Ratios
    axes[0].plot(ratios, 'o-', label="Empirical Ratio")
    axes[0].axhline(y=1 - lambda_m * (1 - max(Xi_diag)), color='r', linestyle='--', 
                    label="Theoretical Bound c(lambda_m)")
    axes[0].set_title("Empirical Contraction Ratio (Fock Space)")
    axes[0].set_xlabel("Iteration t")
    axes[0].set_ylabel("||X_{t+1}-X*|| / ||X_t-X*||")
    axes[0].legend()
    axes[0].grid(True)
    
    # Plot 2: Spectrum of Lifted Operator
    evals = T_lift.eigenenergies()
    axes[1].hist(evals, bins=20, color='skyblue', edgecolor='black')
    axes[1].axvline(x=1.0, color='r', linestyle=':', label="Stability Limit")
    axes[1].set_title("Spectrum of Lifted Update Operator")
    axes[1].set_xlabel("Eigenvalue Magnitude")
    axes[1].set_ylabel("Density")
    axes[1].legend()
    
    plt.tight_layout()
    plt.savefig("fock_contraction_viz.png")
    print("Visualization saved to fock_contraction_viz.png")

if __name__ == "__main__":
    visualize_fock_contraction()
