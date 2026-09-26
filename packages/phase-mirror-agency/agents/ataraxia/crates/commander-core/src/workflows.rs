use std::path::Path;
use anyhow::{Result, anyhow, Context};
use multiplicity_sigma::{Workflow, Task};
use yaml_rust2::YamlLoader;

pub fn load_levers(repo_path: &Path) -> Result<Vec<Workflow>> {
    let manifest_path = repo_path.join("state").join("lever_manifest.yaml");
    if !manifest_path.exists() {
        return Ok(Vec::new());
    }
    
    let content = std::fs::read_to_string(&manifest_path)
        .context("Failed to read lever manifest")?;
    let docs = YamlLoader::load_from_str(&content)
        .map_err(|e| anyhow!("Failed to parse YAML: {}", e))?;
    
    let doc = docs.first().ok_or_else(|| anyhow!("Empty YAML document"))?;
    
    let mut workflows = Vec::new();
    if let Some(levers) = doc["levers"].as_vec() {
        for lever in levers {
            let id = lever["id"].as_str().unwrap_or("").to_string();
            let command = lever["command"].as_str().unwrap_or("").to_string();
            
            if id.is_empty() || command.is_empty() {
                continue;
            }
            
            let task = Task {
                id: id.clone(),
                action: command,
                server_binding: None,
                tool_name: None,
            };
            
            let workflow = Workflow {
                name: format!("lever-{}", id),
                tasks: vec![task],
                trust: Some(multiplicity_alp::policy::TrustLevel::Internal),
            };
            workflows.push(workflow);
        }
    }
    
    Ok(workflows)
}

pub fn load_custom_workflows(repo_path: &Path) -> Result<Vec<Workflow>> {
    let workflows_dir = repo_path.join("state").join("workflows");
    if !workflows_dir.exists() {
        return Ok(Vec::new());
    }
    
    let mut workflows = Vec::new();
    for entry in std::fs::read_dir(workflows_dir)? {
        let entry = entry?;
        let path = entry.path();
        if path.extension().and_then(|s| s.to_str()) == Some("json") {
            let content = std::fs::read_to_string(&path)?;
            let wf: Workflow = serde_json::from_str(&content)?;
            workflows.push(wf);
        }
    }
    Ok(workflows)
}

pub fn load_all_workflows(repo_path: &Path) -> Result<Vec<Workflow>> {
    let mut workflows = load_levers(repo_path)?;
    workflows.extend(load_custom_workflows(repo_path)?);
    Ok(workflows)
}
