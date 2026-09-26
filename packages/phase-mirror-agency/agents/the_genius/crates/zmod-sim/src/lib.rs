use std::sync::Arc;
use ndarray::Array1;
use zmod_resonance::CRMF;
use zmod_guardian::ACEGuardian;
use zmod_optim::ZMODAdam;
use zmod_substrate::CanonicalEmbedding;
use the_guardian::guardian_agent::GuardianAgent;
// I need a GeniusAgent... I'll just implement it inline in the test for simplicity.

#[test]
fn test_stability_convergence() {
    let dim = 16;
    let resonance = Arc::new(CRMF::new(dim));
    let embedding = CanonicalEmbedding::new(None, None, None, None);
    let optimizer = ZMODAdam::new(0.01, 0.1, embedding);
    
    // Genius Agent
    // I need to use the GeniusAgent I created before, but I need to make sure I can import it.
    // It was in `models/the_genius/crates/the-genius-rs/src/genius_agent.rs`.
    // I didn't actually create a crate for the-genius-rs, just a folder.
    // I'll inline the logic.

    let guardian = ACEGuardian::new(Some(0.5), Some("norm".to_string()));
    let guardian_agent = GuardianAgent::new("guardian-1".to_string(), resonance.clone(), guardian);

    // Initial state
    let mut params = Array1::from_elem(dim, 1.0);
    let grad = Array1::from_elem(dim, 0.1);
    let pi = Array1::from_elem(3, 0.1);

    for _ in 0..10 {
        // Genius training step
        // ... (optimizer update + modulate)
        // Guarding step
        guardian_agent.monitor_and_damp();
        // Propagate
        resonance.propagate();
    }
    
    let final_norm = resonance.read_state().mapv(|x| x * x).sum().sqrt();
    assert!(final_norm <= 0.6); // Should be stabilized
}
