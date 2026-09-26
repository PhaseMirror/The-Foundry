#[derive(Debug, Clone)]
pub struct ACEGuardian {
    pub safety_threshold: f64,
    pub projection_type: String,
}

impl Default for ACEGuardian {
    fn default() -> Self {
        Self::new(None, None)
    }
}

impl ACEGuardian {
    pub fn new(safety_threshold: Option<f64>, projection_type: Option<String>) -> Self {
        ACEGuardian {
            safety_threshold: safety_threshold.unwrap_or(1.0),
            projection_type: projection_type.unwrap_or_else(|| "norm".to_string()),
        }
    }

    pub fn project(&self, weights: &[f64]) -> Vec<f64> {
        if weights.is_empty() {
            return Vec::new();
        }

        if self.projection_type == "norm" {
            let norm = self.compute_norm(weights);
            if norm > self.safety_threshold {
                return weights.iter().map(|&w| w * (self.safety_threshold / norm)).collect();
            }
        } else if self.projection_type == "spectral" {
            let len = weights.len();
            let n = (len as f64).sqrt() as usize;
            if n * n == len {
                let mut matrix = vec![vec![0.0; n]; n];
                for i in 0..n {
                    for j in 0..n {
                        matrix[i][j] = weights[i * n + j];
                    }
                }
                
                if let Some(radius) = self.power_iteration(&matrix, 100, 1e-6) {
                    if radius > self.safety_threshold {
                        return weights.iter().map(|&w| w * (self.safety_threshold / radius)).collect();
                    }
                    return weights.to_vec();
                }
            }
            
            // Fallback to norm projection if not square or power iteration fails
            let norm = self.compute_norm(weights);
            if norm > self.safety_threshold {
                return weights.iter().map(|&w| w * (self.safety_threshold / norm)).collect();
            }
        }

        weights.to_vec()
    }

    pub fn verify_contraction(&self, w_old: &[f64], w_new: &[f64]) -> bool {
        self.compute_norm(w_new) <= self.compute_norm(w_old)
    }

    fn compute_norm(&self, x: &[f64]) -> f64 {
        x.iter().map(|&val| val * val).sum::<f64>().sqrt()
    }

    fn power_iteration(&self, matrix: &[Vec<f64>], max_iter: usize, tol: f64) -> Option<f64> {
        let n = matrix.len();
        if n == 0 {
            return None;
        }
        let mut v = vec![1.0 / (n as f64).sqrt(); n];
        let mut last_lambda = 0.0;
        
        for _ in 0..max_iter {
            let mut w = vec![0.0; n];
            for i in 0..n {
                for j in 0..n {
                    w[i] += matrix[i][j] * v[j];
                }
            }
            
            let w_norm = w.iter().map(|&x| x * x).sum::<f64>().sqrt();
            if w_norm == 0.0 {
                return Some(0.0);
            }
            
            for i in 0..n {
                v[i] = w[i] / w_norm;
            }
            
            let mut v_av = 0.0;
            for i in 0..n {
                let mut av_i = 0.0;
                for j in 0..n {
                    av_i += matrix[i][j] * v[j];
                }
                v_av += v[i] * av_i;
            }
            
            if (v_av - last_lambda).abs() < tol {
                return Some(v_av.abs());
            }
            last_lambda = v_av;
        }
        
        Some(last_lambda.abs())
    }
}
