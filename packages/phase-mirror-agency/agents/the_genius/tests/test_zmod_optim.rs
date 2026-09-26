use the_genius_rs::zmod::embedding::CanonicalEmbedding;
use the_genius_rs::zmod::resonance::ResonanceProvider;
use the_genius_rs::zmod::optim::{ZMODAdam, LMTuner};

#[test]
fn test_zmod_adam_step() {
    let embedding = CanonicalEmbedding::new(None, None, None, None);
    let mut optimizer = ZMODAdam::new(1e-1, (0.9, 0.999), 1e-8, 0.0, 0.0, embedding);

    let mut theta: Vec<f64> = vec![1.0, 2.0];
    let grad: Vec<f64> = vec![1.0, 2.0];

    optimizer.step(0, &mut theta, &grad, None);

    // Verify theta changed
    assert!((theta[0] - 1.0).abs() > 1e-5);
    assert!((theta[1] - 2.0).abs() > 1e-5);
}

#[test]
fn test_zeta_resonance_integration() {
    let embedding_1 = CanonicalEmbedding::new(None, None, None, None);
    let mut optimizer_1 = ZMODAdam::new(1e-1, (0.9, 0.999), 1e-8, 0.0, 0.0, embedding_1);

    let embedding_2 = CanonicalEmbedding::new(None, Some(5.0), None, None);
    let mut optimizer_2 = ZMODAdam::new(1e-1, (0.9, 0.999), 1e-8, 0.0, 10.0, embedding_2);

    let zeros_path = "models/the_genius/data/zeros/riemann_zeros_first_10.txt";
    let resonance = ResonanceProvider::new(Some(zeros_path), Some(5.0));

    let mut theta_1: Vec<f64> = vec![1.0, 2.0];
    let mut theta_2: Vec<f64> = vec![1.0, 2.0];

    for _ in 0..5 {
        // Simple linear gradients for f(theta) = sum(theta)
        let grad_1: Vec<f64> = vec![1.0, 1.0];
        let grad_2: Vec<f64> = vec![1.0, 1.0];

        optimizer_1.step(0, &mut theta_1, &grad_1, None);
        optimizer_2.step(0, &mut theta_2, &grad_2, Some(&resonance));
    }

    // theta_1 and theta_2 should be different because of the zeta potential gradient influence
    let diff = (theta_1[0] - theta_2[0]).abs() + (theta_1[1] - theta_2[1]).abs();
    assert!(diff > 1e-5, "ZMOD guidance should result in different parameter updates");
}

#[test]
fn test_lm_refinement_integration() {
    let mut tuner = LMTuner::new(None, None, None);

    // Target linear model to fit: target_y = w * x + b
    // Target parameters: w = 2.0, b = 0.0
    let x: Vec<f64> = vec![1.0, 2.0, 3.0];
    let target: Vec<f64> = vec![2.0, 4.0, 6.0];

    // Params to optimize: [w, b]
    let mut model_params: Vec<f64> = vec![0.5, 0.0];

    let model_forward = |x_in: &[f64], params: &[f64]| -> Vec<f64> {
        let w = params[0];
        let b = params[1];
        x_in.iter().map(|&xi| w * xi + b).collect()
    };

    let error = tuner.step(&x, &target, &mut model_params, model_forward);

    // Verify error is very small
    assert!(error < 1e-5, "LM tuner should minimize the error to near zero");
    // Verify parameters are close to target w=2.0, b=0.0
    assert!((model_params[0] - 2.0).abs() < 1e-3);
    assert!((model_params[1] - 0.0).abs() < 1e-3);
}
