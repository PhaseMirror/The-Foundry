use anyhow::{Context, Result};
use std::path::Path;

pub use multiplicity_common::types::TrustLevel;
pub use multiplicity_common::Workflow;
pub use multiplicity_common::Task;

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize, PartialEq)]
pub struct SigmaWorkflow {
    pub name: String,
    pub version: String,
    pub trust: SigmaTrustLevel,
    pub server_binding: String,
    pub steps: Vec<SigmaStep>,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum SigmaTrustLevel {
    Internal,
    External,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize, PartialEq)]
pub struct SigmaStep {
    pub id: String,
    #[serde(default = "default_tool")]
    pub tool: String,
    pub args: serde_json::Value,
    #[serde(default)]
    pub on_fail: FailPolicy,
}

fn default_tool() -> String {
    "call_tool".to_string()
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize, Default, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum FailPolicy {
    #[default]
    Abort,
    Continue,
}

/// Compile a .sigma.yaml file to a Workflow.
pub fn compile(path: &Path) -> Result<Workflow> {
    let raw = std::fs::read_to_string(path)
        .with_context(|| format!("cannot read {}", path.display()))?;

    let wf: SigmaWorkflow = serde_yaml::from_str(&raw)
        .with_context(|| format!("invalid sigma yaml: {}", path.display()))?;

    validate(&wf)?;
    Ok(to_workflow(wf))
}

/// Schema validation - runs before compilation.
fn validate(wf: &SigmaWorkflow) -> Result<()> {
    if wf.steps.is_empty() {
        anyhow::bail!("workflow '{}' has no steps", wf.name);
    }
    // External workflows may not bind to governed servers.
    if wf.trust == SigmaTrustLevel::External && wf.server_binding != "sandbox" {
        anyhow::bail!(
            "workflow '{}': server_binding=sandbox requirement violated. External workflows must use sandbox.",
            wf.name
        );
    }
    Ok(())
}

fn to_workflow(wf: SigmaWorkflow) -> Workflow {
    Workflow {
        name: wf.name,
        tasks: wf.steps.into_iter().map(|s| {
            let tool = s.tool.clone();
            Task {
                id: s.id,
                action: tool.clone(),
                server_binding: Some(wf.server_binding.clone()),
                tool_name: Some(tool),
            }
        }).collect(),
        trust: Some(trust_from_sigma(wf.trust)),
        consensus_proof: None,
        threshold_met: None,
    }
}

fn trust_from_sigma(t: SigmaTrustLevel) -> TrustLevel {
    match t {
        SigmaTrustLevel::Internal => TrustLevel::Internal,
        SigmaTrustLevel::External => TrustLevel::External,
    }
}
