#[cfg(test)]
mod tests {
    use crate::model::*;
    use crate::enforcement::*;
    use crate::spoliation::*;
    use chrono::NaiveDate;

    #[test]
    fn test_retention_evaluation() {
        let policy = RetentionPolicy {
            version: "1.0".into(),
            policy_name: "Test Policy".into(),
            sedona_references: vec![],
            rules: vec![
                RetentionRule {
                    id: "rule-1".into(),
                    description: None,
                    scope: Scope {
                        systems: vec!["m365".into()],
                        esi_types: vec!["Email".into()],
                        custodians_filter: None,
                    },
                    when: Conditions {
                        litigation_hold_active: true,
                        relevance_band: vec![RelevanceBand::Core],
                    },
                    action: Action {
                        retain_for_days: RetentionDuration::Infinite("infinite".into()),
                        delete_after: false,
                        enable_snapshot: None,
                    },
                    sedona: SedonaTags {
                        principles: vec!["Principle 5".into()],
                        rationale: "Hold rule".into(),
                    },
                }
            ],
        };

        let source = EsiSource {
            id: "src-1".into(),
            system: "m365".into(),
            esi_type: "Email".into(),
            custodian: None,
            relevance_band: RelevanceBand::Core,
            litigation_hold_active: true,
            created_at: NaiveDate::from_ymd_opt(2024, 1, 1).unwrap(),
        };

        let result = RetentionEngine::evaluate(&policy, &source).unwrap();
        assert_eq!(result.rule_id, "rule-1");
    }

    #[test]
    fn test_spoliation_justification_and_risk() {
        let mut risk = SpoliationRiskState::default();
        
        let event1 = SedonaEvent::PotentialClaimNoticed {
            date: NaiveDate::from_ymd_opt(2024, 1, 1).unwrap(),
            description: "Notice of potential claim.".into(),
        };
        risk = apply_spoliation_event(risk, &event1);
        
        assert_eq!(risk.justification_history.len(), 1);
        assert!(risk.justification_history[0].impact.contains("Preservation duty triggered"));
        assert_eq!(risk.current_risk_level, SpoliationRiskLevel::Medium);

        let event2 = SedonaEvent::AutoDeletionResumed {
            date: NaiveDate::from_ymd_opt(2024, 1, 2).unwrap(),
            system: "slack".into(),
        };
        risk = apply_spoliation_event(risk, &event2);
        
        assert_eq!(risk.current_risk_level, SpoliationRiskLevel::Critical);
        assert!(risk.justification_history[1].impact.contains("HIGH RISK: Auto-deletion resumed"));
    }
}
