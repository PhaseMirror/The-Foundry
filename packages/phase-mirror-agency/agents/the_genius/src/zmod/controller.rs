use std::collections::VecDeque;

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct MetaControllerStatus {
    pub correlation: Option<f64>,
    pub avg_norm: f64,
    pub phoenix_triggered: bool,
    pub steer_action: Option<String>,
}

#[derive(Debug, Clone)]
pub struct MetaController {
    pub window_size: usize,
    pub healthy_band: (f64, f64),
    pub veto_threshold: f64,
    pub losses: VecDeque<f64>,
    pub norms: VecDeque<f64>,
    pub history: Vec<MetaControllerStatus>,
}

impl Default for MetaController {
    fn default() -> Self {
        Self::new(None, None, None)
    }
}

impl MetaController {
    pub fn new(
        window_size: Option<usize>,
        healthy_band: Option<(f64, f64)>,
        veto_threshold: Option<f64>,
    ) -> Self {
        MetaController {
            window_size: window_size.unwrap_or(5),
            healthy_band: healthy_band.unwrap_or((2.0, 5.0)),
            veto_threshold: veto_threshold.unwrap_or(0.6),
            losses: VecDeque::new(),
            norms: VecDeque::new(),
            history: Vec::new(),
        }
    }

    pub fn update(&mut self, loss: f64, norm: f64) -> MetaControllerStatus {
        if self.losses.len() >= self.window_size {
            self.losses.pop_front();
        }
        self.losses.push_back(loss);

        if self.norms.len() >= self.window_size {
            self.norms.pop_front();
        }
        self.norms.push_back(norm);

        let correlation = self.compute_correlation();
        let avg_norm = if self.norms.is_empty() {
            0.0
        } else {
            self.norms.iter().sum::<f64>() / self.norms.len() as f64
        };

        let mut phoenix_triggered = false;
        if let Some(corr) = correlation {
            if corr > self.veto_threshold {
                phoenix_triggered = true;
            }
        }

        let status = MetaControllerStatus {
            correlation,
            avg_norm,
            phoenix_triggered,
            steer_action: None,
        };

        self.history.push(status.clone());
        status
    }

    fn compute_correlation(&self) -> Option<f64> {
        let n = self.losses.len();
        if n < self.window_size {
            return None;
        }

        let mean_x = self.losses.iter().sum::<f64>() / n as f64;
        let mean_y = self.norms.iter().sum::<f64>() / n as f64;

        let var_x = self.losses.iter().map(|&x| (x - mean_x).powi(2)).sum::<f64>() / n as f64;
        let var_y = self.norms.iter().map(|&y| (y - mean_y).powi(2)).sum::<f64>() / n as f64;

        let std_x = var_x.sqrt();
        let std_y = var_y.sqrt();

        if std_x == 0.0 || std_y == 0.0 {
            return Some(0.0);
        }

        let mut cov = 0.0;
        for i in 0..n {
            cov += (self.losses[i] - mean_x) * (self.norms[i] - mean_y);
        }
        cov /= n as f64;

        Some(cov / (std_x * std_y))
    }

    pub fn steer(
        &self,
        lr: &mut f64,
        safety_threshold: &mut f64,
        lambda_zeta: &mut f64,
        current_status: &mut MetaControllerStatus,
    ) -> Option<String> {
        let mut action = None;
        let avg_norm = current_status.avg_norm;
        let correlation = current_status.correlation;

        // 1. Norm-based steering
        if avg_norm < self.healthy_band.0 {
            *lr *= 1.1;
            *safety_threshold *= 1.05;
            action = Some("exploit_more".to_string());
        } else if avg_norm > self.healthy_band.1 {
            *lr *= 0.9;
            *safety_threshold *= 0.95;
            action = Some("tighten_safety".to_string());
        }

        // 2. Correlation-based steering
        if let Some(corr) = correlation {
            if corr > 0.4 {
                *lambda_zeta *= 0.9;
                action = Some("dampen_zeta".to_string());
            }
        }

        current_status.steer_action = action.clone();
        action
    }
}
