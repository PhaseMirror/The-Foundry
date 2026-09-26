use legalese_scopist::{
    RetentionPolicy, EsiSource, RetentionEngine, RelevanceBand, 
    SedonaEvent, LegalMatter
};
use chrono::NaiveDate;
use std::fs;

fn main() {
    println!("=== MULTIPLICITY FOUNDATION IP & GOVERNANCE AUDIT ===");
    let policy_yaml = fs::read_to_string("templates/multiplicity-ip-defense.yaml")
        .expect("Should be able to read policy template");
    
    let policy: RetentionPolicy = serde_yaml::from_str(&policy_yaml)
        .expect("Policy should be valid YAML");
    
    println!("--- Policy Loaded: {} ---", policy.policy_name);

    let sources = vec![
        EsiSource {
            id: "pirtm-repo-main".into(),
            system: "git-repo".into(),
            esi_type: "SourceCode".into(),
            custodian: Some("Prime".into()),
            relevance_band: RelevanceBand::Core,
            litigation_hold_active: true,
            created_at: NaiveDate::from_ymd_opt(2025, 1, 1).unwrap(),
        },
        EsiSource {
            id: "lambda-trace-001".into(),
            system: "lambda-trace-service".into(),
            esi_type: "ProvenanceTrace".into(),
            custodian: None,
            relevance_band: RelevanceBand::Important,
            litigation_hold_active: false,
            created_at: NaiveDate::from_ymd_opt(2026, 6, 16).unwrap(),
        },
        EsiSource {
            id: "chl-mnda-exec".into(),
            system: "legal-dms".into(),
            esi_type: "MNDA".into(),
            custodian: Some("General Counsel".into()),
            relevance_band: RelevanceBand::Core,
            litigation_hold_active: true,
            created_at: NaiveDate::from_ymd_opt(2026, 2, 1).unwrap(),
        },
    ];

    println!("\n--- Auditing ESI Sources against Policy ---");
    for source in &sources {
        match RetentionEngine::evaluate(&policy, source) {
            Ok(res) => {
                println!("[PASS] Source {}: Matched rule '{}'", source.id, res.rule_id);
            }
            Err(e) => println!("[FAIL] Source {}: {}", source.id, e),
        }
    }

    println!("\n--- Matter Risk Tracking: Matter-CHL-Separation ---");
    let mut matter = LegalMatter::new("Matter-CHL-Separation".into());
    
    let events = vec![
        SedonaEvent::PotentialClaimNoticed {
            date: NaiveDate::from_ymd_opt(2026, 3, 15).unwrap(),
            description: "Dispute over IP transfer boundaries regarding PIRTM.".into(),
        },
        SedonaEvent::LegalHoldIssued {
            date: NaiveDate::from_ymd_opt(2026, 3, 16).unwrap(),
            hold_id: "HOLD-CHL-001".into(),
        },
        SedonaEvent::AutoDeletionResumed {
            date: NaiveDate::from_ymd_opt(2026, 6, 10).unwrap(),
            system: "exchange".into(),
        },
        SedonaEvent::DeletionAfterDuty {
            date: NaiveDate::from_ymd_opt(2026, 6, 15).unwrap(),
            system: "exchange".into(),
            esi_source: Some("email-thread-chl-negotiation".into()),
            reason: "Routine 90-day inbox purge not suspended for involved custodians.".into(),
        }
    ];

    for event in events {
        matter.state = legalese_scopist::spoliation::apply_spoliation_event(matter.state.clone(), &event);
        println!("Event processed. New Risk Level: {:?}", matter.get_risk_level());
    }

    println!("\nFinal Summary: {}", matter.get_summary());
    if matter.get_risk_level() == legalese_scopist::SpoliationRiskLevel::Critical || matter.get_risk_level() == legalese_scopist::SpoliationRiskLevel::High {
        println!("\n[PRESERVATION ALERT] Spoliation risk detected on Matter-CHL-Separation.");
        for j in &matter.state.justification_history {
            println!("- {}: {}", j.date, j.impact);
        }
    }
}
