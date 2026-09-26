use ndarray::ArrayView1;
use zmod_resonance::ResonanceField;
use zmod_optim::ZMODAdam;
use std::sync::Arc;

pub struct GeniusAgent {
    pub resonance: Arc<ResonanceField>,
    pub optimizer: ZMODAdam,
    pub id: String,
}

impl GeniusAgent {
    pub fn new(id: String, resonance: Arc<ResonanceField>, optimizer: ZMODAdam) -> Self {
        Self { id, resonance, optimizer, id }
    }

    pub fn train_step(&mut self, param_id: &str, mut param: ndarray::ArrayViewMut1<f64>, grad: ArrayView1<f64>, pi: ArrayView1<f64>) {
        // 1. Read substrate (the resonance field)
        let state = self.resonance.read_state();
        
        // 2. Perform optimization step using ZMODAdam
        // The optimizer integrates with the substrate state here.
        self.optimizer.step(param_id, param, grad, pi);
        
        // 3. Modulate the field with the new optimization trajectory
        // This implicitly communicates with the Guardian via the field.
        self.resonance.modulate(param.view());
        
        // 4. Propagate field state (the "Physical" step)
        self.resonance.propagate();
    }
}
