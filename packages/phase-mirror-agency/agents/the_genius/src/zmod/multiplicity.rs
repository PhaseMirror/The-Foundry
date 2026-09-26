use std::collections::HashMap;

#[derive(Debug, Clone)]
pub struct MultiplicityCell {
    pub prime_index: f64,
    pub hidden_dim: usize,
    pub state: Vec<f64>,
    pub weight: f64,
}

impl MultiplicityCell {
    pub fn new(prime_index: f64, hidden_dim: usize) -> Self {
        MultiplicityCell {
            prime_index,
            hidden_dim,
            state: vec![0.0; hidden_dim],
            weight: 1.0 / prime_index,
        }
    }

    pub fn update(&mut self, input_tensor: &[f64], recur_tensor: &[f64]) -> &[f64] {
        for i in 0..self.hidden_dim.min(input_tensor.len()).min(recur_tensor.len()) {
            let combined = self.weight * input_tensor[i] + recur_tensor[i];
            self.state[i] = combined.tanh();
        }
        &self.state
    }
}

#[derive(Debug, Clone)]
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

    pub fn forward(&mut self, x: &[f64]) -> Vec<Vec<f64>> {
        let mut outputs = Vec::new();
        let mut recur_sum = vec![0.0; self.hidden_dim];
        for &p in &self.primes {
            if let Some(cell) = self.cells.get_mut(&p) {
                let cell_out = cell.update(x, &recur_sum).to_vec();
                recur_sum = cell_out.clone();
                outputs.push(cell_out);
            }
        }
        outputs
    }
}
