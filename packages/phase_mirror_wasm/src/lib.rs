use wasm_bindgen::prelude::*;
use serde::{Deserialize, Serialize};

// #[path = "../../rust/src/l0_verification_gate.rs"]
// pub mod l0_verification_gate;
// use l0_verification_gate::{L0VerificationGate, ResonanceBufferState};

#[derive(Serialize, Deserialize)]
struct VerifyResponse {
    status: String,
    witness: Option<String>,
    message: Option<String>,
}

/*
#[wasm_bindgen]
pub fn verify_resonance_buffer(
    state_json: &str,
    expected_schema_hash: &str,
    required_permission_bits: u32,
) -> String {
    // Stubbed out to allow compilation of UnifiedWitnessWasm
    "".to_string()
}
*/

#[wasm_bindgen]
pub fn run_gik_diagnostic(prompt: &str) -> String {
    use serde_json::json;

    // Simple keyword extraction  
    let prompt_lower = prompt.to_lowercase();  
    let has_autonomy = prompt_lower.contains("autonomy") || prompt_lower.contains("autonomous");  
    let has_governance = prompt_lower.contains("governance") || prompt_lower.contains("binding");  
    let has_attestation = prompt_lower.contains("attestation") || prompt_lower.contains("witness");  
    let has_metric = prompt_lower.contains("metric") || prompt_lower.contains("observability");

    let mut weight = 1;  
    if has_autonomy { weight *= 2; }  
    if has_governance { weight *= 3; }  
    if has_attestation { weight *= 5; }  
    if has_metric { weight *= 7; }

    let factors = {  
        let mut v = Vec::new();  
        if has_autonomy { v.push(2); }  
        if has_governance { v.push(3); }  
        if has_attestation { v.push(5); }  
        if has_metric { v.push(7); }  
        v  
    };

    // Generate steps  
    let steps = vec![  
        json!({  
            "step": "extract",  
            "title": "Extract",  
            "content": format!("Identified goal: \"{}\"\nConstraints: {}\nClaims: {}",  
                prompt,  
                if has_governance { "Regulatory compliance" } else { "None detected" },  
                if has_autonomy { "Autonomy is required" } else { "" }  
            ),  
            "weight": weight,  
            "primeFactors": factors.clone(),  
        }),  
        json!({  
            "step": "map",  
            "title": "Map Tensions",  
            "content": format!("Tension: {}\nStructural contradiction: {}",  
                if has_autonomy && has_governance { "Autonomy vs. Governance" } else { "No significant tension detected" },  
                if has_autonomy && !has_governance { "Autonomy (P2) requires Governance (P3) to be lawful." } else if has_governance && !has_attestation { "Missing Attestation (P5)" } else { "Balanced" }  
            ),  
            "weight": weight,  
            "primeFactors": factors.clone(),  
        }),  
        json!({  
            "step": "rank",  
            "title": "Rank",  
            "content": format!("Impact: {}\nTractability: {}\nPriority: {}",  
                if has_autonomy { "High (affects execution)" } else { "Medium" },  
                if has_governance { "Medium (requires governance binding)" } else { "High" },  
                if weight >= 30 { "1" } else { "2" }  
            ),  
            "weight": weight,  
            "primeFactors": factors.clone(),  
        }),  
        json!({  
            "step": "levers",  
            "title": "Produce Levers",  
            "content": format!("1. [DevOps] — Define governance forum — Metric: forum established within 2 weeks — Horizon: Q2\n{}",  
                if !has_attestation { "2. [Security] — Add attestation requirement — Metric: P5 weight included — Horizon: next sprint" } else { "2. [Legal] — Review attestation compliance" }  
            ),  
            "weight": weight,  
            "primeFactors": factors.clone(),  
        }),  
        json!({  
            "step": "question",  
            "title": "Precision Question",  
            "content": if has_autonomy && !has_governance {  
                "How will you ensure governance over autonomous actions without a binding mechanism?"  
            } else if has_governance && !has_attestation {  
                "How will you provide cryptographic proof of each governed action?"  
            } else {  
                "What is the expected timeline for implementing these levers?"  
            },  
            "weight": weight,  
            "primeFactors": factors,  
        }),  
    ];

    serde_json::to_string(&steps).unwrap()  
}

// -----------------------------------------------------------------------------
// UnifiedWitness Native WASM Bindings
// -----------------------------------------------------------------------------

#[wasm_bindgen]
#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct UnifiedWitnessWasm {
    #[wasm_bindgen(skip)]
    pub witness_id: String,
    #[wasm_bindgen(skip)]
    pub action_id: String,
    #[wasm_bindgen(skip)]
    pub timestamp: String,
    #[wasm_bindgen(skip)]
    pub veto_status: String,
    pub contractivity_score: f64,
}

#[wasm_bindgen]
impl UnifiedWitnessWasm {
    #[wasm_bindgen(constructor)]
    pub fn new(witness_id: String, action_id: String, timestamp: String, veto_status: String, contractivity_score: f64) -> Self {
        Self {
            witness_id,
            action_id,
            timestamp,
            veto_status,
            contractivity_score,
        }
    }

    #[wasm_bindgen(getter)]
    pub fn witness_id(&self) -> String { self.witness_id.clone() }
    
    #[wasm_bindgen(getter)]
    pub fn action_id(&self) -> String { self.action_id.clone() }
    
    #[wasm_bindgen(getter)]
    pub fn timestamp(&self) -> String { self.timestamp.clone() }
    
    #[wasm_bindgen(getter)]
    pub fn veto_status(&self) -> String { self.veto_status.clone() }
    
    /// Projects the witness onto the Positive Pressure Seal phase space boundary
    /// Returning a stringified TelemetryEvent for the GlassConsole
    #[wasm_bindgen]
    pub fn evaluate_seal(&self, max_lipschitz: f64, step_id: u32) -> String {
        let mut status = "CERTIFIED";
        let mut reason = None;
        
        if self.contractivity_score >= max_lipschitz {
            status = "REJECTED";
            reason = Some("Contractivity breach: slope exceeds structural bound.");
        }
        
        let event = serde_json::json!({
            "stepId": step_id,
            "hash": self.witness_id.clone(),
            "status": status,
            "slopeUb": self.contractivity_score,
            "reason": reason,
            "timestamp": chrono::Utc::now().timestamp_millis()
        });
        
        event.to_string()
    }
}
