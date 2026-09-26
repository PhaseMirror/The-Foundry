use pest::Parser;
use pest_derive::Parser;
use anyhow::{Result, anyhow};
use std::collections::HashMap;

#[derive(Parser)]
#[grammar = "policy.pest"]
pub struct PolicyParser;

pub struct PolicyEngine {
    pub rules: HashMap<String, f64>,
}

impl PolicyEngine {
    pub fn new(dsl: &str) -> Result<Self> {
        let mut rules = HashMap::new();
        let pairs = PolicyParser::parse(Rule::policy, dsl)
            .map_err(|e| anyhow!("Parsing error: {}", e))?;

        for pair in pairs {
            if pair.as_rule() == Rule::policy {
                for expr in pair.into_inner() {
                    if expr.as_rule() == Rule::expr {
                        let mut inner = expr.into_inner();
                        let key = inner.next().unwrap().as_str().to_string();
                        let val: f64 = inner.next().unwrap().as_str().parse()?;
                        rules.insert(key, val);
                    }
                }
            }
        }
        Ok(Self { rules })
    }

    pub fn get_rule(&self, key: &str) -> Option<f64> {
        self.rules.get(key).copied()
    }
}
