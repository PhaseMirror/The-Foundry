use ndarray::{Array1, Array2};
use zmod_substrate::{PIRTMSubstrate, CanonicalEmbedding};
use zmod_optim::ZMODAdam;
use zmod_guardian::ACEGuardian;
use std::sync::Arc;

fn main() -> anyhow::Result<()> {
    // 1. Setup Data (Mocks for substrate interaction)
    let hidden_dim = 64;
    let primes = vec![2, 3, 5];
    let mut substrate = PIRTMSubstrate::new(Some(primes), hidden_dim);
    
    // 2. Setup Model & Layers
    let guardian = ACEGuardian::new(Some(5.0), Some("norm".to_string()));
    let embedding = CanonicalEmbedding::new(None, None, None, None);
    
    // 3. Setup Optimizer (ZMODAdam)
    let mut optimizer = ZMODAdam::new(1e-2, 0.1, embedding);
    optimizer.init_param_state("fc_in", hidden_dim);
    
    // 4. Mock Training Loop
    let mut param = Array1::from_elem(hidden_dim, 0.1);
    let grad = Array1::from_elem(hidden_dim, 0.01);
    let pi = Array1::from_elem(3, 0.1);
    
    println!("Starting Rust-native training loop...");
    for batch_idx in 0..10 {
        // Optimizer step
        optimizer.step("fc_in", param.view_mut(), grad.view(), pi.view());
        
        // Guardian projection
        let projected = guardian.project(param.view());
        param.assign(&projected);
        
        // Substrate update
        let _features = substrate.forward(param.view());
        
        println!("Batch {}: Norm {}", batch_idx, param.mapv(|x| x*x).sum().sqrt());
    }
    
    println!("Scenario Complete.");
    Ok(())
}
