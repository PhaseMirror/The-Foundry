use serde::{Deserialize, Serialize};
use chrono::NaiveDate;
use wasm_bindgen::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", content = "data")]
pub enum SedonaEvent {
    PotentialClaimNoticed {
        date: NaiveDate,
        description: String,
    },
    ComplaintFiled {
        date: NaiveDate,
        forum: String,
    },
    RegulatoryInquiryOpened {
        date: NaiveDate,
        agency: String,
    },
    LegalHoldIssued {
        date: NaiveDate,
        hold_id: String,
    },
    LegalHoldAcknowledged {
        date: NaiveDate,
        hold_id: String,
        custodian: String,
    },
    LegalHoldReleased {
        date: NaiveDate,
        hold_id: String,
    },
    AutoDeletionSuspended {
        date: NaiveDate,
        system: String,
    },
    AutoDeletionResumed {
        date: NaiveDate,
        system: String,
    },
    DeletionAfterDuty {
        date: NaiveDate,
        system: String,
        esi_source: Option<String>,
        reason: String,
    },
    PreservationGapDetected {
        date: NaiveDate,
        description: String,
        severity: GapSeverity,
    },
}

#[wasm_bindgen]
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, PartialOrd)]
pub enum SpoliationRiskLevel {
    None,
    Low,
    Medium,
    High,
    Critical,
}

#[wasm_bindgen]
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, PartialOrd)]
pub enum GapSeverity {
    Minor,
    Moderate,
    Severe,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SedonaJustification {
    pub date: NaiveDate,
    pub event_type: String,
    pub impact: String,
    pub sedona_context: String,
}

#[wasm_bindgen]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SpoliationRiskState {
    pub duty_triggered: bool,
    #[wasm_bindgen(skip)]
    pub first_trigger_date: Option<NaiveDate>,
    pub holds_active: usize,
    pub custodians_on_hold: usize,
    pub unacknowledged_holds: usize,
    pub post_duty_deletions: usize,
    pub gaps_detected: usize,
    pub current_risk_level: SpoliationRiskLevel,
    #[wasm_bindgen(skip)]
    pub justification_history: Vec<SedonaJustification>,
    #[wasm_bindgen(skip)]
    pub systems_with_active_auto_delete: Vec<String>,
}

impl Default for SpoliationRiskState {
    fn default() -> Self {
        Self {
            duty_triggered: false,
            first_trigger_date: None,
            holds_active: 0,
            custodians_on_hold: 0,
            unacknowledged_holds: 0,
            post_duty_deletions: 0,
            gaps_detected: 0,
            current_risk_level: SpoliationRiskLevel::None,
            justification_history: Vec::new(),
            systems_with_active_auto_delete: Vec::new(),
        }
    }
}

#[wasm_bindgen]
pub struct LegalMatter {
    #[wasm_bindgen(skip)]
    pub id: String,
    #[wasm_bindgen(skip)]
    pub state: SpoliationRiskState,
    #[wasm_bindgen(skip)]
    pub events: Vec<SedonaEvent>,
    #[wasm_bindgen(skip)]
    pub multiplicity: crate::multiplicity::MultiplicityState,
}

#[wasm_bindgen]
impl LegalMatter {
    #[wasm_bindgen(constructor)]
    pub fn new(id: String) -> Self {
        Self {
            id,
            state: SpoliationRiskState::default(),
            events: Vec::new(),
            multiplicity: crate::multiplicity::MultiplicityState::new(),
        }
    }

    pub fn process_event(&mut self, event_json: &str) -> Result<JsValue, JsValue> {
        let event: SedonaEvent = serde_json::from_str(event_json)
            .map_err(|e| JsValue::from_str(&e.to_string()))?;
        
        self.events.push(event.clone());
        self.state = apply_spoliation_event(self.state.clone(), &event);
        
        Ok(serde_wasm_bindgen::to_value(&self.state)?)
    }

    pub fn get_risk_level(&self) -> SpoliationRiskLevel {
        self.state.current_risk_level
    }

    pub fn get_summary(&self) -> String {
        format!(
            "Matter {}: Risk {:?}, Duty Triggered: {}, Holds: {}",
            self.id, self.state.current_risk_level, self.state.duty_triggered, self.state.holds_active
        )
    }
}

pub fn apply_spoliation_event(
    mut risk: SpoliationRiskState,
    event: &SedonaEvent,
) -> SpoliationRiskState {
    let mut justification = SedonaJustification {
        date: get_event_date(event),
        event_type: format!("{:?}", event),
        impact: String::new(),
        sedona_context: String::new(),
    };

    match event {
        SedonaEvent::PotentialClaimNoticed { date, .. } => {
            if !risk.duty_triggered {
                risk.duty_triggered = true;
                risk.first_trigger_date = Some(*date);
                justification.impact = "Preservation duty triggered by potential claim.".into();
                justification.sedona_context = "Sedona Principle 5: Duty to preserve attaches when litigation is reasonably anticipated.".into();
            }
        }
        SedonaEvent::ComplaintFiled { date, .. } => {
            if !risk.duty_triggered {
                risk.duty_triggered = true;
                risk.first_trigger_date = Some(*date);
            }
            justification.impact = "Duty solidified by formal complaint filing.".into();
            justification.sedona_context = "Duty to preserve is certain upon commencement of litigation.".into();
        }
        SedonaEvent::LegalHoldIssued { .. } => {
            risk.holds_active += 1;
            risk.unacknowledged_holds += 1;
            justification.impact = "Active hold count increased.".into();
        }
        SedonaEvent::LegalHoldAcknowledged { .. } => {
            if risk.unacknowledged_holds > 0 {
                risk.unacknowledged_holds -= 1;
            }
            justification.impact = "Hold acknowledgment received.".into();
        }
        SedonaEvent::DeletionAfterDuty { system, reason, .. } => {
            risk.post_duty_deletions += 1;
            justification.impact = format!("POST-DUTY DELETION detected on system '{}' (Reason: {}).", system, reason);
            justification.sedona_context = "Potential spoliation: Routine deletion must be suspended for relevant ESI once duty attaches.".into();
        }
        SedonaEvent::PreservationGapDetected { severity, description, .. } => {
            risk.gaps_detected += 1;
            justification.impact = format!("Preservation gap identified: {}", description);
            if matches!(severity, GapSeverity::Severe) {
                justification.sedona_context = "Severe gap detected.".into();
            }
        }
        SedonaEvent::AutoDeletionResumed { system, .. } => {
            risk.systems_with_active_auto_delete.push(system.clone());
            if risk.duty_triggered {
                justification.impact = format!("HIGH RISK: Auto-deletion resumed on '{}' while preservation duty is active.", system);
            }
        }
        _ => {}
    }

    risk.justification_history.push(justification);
    risk.current_risk_level = compute_risk_level(&risk);
    risk
}

fn get_event_date(event: &SedonaEvent) -> NaiveDate {
    match event {
        SedonaEvent::PotentialClaimNoticed { date, .. } => *date,
        SedonaEvent::ComplaintFiled { date, .. } => *date,
        SedonaEvent::RegulatoryInquiryOpened { date, .. } => *date,
        SedonaEvent::LegalHoldIssued { date, .. } => *date,
        SedonaEvent::LegalHoldAcknowledged { date, .. } => *date,
        SedonaEvent::LegalHoldReleased { date, .. } => *date,
        SedonaEvent::AutoDeletionSuspended { date, .. } => *date,
        SedonaEvent::AutoDeletionResumed { date, .. } => *date,
        SedonaEvent::DeletionAfterDuty { date, .. } => *date,
        SedonaEvent::PreservationGapDetected { date, .. } => *date,
    }
}

fn compute_risk_level(risk: &SpoliationRiskState) -> SpoliationRiskLevel {
    if !risk.duty_triggered {
        return SpoliationRiskLevel::None;
    }

    if risk.post_duty_deletions > 5 || (risk.duty_triggered && !risk.systems_with_active_auto_delete.is_empty()) {
        return SpoliationRiskLevel::Critical;
    }

    if risk.post_duty_deletions > 0 || risk.gaps_detected > 2 || risk.unacknowledged_holds > 10 {
        return SpoliationRiskLevel::High;
    }

    if risk.holds_active == 0 || risk.unacknowledged_holds > 0 {
        return SpoliationRiskLevel::Medium;
    }

    SpoliationRiskLevel::Low
}
