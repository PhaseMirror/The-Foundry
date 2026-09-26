import json
from zrsd.attestation import PWEHLogger, PWEHVerifier

def test_pweh_pipeline():
    print("Initializing PWEH Logger...")
    logger = PWEHLogger(run_id="test-run-001")
    
    # Simulate a trajectory
    print("Logging steps...")
    logger.log_step(
        time_t=0.0, 
        active_prime=2, 
        operator_id="H_zeta", 
        norm_mult=1.0, 
        lambda_m_cert=True, 
        oracle_score=0.1, 
        state_digest="hash0"
    )
    
    logger.log_step(
        time_t=0.5, 
        active_prime=3, 
        operator_id="L_k", 
        norm_mult=1.2, 
        lambda_m_cert=True, 
        oracle_score=0.15, 
        state_digest="hash1"
    )
    
    logger.log_step(
        time_t=1.0, 
        active_prime=2, 
        operator_id="Xi_oracle", 
        norm_mult=0.9, 
        lambda_m_cert=True, 
        oracle_score=0.05, 
        state_digest="hash2"
    )
    
    log = logger.get_log()
    print(f"Log captured with {len(log)} steps.")
    
    # Verify the log
    print("Verifying log integrity...")
    verifier = PWEHVerifier()
    log_data = {
        "run_id": logger.run_id,
        "steps": log
    }
    
    is_valid = verifier.verify_log(log_data)
    if is_valid:
        print("SUCCESS: Log integrity verified.")
    else:
        print("FAILURE: Log integrity check failed.")
        exit(1)

    # Test tampering
    print("Testing tampering detection...")
    tampered_log = json.loads(json.dumps(log_data))
    tampered_log["steps"][1]["oracle_score"] = 0.99 # Tamper with score
    
    is_valid_tampered = verifier.verify_log(tampered_log)
    if not is_valid_tampered:
        print("SUCCESS: Tampering detected.")
    else:
        print("FAILURE: Tampering went undetected.")
        exit(1)

if __name__ == "__main__":
    test_pweh_pipeline()
