import numpy as np
import matplotlib.pyplot as plt
import qutip as qt


def op_norm(qobj):
    return float(np.linalg.svd(qobj.full(), compute_uv=False)[0])


def rand_ket(dim, seed=None):
    rng = np.random.default_rng(seed)
    v = rng.normal(size=dim) + 1j * rng.normal(size=dim)
    v = v / np.linalg.norm(v)
    return qt.Qobj(v, dims=[[dim], [1]])


def contraction_demo(cutoff=8, lambda_m=0.75, steps=20, seed=0):
    a = qt.destroy(cutoff)
    X = a + a.dag()
    G = 0.6 * X / op_norm(X)
    I = qt.qeye(cutoff)
    T = (1 - lambda_m) * I + lambda_m * G
    L_G = op_norm(G)
    c_pred = 1 - lambda_m * (1 - L_G)

    psi = rand_ket(cutoff, seed=seed)
    phi = rand_ket(cutoff, seed=seed + 1)
    d0 = (psi - phi).norm()
    ratios = []
    cur_psi, cur_phi = psi, phi
    for _ in range(steps):
        cur_psi = (T * cur_psi).unit()
        cur_phi = (T * cur_phi).unit()
        ratios.append((cur_psi - cur_phi).norm() / d0)

    return {
        'T': T,
        'G': G,
        'predicted_c': c_pred,
        'ratios': np.array(ratios),
    }


def two_mode_visualization(cutoff=6, lambda_m=0.75):
    a = qt.destroy(cutoff)
    I = qt.qeye(cutoff)
    X = a + a.dag()
    G1 = 0.55 * X / op_norm(X)
    G2 = 0.45 * X / op_norm(X)
    Gf = qt.tensor(G1, I) + qt.tensor(I, G2)
    Gf = 0.6 * Gf / op_norm(Gf)
    Tf = (1 - lambda_m) * qt.qeye([cutoff, cutoff]) + lambda_m * Gf

    fig, axes = plt.subplots(1, 2, figsize=(10, 4))
    axes[0].imshow(np.abs(Gf.full()), aspect='auto', cmap='magma')
    axes[0].set_title('Lifted operator |G_F|')
    axes[0].set_xlabel('Column')
    axes[0].set_ylabel('Row')

    evals = np.linalg.eigvals(Tf.full())
    axes[1].scatter(evals.real, evals.imag, s=20)
    axes[1].axvline(1, color='red', linestyle='--', linewidth=1)
    axes[1].set_title('Spectrum of T_F')
    axes[1].set_xlabel('Real part')
    axes[1].set_ylabel('Imag part')
    plt.tight_layout()
    plt.show()


if __name__ == '__main__':
    out = contraction_demo()
    print('Predicted contraction constant:', out['predicted_c'])
    print('Observed ratios:', out['ratios'][:5])
    plt.figure(figsize=(6,4))
    plt.plot(np.arange(1, len(out['ratios'])+1), out['ratios'], marker='o')
    plt.axhline(out['predicted_c'], color='red', linestyle='--', label='predicted c')
    plt.xlabel('Iteration')
    plt.ylabel('Distance ratio')
    plt.title('Multi-particle contraction trend')
    plt.legend()
    plt.tight_layout()
    plt.show()
    two_mode_visualization()
