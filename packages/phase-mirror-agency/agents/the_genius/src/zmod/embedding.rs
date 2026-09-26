#[derive(Debug, Clone)]
pub struct CanonicalEmbedding {
    pub sigma_0: f64,
    pub a: f64,
    pub phi_max: f64,
    pub primes: Vec<f64>,
    pub log_primes: Vec<f64>,
}

impl Default for CanonicalEmbedding {
    fn default() -> Self {
        Self::new(None, None, None, None)
    }
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

    pub fn compute_phi_tilde(&self, theta: &[f64]) -> f64 {
        if theta.is_empty() {
            return 0.0;
        }
        let norm_sq: f64 = theta.iter().map(|&x| x * x).sum();
        let phi = norm_sq / theta.len() as f64;
        phi.min(self.phi_max)
    }

    pub fn embed(&self, theta: &[f64], pi: &[f64]) -> (f64, f64) {
        let phi_tilde = self.compute_phi_tilde(theta);
        let mut multiplicity_sum = 0.0;
        for i in 0..pi.len().min(self.log_primes.len()) {
            multiplicity_sum += pi[i] * self.log_primes[i];
        }
        let t = self.a * phi_tilde + multiplicity_sum;
        (self.sigma_0, t)
    }
}
