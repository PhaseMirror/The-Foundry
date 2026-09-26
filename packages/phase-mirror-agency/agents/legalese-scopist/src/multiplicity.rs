use serde::{Deserialize, Serialize};
use std::collections::HashMap;

pub const P_STANDING: u64 = 2;
pub const P_SERVICE: u64 = 3;
pub const P_ARBITRATION: u64 = 5;
pub const P_EVIDENCE: u64 = 7;
pub const P_PROCEDURE: u64 = 11;
pub const P_COST_RISK: u64 = 13;

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct MultiplicityState {
    pub exponents: HashMap<u64, u32>,
}

impl MultiplicityState {
    pub fn new() -> Self {
        let mut exponents = HashMap::new();
        exponents.insert(P_STANDING, 0);
        exponents.insert(P_SERVICE, 0);
        exponents.insert(P_ARBITRATION, 0);
        exponents.insert(P_EVIDENCE, 0);
        exponents.insert(P_PROCEDURE, 0);
        exponents.insert(P_COST_RISK, 0);
        Self { exponents }
    }

    pub fn encode(&self) -> num_bigint::BigUint {
        let mut n = num_bigint::BigUint::from(1u64);
        for (&p, &e) in &self.exponents {
            if e > 0 {
                let p_big = num_bigint::BigUint::from(p);
                n *= p_big.pow(e);
            }
        }
        n
    }

    pub fn apply_operator(&mut self, deltas: &HashMap<u64, i32>) {
        for (&p, &delta) in deltas {
            let entry = self.exponents.entry(p).or_insert(0);
            let new_e = (*entry as i32 + delta).max(0);
            *entry = new_e as u32;
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Operator {
    pub id: String,
    pub label: String,
    pub deltas: HashMap<u64, i32>,
    pub assumptions: Vec<String>,
    pub risks: Vec<String>,
}
