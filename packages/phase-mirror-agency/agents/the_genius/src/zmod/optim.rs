use crate::zmod::embedding::CanonicalEmbedding;
use crate::zmod::resonance::ResonanceProvider;
use std::collections::HashMap;

#[derive(Debug, Clone)]
pub struct ParameterState {
    pub exp_avg: Vec<f64>,
    pub exp_avg_sq: Vec<f64>,
    pub step: usize,
    pub pi: Vec<f64>,
}

#[derive(Debug, Clone)]
pub struct ZMODAdam {
    pub lr: f64,
    pub beta1: f64,
    pub beta2: f64,
    pub eps: f64,
    pub weight_decay: f64,
    pub lambda_zeta: f64,
    pub embedding: CanonicalEmbedding,
    pub state: HashMap<usize, ParameterState>,
}

impl ZMODAdam {
    pub fn new(
        lr: f64,
        betas: (f64, f64),
        eps: f64,
        weight_decay: f64,
        lambda_zeta: f64,
        embedding: CanonicalEmbedding,
    ) -> Self {
        ZMODAdam {
            lr,
            beta1: betas.0,
            beta2: betas.1,
            eps,
            weight_decay,
            lambda_zeta,
            embedding,
            state: HashMap::new(),
        }
    }

    pub fn step(
        &mut self,
        param_idx: usize,
        param: &mut [f64],
        grad: &[f64],
        zeta_provider: Option<&ResonanceProvider>,
    ) {
        let n = param.len();
        let state = self.state.entry(param_idx).or_insert_with(|| ParameterState {
            exp_avg: vec![0.0; n],
            exp_avg_sq: vec![0.0; n],
            step: 0,
            pi: vec![0.0; self.embedding.primes.len()],
        });

        state.step += 1;
        let step = state.step;

        // 1. Get embedding variables (sigma, t)
        let (sigma, t) = self.embedding.embed(param, &state.pi);

        // 2. Compute Zeta-Guided Gradient (ADR-020)
        let zeta_grad = if let Some(provider) = zeta_provider {
            provider.compute_zeta_grad(sigma, t, param)
        } else {
            let sin_t = t.sin();
            let n_f = n as f64;
            param.iter().map(|&theta| sin_t * (2.0 / n_f) * theta).collect::<Vec<f64>>()
        };

        // 3. Update Moments and Parameters
        let bias_correction1 = 1.0 - self.beta1.powi(step as i32);
        let bias_correction2 = 1.0 - self.beta2.powi(step as i32);

        for i in 0..n {
            let mut g = grad[i];
            if self.weight_decay != 0.0 {
                g += self.weight_decay * param[i];
            }

            // Combine task gradient with zeta potential
            let combined_g = g + self.lambda_zeta * zeta_grad[i];

            // Update moments (standard Adam logic)
            state.exp_avg[i] = self.beta1 * state.exp_avg[i] + (1.0 - self.beta1) * combined_g;
            state.exp_avg_sq[i] = self.beta2 * state.exp_avg_sq[i] + (1.0 - self.beta2) * combined_g * combined_g;

            // Denominator
            let denom = (state.exp_avg_sq[i].sqrt() / bias_correction2.sqrt()) + self.eps;
            let step_size = self.lr / bias_correction1;

            param[i] -= step_size * state.exp_avg[i] / denom;
        }
    }
}

#[derive(Debug, Clone)]
pub struct LMTuner {
    pub lambda_lm: f64,
    pub nu: f64,
    pub max_iter: usize,
}

impl Default for LMTuner {
    fn default() -> Self {
        Self::new(None, None, None)
    }
}

impl LMTuner {
    pub fn new(lambda_init: Option<f64>, nu: Option<f64>, max_iter: Option<usize>) -> Self {
        LMTuner {
            lambda_lm: lambda_init.unwrap_or(1.0),
            nu: nu.unwrap_or(2.0),
            max_iter: max_iter.unwrap_or(10),
        }
    }

    pub fn step<F>(
        &mut self,
        x: &[f64],
        target: &[f64],
        model_params: &mut [f64],
        model_forward: F,
    ) -> f64
    where
        F: Fn(&[f64], &[f64]) -> Vec<f64>,
    {
        let n_params = model_params.len();
        if n_params == 0 {
            return 0.0;
        }

        for _ in 0..self.max_iter {
            let residuals = model_forward(x, model_params);
            let n_outputs = residuals.len();
            
            let mut J = vec![vec![0.0; n_params]; n_outputs];
            let eps = 1e-6;
            
            for j in 0..n_params {
                let orig_val = model_params[j];
                model_params[j] = orig_val + eps;
                let perturbed = model_forward(x, model_params);
                model_params[j] = orig_val;
                
                for i in 0..n_outputs {
                    J[i][j] = (perturbed[i] - residuals[i]) / eps;
                }
            }

            let r: Vec<f64> = residuals.iter().zip(target.iter()).map(|(&res, &targ)| res - targ).collect();

            // JTJ = J^T * J
            let mut JTJ = vec![vec![0.0; n_params]; n_params];
            for i in 0..n_params {
                for j in 0..n_params {
                    let mut sum = 0.0;
                    for k in 0..n_outputs {
                        sum += J[k][i] * J[k][j];
                    }
                    JTJ[i][j] = sum;
                }
            }

            // JTr = J^T * r
            let mut JTr = vec![0.0; n_params];
            for i in 0..n_params {
                let mut sum = 0.0;
                for k in 0..n_outputs {
                    sum += J[k][i] * r[k];
                }
                JTr[i] = sum;
            }

            let mut success = false;
            let mut inner_loop_count = 0;
            
            while !success && inner_loop_count < 10 {
                inner_loop_count += 1;
                let mut A = JTJ.clone();
                for i in 0..n_params {
                    A[i][i] += self.lambda_lm;
                }

                let rhs: Vec<f64> = JTr.iter().map(|&val| -val).collect();

                if let Some(delta) = solve_linear_system(&A, &rhs) {
                    let mut new_params = model_params.to_vec();
                    for i in 0..n_params {
                        new_params[i] += delta[i];
                    }

                    let new_residuals = model_forward(x, &new_params);
                    let new_error: f64 = new_residuals.iter().zip(target.iter()).map(|(&res, &targ)| (res - targ).powi(2)).sum();
                    let old_error: f64 = r.iter().map(|&val| val.powi(2)).sum();

                    if new_error < old_error {
                        for i in 0..n_params {
                            model_params[i] = new_params[i];
                        }
                        self.lambda_lm /= self.nu;
                        success = true;
                    } else {
                        self.lambda_lm *= self.nu;
                    }
                } else {
                    self.lambda_lm *= self.nu;
                }
            }

            if self.lambda_lm > 1e10 {
                break;
            }
        }

        let final_residuals = model_forward(x, model_params);
        final_residuals.iter().zip(target.iter()).map(|(&res, &targ)| (res - targ).powi(2)).sum()
    }
}

fn solve_linear_system(a: &[Vec<f64>], b: &[f64]) -> Option<Vec<f64>> {
    let n = b.len();
    let mut mat = a.to_vec();
    let mut vec = b.to_vec();
    for i in 0..n {
        let mut max_row = i;
        for r in (i + 1)..n {
            if mat[r][i].abs() > mat[max_row][i].abs() {
                max_row = r;
            }
        }
        mat.swap(i, max_row);
        vec.swap(i, max_row);
        if mat[i][i].abs() < 1e-12 {
            return None;
        }
        for r in (i + 1)..n {
            let factor = mat[r][i] / mat[i][i];
            for c in i..n {
                mat[r][c] -= factor * mat[i][c];
            }
            vec[r] -= factor * vec[i];
        }
    }
    let mut x = vec![0.0; n];
    for i in (0..n).rev() {
        let mut sum = 0.0;
        for j in (i + 1)..n {
            sum += mat[i][j] * x[j];
        }
        x[i] = (vec[i] - sum) / mat[i][i];
    }
    Some(x)
}
