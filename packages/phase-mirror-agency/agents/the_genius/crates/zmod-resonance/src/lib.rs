use ndarray::{Array1, ArrayView1};
use serde::{Deserialize, Serialize};
use std::sync::{Arc, RwLock};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ModulatorMetadata {
    pub source_id: String,
    pub certification: String, // ZK proof commitment
}

/// A thread-safe, shared CRMF (Certified Resonance Multiplicity Field)
pub struct CRMF {
    state: Arc<RwLock<Array1<f64>>>,
    // Map Agent ID -> (Interference, Metadata)
    interference: Arc<RwLock<HashMap<String, (Array1<f64>, ModulatorMetadata)>>>,
}

impl CRMF {
    pub fn new(dim: usize) -> Self {
        Self {
            state: Arc::new(RwLock::new(Array1::zeros(dim))),
            interference: Arc::new(RwLock::new(HashMap::new())),
        }
    }

    pub fn read_state(&self) -> Array1<f64> {
        self.state.read().unwrap().clone()
    }

    pub fn modulate(&self, source_id: String, certification: String, modulation: ArrayView1<f64>) {
        let mut int = self.interference.write().unwrap();
        let metadata = ModulatorMetadata { source_id: source_id.clone(), certification };
        
        let entry = int.entry(source_id).or_insert((Array1::zeros(modulation.len()), metadata.clone()));
        entry.0 += &modulation;
    }

    pub fn propagate(&self) {
        let mut state = self.state.write().unwrap();
        let mut int = self.interference.write().unwrap();
        
        for (interference, _) in int.values() {
            *state += interference;
        }
        
        // Dissipate interference
        for (interference, _) in int.values_mut() {
            *interference *= 0.9;
        }
    }
}
