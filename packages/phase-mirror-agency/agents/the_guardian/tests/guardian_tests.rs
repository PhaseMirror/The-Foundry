#[cfg(test)]
mod tests {
    use the_guardian::GuardianService;
    use std::path::Path;

    #[test]
    fn test_guardian_validation() {
        let policy_path = Path::new("policies/default.yaml");
        let service = GuardianService::new_from_policy(policy_path).unwrap();
        
        let proposal = vec![1.0, 1.0]; // Norm is sqrt(2) approx 1.414, > 0.8
        let validated = service.validate_proposal(proposal).unwrap();
        
        let norm: f64 = validated.iter().map(|w| w * w).sum::<f64>().sqrt();
        assert!(norm <= 0.8000000000000001); // Within threshold
    }
}
