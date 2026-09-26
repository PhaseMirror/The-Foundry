import numpy as np
import pandas as pd
from typing import Dict, Any, Optional
import hashlib

from .fock.bridge_link import FockZRSDBridge
from .speculative.zeta_data import get_zeta_zeros, generate_surrogate_zeros
from .speculative.lindblad import get_h_zeta
from .speculative.zrsd_solver import rk4_step
from .speculative.observables import expectation, purity

from .attestation import PWEHLogger
from .oracle import Sha256Oracle, NonceDecoder, OracleFeedback, TunnelingDriver

def run_bitcoin_simulation(
    bridge: FockZRSDBridge,
    rho0: np.ndarray,
    oracle: Sha256Oracle,
    decoder: NonceDecoder,
    config: Dict[str, Any]
) -> pd.DataFrame:
    """
    Enhanced simulation loop with Oracle feedback and PWEH attestation.
    """
    steps = config.get("steps", 200)
    dt = config.get("dt", 0.05)
    run_id = config.get("run_id", "bitcoin-experiment")
    
    # 1. Initialize Logger
    logger = PWEHLogger(run_id=run_id)
    
    # 2. Setup Operators
    M = bridge.get_multiplicity_operator()
    N_tot = bridge.get_number_operator()
    a_dag, a = bridge.get_creation_annihilation()
    
    # 3. Setup Feedback & Tunneling
    feedback = OracleFeedback(oracle, decoder)
    V_oracle = feedback.get_diagonal_operator()
    oracle_strength = config.get("oracle_strength", 0.1)
    
    tunneling = TunnelingDriver(bridge.dim)
    H_tunnel = tunneling.get_prime_coupled_tunneling(
        bridge,
        strength=config.get("tunneling_strength", 0.05)
    )
    
    # 4. Zeta Drive
    num_zetas = config.get("num_zetas", 3)
    mode = config.get("mode", "true")
    if mode == "true":
        gammas = get_zeta_zeros(num_zetas)
    else:
        gammas = generate_surrogate_zeros(num_zetas, seed=config.get("seed", 42))
    amps = np.full(num_zetas, config.get("amplitudes", 1.0))
    
    # 5. Dissipators
    kappas = bridge.compute_dissipator_strengths(target_c=config.get("target_c", 0.95))
    Ls = [np.sqrt(k) * op for k, op in zip(kappas, a)]
    
    # Add dynamic oracle feedback jump operators (ADR-0006)
    Ls.extend(feedback.get_lindblad_ops(strength=oracle_strength))
    
    # 6. Evolution Loop
    rho = rho0.copy()
    results = []
    
    # Extract structural bounds for cert
    core_params = bridge.extract_core_parameters()
    c_bound = core_params.get("c_bound", 1.0)
    
    for s in range(steps):
        t = s * dt
        
        # Hamiltonian: H(t) = H_zeta(t) + oracle_strength * V_oracle + H_tunnel
        def H_func(time):
            H_z = get_h_zeta(M, time, gammas, amplitudes=amps)
            return H_z + oracle_strength * V_oracle + H_tunnel
        
        # Step
        rho = rk4_step(rho, t, H_func, Ls, dt)
        
        # Lawful manifold projection
        rho = bridge.stabilize_rho_lawful(rho)
        
        # Decode current candidate
        nonce = decoder.decode_expectation(rho)
        score = oracle.score_nonce(nonce)
        
        # Compute state digest (hash of diag)
        diag = np.real(np.diag(rho))
        state_digest = hashlib.sha256(diag.tobytes()).hexdigest()
        
        # Calculate true multiplicity-weighted norm for attestation (ADR-0004)
        norm_mult = float(np.linalg.norm(M @ rho @ M, ord=2))
        lambda_m_cert = norm_mult < c_bound
        
        # PWEH Attestation
        # For prototype, we use the first prime as 'active' for logging purposes
        # In a more complex model, this would be the actual driving prime
        pweh_head = logger.log_step(
            time_t=t,
            active_prime=2, 
            operator_id="ZRSD_RK4_ORACLE",
            norm_mult=norm_mult,
            lambda_m_cert=lambda_m_cert,
            oracle_score=score,
            state_digest=state_digest,
            metadata={"nonce": int(nonce)}
        )
        
        # Telemetry
        results.append({
            't': t,
            'step': s,
            'exp_M': expectation(rho, M),
            'oracle_score': score,
            'nonce': int(nonce),
            'pweh_head': pweh_head
        })
        
    df = pd.DataFrame(results)
    # Save the full PWEH log to the dataframe attributes or as a separate file
    df.attrs['pweh_log'] = logger.get_log()
    return df
