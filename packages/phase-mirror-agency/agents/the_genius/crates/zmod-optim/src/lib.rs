use ndarray::{Array1, ArrayView1, ArrayViewMut1};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use zmod_substrate::CanonicalEmbedding;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AdamState {
    pub exp_avg: Array1<f64>,
    pub exp_avg_sq: Array1<f64>,
    pub step: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ZMODAdam {
    pub lr: f64,
    pub beta1: f64,
    pub beta2: f64,
    pub eps: f64,
    pub lambda_zeta: f64,
    pub embedding: CanonicalEmbedding,
    pub states: HashMap<String, AdamState>,
}

impl ZMODAdam {
    pub fn new(lr: f64, lambda_zeta: f64, embedding: CanonicalEmbedding) -> Self {
        Self {
            lr,
            beta1: 0.9,
            beta2: 0.999,
            eps: 1e-8,
            lambda_zeta,
            embedding,
            states: HashMap::new(),
        }
    }

    /// Initializes state for a parameter if not already present.
    pub fn init_param_state(&mut self, param_id: &str, dim: usize) {
        self.states.entry(param_id.to_string()).or_insert(AdamState {
            exp_avg: Array1::zeros(dim),
            exp_avg_sq: Array1::zeros(dim),
            step: 0,
        });
    }

    pub fn step(&mut self, param_id: &str, mut param: ArrayViewMut1<f64>, grad: ArrayView1<f64>, pi: ArrayView1<f64>) {
        let state = self.states.get_mut(param_id)
            .expect("Parameter state not initialized. Call init_param_state first.");
        
        state.step += 1;
        let step_val = state.step;

        // 1. Zeta potential gradient (toy harmonic modulation)
        let (_sigma, t) = self.embedding.embed(param.view(), pi);
        let zeta_grad = param.mapv(|x| x * t.sin() * (2.0 / param.len() as f64));
        
        let combined_grad = &grad + self.lambda_zeta * &zeta_grad;

        // 2. Update moments
        state.exp_avg = self.beta1 * &state.exp_avg + (1.0 - self.beta1) * &combined_grad;
        state.exp_avg_sq = self.beta2 * &state.exp_avg_sq + (1.0 - self.beta2) * &combined_grad.mapv(|x| x * x);

        // 3. Bias correction
        let bias_corr1 = 1.0 - self.beta1.powi(step_val as i32);
        let bias_corr2 = 1.0 - self.beta2.powi(step_val as i32);

        // 4. Update
        let denom = (state.exp_avg_sq.mapv(|x| x.sqrt()) / bias_corr2.sqrt()) + self.eps;
        let step_size = self.lr / bias_corr1;
        
        param -= &(step_size * &(state.exp_avg.clone() / &denom));
    }
}
