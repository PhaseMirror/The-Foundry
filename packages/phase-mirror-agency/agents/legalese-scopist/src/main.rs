use legalese_scopist::{
    RetentionPolicy, EsiSource, RetentionEngine, RelevanceBand, 
    SedonaEvent, LegalMatter, GapSeverity
};
use chrono::NaiveDate;
use std::collections::HashMap;

fn main() {
    println!("=== MATTER 1: DEBT-BUYER STANDING ===");
    run_debt_buyer_matter();

    println!("\n=== MATTER 2: ARBITRATION & ASSENT ===");
    run_arbitration_matter();

    println!("\n=== MATTER 3: SERVICE & JURISDICTION ===");
    run_service_matter();

    // 4. Multiplicity Space Proof of Concept
    println!("\n=== MULTIPLICITY SPACE (Proof of Concept) ===");
    let mut ms = legalese_scopist::multiplicity::MultiplicityState::new();
    let mut deltas = HashMap::new();
    deltas.insert(legalese_scopist::multiplicity::P_STANDING, 1);
    deltas.insert(legalese_scopist::multiplicity::P_ARBITRATION, 1);
    
    ms.apply_operator(&deltas);
    println!("State (P2=1, P5=1) -> Encoded integer M: {}", ms.encode());
}

fn run_debt_buyer_matter() {
    let policy_yaml = std::fs::read_to_string("templates/m365-standard-retention.yaml")
        .expect("Should be able to read standard policy template");
    
    let policy: RetentionPolicy = serde_yaml::from_str(&policy_yaml)
        .expect("Standard policy should be valid YAML");
    
    println!("--- Policy Audit: {} ---", policy.policy_name);

    let sources = vec![
        EsiSource {
            id: "msg-001".into(),
            system: "exchange".into(),
            esi_type: "Email".into(),
            custodian: Some("General Counsel".into()),
            relevance_band: RelevanceBand::Core,
            litigation_hold_active: true,
            created_at: NaiveDate::from_ymd_opt(2023, 1, 1).unwrap(),
        },
    ];

    for source in &sources {
        match RetentionEngine::evaluate(&policy, source) {
            Ok(res) => {
                println!("[PASS] Source {}: Matched rule '{}'", source.id, res.rule_id);
            }
            Err(e) => println!("[FAIL] Source {}: {}", source.id, e),
        }
    }

    let mut matter = LegalMatter::new("Matter-DB-2024-X".into());
    let event = SedonaEvent::AutoDeletionResumed {
        date: NaiveDate::from_ymd_opt(2024, 5, 10).unwrap(),
        system: "dms".into(),
    };
    
    matter.state.duty_triggered = true; // Simulating prior trigger
    matter.state = legalese_scopist::spoliation::apply_spoliation_event(matter.state.clone(), &event);
    println!("Final Summary: {}", matter.get_summary());
}

fn run_arbitration_matter() {
    let policy_yaml = std::fs::read_to_string("templates/arbitration-clause.yaml")
        .expect("Should be able to read arbitration policy template");
    
    let policy: RetentionPolicy = serde_yaml::from_str(&policy_yaml)
        .expect("Arbitration policy should be valid YAML");
    
    println!("--- Policy Audit: {} ---", policy.policy_name);

    let sources = vec![
        EsiSource {
            id: "audit-log-001".into(),
            system: "session-logger".into(),
            esi_type: "ClickwrapAudit".into(),
            custodian: None,
            relevance_band: RelevanceBand::Core,
            litigation_hold_active: true,
            created_at: NaiveDate::from_ymd_opt(2024, 1, 15).unwrap(),
        }
    ];

    for source in &sources {
        match RetentionEngine::evaluate(&policy, source) {
            Ok(res) => {
                println!("[PASS] Source {}: Matched rule '{}'", source.id, res.rule_id);
                println!("       Rationale: {}", res.sedona_rationale);
            }
            Err(e) => println!("[FAIL] Source {}: {}", source.id, e),
        }
    }

    println!("\n--- Matter Risk Tracking: Matter-ARB-002 ---");
    let mut matter = LegalMatter::new("Matter-ARB-002".into());
    
    let events = vec![
        SedonaEvent::PotentialClaimNoticed {
            date: NaiveDate::from_ymd_opt(2024, 6, 1).unwrap(),
            description: "User submitted opt-out notice regarding class waiver.".into(),
        },
        SedonaEvent::LegalHoldIssued {
            date: NaiveDate::from_ymd_opt(2024, 6, 2).unwrap(),
            hold_id: "HOLD-ARB-01".into(),
        },
        SedonaEvent::DeletionAfterDuty {
            date: NaiveDate::from_ymd_opt(2024, 6, 15).unwrap(),
            system: "session-logger".into(),
            esi_source: Some("audit-log-001".into()),
            reason: "30-day cron purge failure".into(),
        }
    ];

    for event in events {
        matter.state = legalese_scopist::spoliation::apply_spoliation_event(matter.state.clone(), &event);
        println!("Event processed. Current Risk: {:?}", matter.get_risk_level());
    }

    println!("\nFinal Summary: {}", matter.get_summary());
}

fn run_service_matter() {
    let policy_yaml = std::fs::read_to_string("templates/service-defect.yaml")
        .expect("Should be able to read service policy template");
    
    let policy: RetentionPolicy = serde_yaml::from_str(&policy_yaml)
        .expect("Service policy should be valid YAML");
    
    println!("--- Policy Audit: {} ---", policy.policy_name);

    let sources = vec![
        EsiSource {
            id: "gps-log-999".into(),
            system: "gps-archive".into(),
            esi_type: "GPSCoord".into(),
            custodian: None,
            relevance_band: RelevanceBand::Core,
            litigation_hold_active: true,
            created_at: NaiveDate::from_ymd_opt(2024, 3, 10).unwrap(),
        }
    ];

    for source in &sources {
        match RetentionEngine::evaluate(&policy, source) {
            Ok(res) => {
                println!("[PASS] Source {}: Matched rule '{}'", source.id, res.rule_id);
            }
            Err(e) => println!("[FAIL] Source {}: {}", source.id, e),
        }
    }

    println!("\n--- Matter Risk Tracking: Matter-SVC-003 ---");
    let mut matter = LegalMatter::new("Matter-SVC-003".into());
    
    let events = vec![
        SedonaEvent::ComplaintFiled {
            date: NaiveDate::from_ymd_opt(2024, 4, 1).unwrap(),
            forum: "State Court".into(),
        },
        SedonaEvent::PreservationGapDetected {
            date: NaiveDate::from_ymd_opt(2024, 4, 15).unwrap(),
            description: "Emergency low-storage purge bypassed hold on GPS data.".into(),
            severity: GapSeverity::Severe,
        }
    ];

    for event in events {
        matter.state = legalese_scopist::spoliation::apply_spoliation_event(matter.state.clone(), &event);
        println!("Event processed. Current Risk: {:?}", matter.get_risk_level());
    }

    println!("\nFinal Summary: {}", matter.get_summary());
}
