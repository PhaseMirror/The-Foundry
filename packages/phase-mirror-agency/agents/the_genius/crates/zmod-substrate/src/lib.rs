use ndarray::{Array1, ArrayView1};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MultiplicityCell {
    pub prime_index: f64,
    pub hidden_dim: usize,
    pub state: Array1<f64>,
    pub weight: f64,
}

impl MultiplicityCell {
    pub fn new(prime_index: f64, hidden_dim: usize) -> Self {
        MultiplicityCell {
            prime_index,
            hidden_dim,
            state: Array1::zeros(hidden_dim),
            weight: 1.0 / prime_index,
        }
    }

    pub fn update(&mut self, input: ArrayView1<f64>, recur: ArrayView1<f64>) -> ArrayView1<f64> {
        let combined = (self.weight * &input) + &recur;
        self.state = combined.mapv(|x| x.tanh());
        self.state.view()
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PIRTMSubstrate {
    pub primes: Vec<usize>,
    pub cells: HashMap<usize, MultiplicityCell>,
    pub hidden_dim: usize,
}

impl PIRTMSubstrate {
    pub fn new(primes: Option<Vec<usize>>, hidden_dim: usize) -> Self {
        let p_list = primes.unwrap_or_else(|| vec![2, 3, 5, 7, 11]);
        let mut cells = HashMap::new();
        for &p in &p_list {
            cells.insert(p, MultiplicityCell::new(p as f64, hidden_dim));
        }
        PIRTMSubstrate {
            primes: p_list,
            cells,
            hidden_dim,
        }
    }

    pub fn forward(&mut self, x: ArrayView1<f64>) -> Vec<Array1<f64>> {
        let mut outputs = Vec::new();
        let mut recur_sum = Array1::zeros(self.hidden_dim);
        for &p in &self.primes {
            if let Some(cell) = self.cells.get_mut(&p) {
                let cell_out = cell.update(x, recur_sum.view()).to_owned();
                recur_sum = cell_out.clone();
                outputs.push(cell_out);
            }
        }
        outputs
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CanonicalEmbedding {
    pub sigma_0: f64,
    pub a: f64,
    pub phi_max: f64,
    pub primes: Vec<f64>,
    pub log_primes: Vec<f64>,
}

impl CanonicalEmbedding {
    pub fn new(
        sigma_0: Option<f64>,
        a: Option<f64>,
        phi_max: Option<f64>,
        primes: Option<Vec<f64>>,
    ) -> Self {
        let p = primes.unwrap_or_else(|| vec![2.0, 3.0, 5.0]);
        let lp = p.iter().map(|&x| x.ln()).collect();
        CanonicalEmbedding {
            sigma_0: sigma_0.unwrap_or(0.5),
            a: a.unwrap_or(1.0),
            phi_max: phi_max.unwrap_or(10.0),
            primes: p,
            log_primes: lp,
        }
    }

    pub fn compute_phi_tilde(&self, theta: ArrayView1<f64>) -> f64 {
        if theta.is_empty() {
            return 0.0;
        }
        let norm_sq = theta.mapv(|x| x * x).sum();
        let phi = norm_sq / theta.len() as f64;
        phi.min(self.phi_max)
    }

    pub fn embed(&self, theta: ArrayView1<f64>, pi: ArrayView1<f64>) -> (f64, f64) {
        let phi_tilde = self.compute_phi_tilde(theta);
        let multiplicity_sum: f64 = pi.iter()
            .zip(self.log_primes.iter())
            .take(pi.len())
            .map(|(&pi_val, &log_p)| pi_val * log_p)
            .sum();
        let t = self.a * phi_tilde + multiplicity_sum;
        (self.sigma_0, t)
    }
}
