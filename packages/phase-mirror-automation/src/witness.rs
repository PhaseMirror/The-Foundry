use phase_mirror_gpt::triple_lock::TripleLockWitness;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AutomationWitness {
    pub mission_id: String,
    pub witness_hash: String,
    pub governance_status: String,
    pub p_lineage: String,
}

impl From<TripleLockWitness> for AutomationWitness {
    fn from(w: TripleLockWitness) -> Self {
        Self {
            mission_id: w.mission_id,
            witness_hash: w.witness_hash,
            governance_status: w.governance_status,
            p_lineage: w.p_lineage,
        }
    }
}
