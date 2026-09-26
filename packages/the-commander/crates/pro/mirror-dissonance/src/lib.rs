pub mod schemas;
pub mod policy;
pub mod rules;
pub mod compose;

pub use schemas::*;
pub use policy::*;
pub use rules::*;
pub use compose::*;

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_md001_violation() {
        let input = OracleInput {
            mode: "merge_group".to_string(),
            strict: false,
            dry_run: false,
        };
        let violations = check_md001(&input).await;
        assert_eq!(violations.len(), 1);
        assert_eq!(violations[0].rule_id, "MD-001");
    }

    #[tokio::test]
    async fn test_make_decision_block() {
        let violations = vec![
            RuleViolation {
                rule_id: "MD-001".to_string(),
                severity: Severity::High,
                message: "test".to_string(),
                context: None,
            },
            RuleViolation {
                rule_id: "MD-002".to_string(),
                severity: Severity::High,
                message: "test".to_string(),
                context: None,
            },
        ];
        let context = DecisionContext {
            violations,
            mode: "merge_group".to_string(),
            strict: false,
            dry_run: false,
            circuit_breaker_tripped: false,
        };
        let decision = make_decision(context);
        assert!(matches!(decision.outcome, Outcome::Block));
    }
}
