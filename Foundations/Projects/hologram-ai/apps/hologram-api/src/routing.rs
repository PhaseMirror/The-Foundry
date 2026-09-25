use std::collections::HashMap;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ModelRoute {
    pub domain: String,
    pub model_id: String,
    pub archive_path: String,
    pub description: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct RoutingTable {
    pub default_model: String,
    pub routes: Vec<ModelRoute>,
}

impl RoutingTable {
    pub fn load_from_yaml(content: &str) -> Result<Self, serde_yaml::Error> {
        serde_yaml::from_str(content)
    }

    pub fn resolve_model(&self, domain: &str) -> Option<&ModelRoute> {
        self.routes.iter().find(|r| r.domain.eq_ignore_ascii_case(domain))
    }
}
