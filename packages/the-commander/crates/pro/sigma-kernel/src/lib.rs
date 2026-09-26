use serde::{Deserialize, Serialize};
use nalgebra::DVector;

/// Sigma Kernel Bilinear Form: σ(x, y) = Σ ν_p(x) * ν_p(y) * (log p)^-1
pub fn sigma_bilinear_form(x: &DVector<f64>, y: &DVector<f64>, primes: &[u64]) -> f64 {
    let n = x.len().min(y.len()).min(primes.len());
    let mut sum = 0.0;
    for i in 0..n {
        let log_p = (primes[i] as f64).ln();
        sum += x[i] * y[i] / log_p;
    }
    sum
}

/// Sigma Norm: ||x||_σ = sqrt(σ(x, x))
pub fn sigma_norm(x: &DVector<f64>, primes: &[u64]) -> f64 {
    sigma_bilinear_form(x, x, primes).sqrt()
}

/// Log-periodic memory kernel K(t, τ) for non-Markovian history convolution.
/// K(t, τ) = exp(-α * (t - τ)) * cos(ω * log(1 + (t - τ) / scale) + φ)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryKernel {
    pub alpha: f64,
    pub omega: f64,
    pub phi: f64,
    pub time_scale: f64,
}

impl Default for MemoryKernel {
    fn default() -> Self {
        MemoryKernel {
            alpha: 0.17,
            omega: 1.0,
            phi: 0.0,
            time_scale: 1.0,
        }
    }
}

impl MemoryKernel {
    pub fn compute_weight(&self, t: f64, tau: f64) -> f64 {
        let dt = t - tau;
        if dt < 0.0 {
            return 0.0;
        }
        let decay = (-self.alpha * dt).exp();
        let oscillation = (self.omega * (1.0 + dt / self.time_scale).ln() + self.phi).cos();
        decay * oscillation
    }

    pub fn convolve(&self, t: f64, history: &[DVector<f64>]) -> DVector<f64> {
        if history.is_empty() {
            return DVector::zeros(0);
        }
        let dim = history[0].len();
        let mut weighted_sum = DVector::zeros(dim);
        let mut total_weight = 0.0;

        for (tau, state) in history.iter().enumerate() {
            let weight = self.compute_weight(t, tau as f64);
            weighted_sum += state * weight;
            total_weight += weight;
        }

        if total_weight.abs() > 1e-9 {
            weighted_sum / total_weight
        } else {
            weighted_sum
        }
    }
}

/// Ward Monitor for drift detection W(t) = D_KL(ρ || ρ₀)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WardMonitor {
    pub threshold: f64,
    pub reference_state: Option<DVector<f64>>,
    pub residual_history: Vec<f64>,
}

impl WardMonitor {
    pub fn new(threshold: f64, reference_state: Option<DVector<f64>>) -> Self {
        WardMonitor {
            threshold,
            reference_state,
            residual_history: Vec::new(),
        }
    }

    pub fn compute_residual(&mut self, current_state: &DVector<f64>, reference_state: Option<&DVector<f64>>) -> f64 {
        let ref_state = reference_state.or(self.reference_state.as_ref());
        
        let ref_vec = match ref_state {
            Some(r) => r,
            None => {
                self.reference_state = Some(current_state.clone());
                return 0.0;
            }
        };

        let rho = self.normalize(current_state);
        let rho0 = self.normalize(ref_vec);

        let mut kl_div = 0.0;
        for i in 0..rho.len() {
            if rho[i] > 1e-12 {
                kl_div += rho[i] * ( (rho[i] + 1e-12) / (rho0[i] + 1e-12) ).ln();
            }
        }
        
        self.residual_history.push(kl_div);
        kl_div
    }

    fn normalize(&self, v: &DVector<f64>) -> DVector<f64> {
        let sum: f64 = v.iter().map(|x| x.abs()).sum();
        if sum > 1e-12 {
            v.map(|x| x.abs() / sum)
        } else {
            DVector::from_element(v.len(), 1.0 / v.len() as f64)
        }
    }

    pub fn is_collapsed(&self) -> bool {
        self.residual_history.last().map_or(false, |&r| r > self.threshold)
    }
}

/// Zeno Projector for state correction toward the lawful manifold.
/// ρ' = ρ₀ + (ε / W) * (ρ - ρ₀)
pub struct ZenoProjector {
    pub epsilon: f64,
}

impl ZenoProjector {
    pub fn project(&self, state: &DVector<f64>, reference: &DVector<f64>, residual: f64) -> DVector<f64> {
        if residual <= self.epsilon {
            return state.clone();
        }
        let factor = self.epsilon / residual;
        reference + (state - reference) * factor
    }
}

/// FZSKernel composes MemoryKernel, WardMonitor, and ZenoProjector.
pub struct FZSKernel {
    pub memory: MemoryKernel,
    pub monitor: WardMonitor,
    pub projector: ZenoProjector,
    pub history: Vec<DVector<f64>>,
}

impl FZSKernel {
    pub fn new(alpha: f64, epsilon: f64) -> Self {
        FZSKernel {
            memory: MemoryKernel { alpha, ..Default::default() },
            monitor: WardMonitor::new(alpha, None),
            projector: ZenoProjector { epsilon },
            history: Vec::new(),
        }
    }

    pub fn step(&mut self, current_state: &DVector<f64>) -> (DVector<f64>, f64) {
        let residual = self.monitor.compute_residual(current_state, None);
        self.history.push(current_state.clone());
        
        let ref_state = self.monitor.reference_state.as_ref().unwrap();
        let projected = self.projector.project(current_state, ref_state, residual);
        
        (projected, residual)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_sigma_bilinear() {
        let x = DVector::from_vec(vec![1.0, 1.0]);
        let y = DVector::from_vec(vec![1.0, 1.0]);
        let primes = vec![2, 3];
        let val = sigma_bilinear_form(&x, &y, &primes);
        let expected = 1.0 / 2.0f64.ln() + 1.0 / 3.0f64.ln();
        assert!((val - expected).abs() < 1e-10);
    }

    #[test]
    fn test_memory_kernel_convolve() {
        let mk = MemoryKernel::default();
        let history = vec![
            DVector::from_vec(vec![1.0]),
            DVector::from_vec(vec![2.0]),
        ];
        let res = mk.convolve(1.0, &history);
        assert!(res.len() == 1);
        assert!(res[0] > 0.0);
    }

    #[test]
    fn test_ward_monitor() {
        let mut monitor = WardMonitor::new(0.17, None);
        let state1 = DVector::from_vec(vec![0.5, 0.5]);
        let state2 = DVector::from_vec(vec![0.6, 0.4]);
        
        let res1 = monitor.compute_residual(&state1, None);
        assert_eq!(res1, 0.0);
        
        let res2 = monitor.compute_residual(&state2, None);
        assert!(res2 > 0.0);
        assert!(!monitor.is_collapsed());
    }
}
