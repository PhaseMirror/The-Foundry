use the_genius_rs::zmod::multiplicity::{MultiplicityCell, PIRTMSubstrate};

#[test]
fn test_cell_update() {
    let mut cell = MultiplicityCell::new(2.0, 4);
    let input_t = vec![1.0, 1.0, 1.0, 1.0];
    let recur_t = vec![0.0, 0.0, 0.0, 0.0];

    // First update: combined = 0.5 * 1.0 + 0.0 = 0.5
    // output = tanh(0.5)
    let out = cell.update(&input_t, &recur_t);
    let expected = 0.5f64.tanh();
    assert!((out[0] - expected).abs() < 1e-5);
}

#[test]
fn test_substrate_forward() {
    let primes = vec![2, 3];
    let mut substrate = PIRTMSubstrate::new(Some(primes), 4);
    let x = vec![1.0, 1.0, 1.0, 1.0];

    let out = substrate.forward(&x);
    // Output should be (Primes count, Hidden dim) -> (2, 4)
    assert_eq!(out.len(), 2);
    assert_eq!(out[0].len(), 4);
    assert_eq!(out[1].len(), 4);

    // Verify cell 2 output: tanh(0.5 * 1.0 + 0.0) = tanh(0.5)
    let expected_2 = 0.5f64.tanh();
    for &val in &out[0] {
        assert!((val - expected_2).abs() < 1e-5);
    }

    // Verify cell 3 output: tanh((1/3) * 1.0 + expected_2)
    let expected_3 = ((1.0 / 3.0) + expected_2).tanh();
    for &val in &out[1] {
        assert!((val - expected_3).abs() < 1e-5);
    }
}
