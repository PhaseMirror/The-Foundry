use unicode_segmentation::UnicodeSegmentation;
use std::collections::HashMap;
use serde::{Deserialize, Serialize};

/// UnitIdentity represents a mapped grapheme to its prime modulus.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct UnitIdentity {
    pub grapheme: String,
    pub mod_val: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PETCVector {
    pub components: HashMap<String, f64>,
}

pub struct GraphemeDecomposer {
    grapheme_map: HashMap<String, u64>,
    next_prime_idx: usize,
    primes: Vec<u64>,
}

impl GraphemeDecomposer {
    pub fn new() -> Self {
        GraphemeDecomposer {
            grapheme_map: HashMap::new(),
            next_prime_idx: 0,
            primes: generate_primes(10000), // Pre-generate some primes
        }
    }

    pub fn decompose(&mut self, text: &str) -> (Vec<UnitIdentity>, PETCVector) {
        let clusters: Vec<&str> = text.graphemes(true).collect();
        let mut all_units = Vec::new();
        let mut total_components = HashMap::new();

        for &g in &clusters {
            let mod_val = self.ensure_grapheme(g);
            all_units.push(UnitIdentity {
                grapheme: g.to_string(),
                mod_val,
            });
            let dim = format!("g_{}", mod_val);
            *total_components.entry(dim).or_insert(0.0) += 1.0;
        }

        (all_units, PETCVector { components: total_components })
    }

    pub fn reassemble(&self, units: &[UnitIdentity]) -> String {
        units.iter().map(|u| u.grapheme.as_str()).collect()
    }

    fn ensure_grapheme(&mut self, g: &str) -> u64 {
        if let Some(&m) = self.grapheme_map.get(g) {
            m
        } else {
            let m = self.primes[self.next_prime_idx];
            self.next_prime_idx += 1;
            self.grapheme_map.insert(g.to_string(), m);
            m
        }
    }
}

fn generate_primes(n: usize) -> Vec<u64> {
    let mut primes = Vec::with_capacity(n);
    let mut candidate = 2;
    while primes.len() < n {
        let mut is_prime = true;
        for &p in &primes {
            if candidate % p == 0 {
                is_prime = false;
                break;
            }
            if p * p > candidate { break; }
        }
        if is_prime { primes.push(candidate); }
        candidate += 1;
    }
    primes
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_decompose_reassemble() {
        let mut decomposer = GraphemeDecomposer::new();
        let text = "Hello 👋 Multiplicity";
        let (units, _) = decomposer.decompose(text);
        let reassembled = decomposer.reassemble(&units);
        assert_eq!(reassembled, text);
    }

    #[test]
    fn test_deterministic_mapping() {
        let mut decomposer = GraphemeDecomposer::new();
        let (units1, _) = decomposer.decompose("a");
        let (units2, _) = decomposer.decompose("a");
        assert_eq!(units1[0].mod_val, units2[0].mod_val);
    }
}
