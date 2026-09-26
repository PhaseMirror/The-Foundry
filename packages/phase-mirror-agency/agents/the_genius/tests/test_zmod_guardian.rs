use the_genius_rs::zmod::guardian::ACEGuardian;

#[test]
fn test_norm_projection() {
    let guardian = ACEGuardian::new(Some(1.0), Some("norm".to_string()));

    // 1. Safe proposal
    let w_safe: Vec<f64> = vec![0.5, 0.5];
    let w_res = guardian.project(&w_safe);
    assert!((w_safe[0] - w_res[0]).abs() < 1e-5);
    assert!((w_safe[1] - w_res[1]).abs() < 1e-5);

    // 2. Unsafe proposal
    let w_unsafe: Vec<f64> = vec![2.0, 0.0];
    let w_projected = guardian.project(&w_unsafe);
    let norm = (w_projected[0].powi(2) + w_projected[1].powi(2)).sqrt();
    assert!((norm - 1.0).abs() < 1e-5);
    assert!((w_projected[0] - 1.0).abs() < 1e-5);
    assert!((w_projected[1] - 0.0).abs() < 1e-5);
}

#[test]
fn test_spectral_projection() {
    let guardian = ACEGuardian::new(Some(0.9), Some("spectral".to_string()));

    // Unsafe matrix: M = [[2.0, 0.0], [0.0, 2.0]]
    // Reshaped to flat vector: [2.0, 0.0, 0.0, 2.0]
    let m_unsafe: Vec<f64> = vec![2.0, 0.0, 0.0, 2.0];
    let m_projected = guardian.project(&m_unsafe);

    // Projected matrix should be [[0.9, 0.0], [0.0, 0.9]]
    // Reshaped to flat vector: [0.9, 0.0, 0.0, 0.9]
    assert!((m_projected[0] - 0.9).abs() < 1e-5);
    assert!((m_projected[1] - 0.0).abs() < 1e-5);
    assert!((m_projected[2] - 0.0).abs() < 1e-5);
    assert!((m_projected[3] - 0.9).abs() < 1e-5);
}

#[test]
fn test_contraction_verification() {
    let guardian = ACEGuardian::new(None, None);
    let w_old: Vec<f64> = vec![1.0];
    let w_new: Vec<f64> = vec![0.9];
    assert!(guardian.verify_contraction(&w_old, &w_new));

    let w_bad: Vec<f64> = vec![1.1];
    assert!(!guardian.verify_contraction(&w_old, &w_bad));
}
