use phase_mirror_gpt::domain_invariants::SemanticPolicy;
use phase_mirror_gpt::validator::{
    GovernanceOutcome, GovernanceTier, InvariantConsistencyOracle, L0Validator,
};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub struct AutomationEvaluationContext {
    pub permission_bits: u32,
    pub schema_signature: u32,
    pub expected_schema: u32,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum AutomationEvent {
    CargoBuild,
    CargoTest,
    CargoKani,
    GitCommit,
    FileMutate,
    KiloMcpInvoke,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum AutomationGovernanceOutcome {
    Allow,
    Warn(&'static str),
    Block(&'static str),
}

pub struct AutomationGovernanceOracle {
    pub l0: InvariantConsistencyOracle,
    pub policy: Arc<SemanticPolicy>,
}

impl AutomationGovernanceOracle {
    pub fn new(policy: Arc<SemanticPolicy>) -> Self {
        Self {
            l0: InvariantConsistencyOracle,
            policy,
        }
    }

    #[inline(always)]
    pub fn admit(
        &self,
        ctx: &AutomationEvaluationContext,
        _event: AutomationEvent,
        draft_plan: &str,
        tier: GovernanceTier,
    ) -> AutomationGovernanceOutcome {
        let eval_ctx = phase_mirror_gpt::validator::EvaluationContext {
            permission_bits: ctx.permission_bits,
            schema_signature: ctx.schema_signature,
            expected_schema: ctx.expected_schema,
        };

        match self.l0.validate_invariants(&eval_ctx, tier) {
            GovernanceOutcome::Block(msg) => return AutomationGovernanceOutcome::Block(msg),
            GovernanceOutcome::Warning(msg) => return AutomationGovernanceOutcome::Warn(msg),
            GovernanceOutcome::Allow => {}
        }

        let (violated, _token) = self.policy.scan(draft_plan);
        if violated {
            return AutomationGovernanceOutcome::Block("Semantic policy violation");
        }

        AutomationGovernanceOutcome::Allow
    }
}

use std::sync::Arc;
