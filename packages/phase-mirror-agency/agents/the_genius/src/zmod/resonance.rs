use std::fs::File;
use std::io::{BufRead, BufReader};
use std::path::Path;

#[derive(Debug, Clone)]
pub struct ResonanceProvider {
    pub sigma: f64,
    pub zeros: Vec<f64>,
}

impl Default for ResonanceProvider {
    fn default() -> Self {
        Self::new(None, None)
    }
}

impl ResonanceProvider {
    pub fn new(zeros_path: Option<&str>, sigma: Option<f64>) -> Self {
        let sig = sigma.unwrap_or(0.1);
        let zeros = if let Some(path) = zeros_path {
            if Path::new(path).exists() {
                let mut z = Vec::new();
                if let Ok(file) = File::open(path) {
                    let reader = BufReader::new(file);
                    for line in reader.lines() {
                        if let Ok(line_str) = line {
                            let trimmed = line_str.trim();
                            if !trimmed.is_empty() {
                                if let Ok(val) = trimmed.parse::<f64>() {
                                    z.push(val);
                                }
                            }
                        }
                    }
                }
                if z.is_empty() {
                    vec![14.1347, 21.0220, 25.0108]
                } else {
                    z
                }
            } else {
                vec![14.1347, 21.0220, 25.0108]
            }
        } else {
            vec![14.1347, 21.0220, 25.0108]
        };

        ResonanceProvider { sigma: sig, zeros }
    }

    pub fn compute_resonance_kernel(&self, t: f64) -> f64 {
        if self.zeros.is_empty() {
            return 0.0;
        }
        let mut sum = 0.0;
        for &gamma in &self.zeros {
            let diff = t - gamma;
            sum += (- (diff * diff) / (2.0 * self.sigma * self.sigma)).exp();
        }
        sum / self.zeros.len() as f64
    }

    pub fn compute_zeta_grad(&self, _sigma_complex: f64, t: f64, param: &[f64]) -> Vec<f64> {
        if self.zeros.is_empty() || param.is_empty() {
            return vec![0.0; param.len()];
        }
        let mut dR_dt = 0.0;
        let sig_sq = self.sigma * self.sigma;
        for &gamma in &self.zeros {
            let diff = t - gamma;
            let kernel_val = (- (diff * diff) / (2.0 * sig_sq)).exp();
            dR_dt += kernel_val * (-diff / sig_sq);
        }
        dR_dt /= self.zeros.len() as f64;

        let n = param.len() as f64;
        param.iter().map(|&theta| dR_dt * (2.0 / n) * theta).collect()
    }
}
