use phase_mirror_gpt::archivum::ArchivumLedger;
use phase_mirror_gpt::domain_invariants::SemanticPolicy;
use phase_mirror_gpt::telemetry::LiveTelemetryOracle;
use phase_mirror_gpt::triple_lock::TripleLockSuite;
use phase_mirror_gpt::validator::EvaluationContext;
use std::sync::{Arc, Mutex};
use tokio::sync::Mutex as TokioMutex;

use crate::witness::AutomationWitness;

pub struct AutomationTripleLockSuite {
    pub inner: TripleLockSuite,
}

impl AutomationTripleLockSuite {
    pub fn new(
        telemetry: Arc<Mutex<LiveTelemetryOracle>>,
        ledger: Arc<TokioMutex<ArchivumLedger>>,
        policy: Arc<SemanticPolicy>,
    ) -> Self {
        Self {
            inner: TripleLockSuite::new(telemetry, ledger, policy),
        }
    }

    pub async fn verify(
        &self,
        mission_id: &str,
        draft_plan: &str,
        ctx: EvaluationContext,
    ) -> anyhow::Result<AutomationWitness> {
        let inner_witness = self.inner.verify(mission_id, draft_plan, ctx).await?;
        Ok(AutomationWitness {
            mission_id: inner_witness.mission_id,
            witness_hash: inner_witness.witness_hash,
            governance_status: inner_witness.governance_status,
            p_lineage: inner_witness.p_lineage,
        })
    }
}
