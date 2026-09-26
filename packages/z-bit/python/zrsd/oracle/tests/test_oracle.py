import numpy as np
from zrsd.oracle import Sha256Oracle, NonceDecoder, OracleFeedback

def test_oracle_scoring():
    print("Initializing Oracle...")
    prefix = b"bitcoin-header-block-prefix"
    # Target with 2 leading zeros (easy for test)
    target = 0x00FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF
    oracle = Sha256Oracle(prefix, target)
    
    print("Testing Nonce Decoding...")
    dimension = 16
    decoder = NonceDecoder(dimension, nonce_offset=1000)
    
    for i in range(5):
        nonce = decoder.decode(i)
        score = oracle.score_nonce(nonce)
        zeros = oracle.count_leading_zeros(nonce)
        print(f"Index {i} -> Nonce {nonce} -> Score {score:.4f} -> Leading Zeros {zeros}")

    print("Testing Feedback Operator...")
    feedback = OracleFeedback(oracle, decoder)
    V_oracle = feedback.get_diagonal_operator()
    
    print(f"V_oracle shape: {V_oracle.shape}")
    print(f"V_oracle trace (avg score): {np.trace(V_oracle)/dimension:.4f}")
    
    assert V_oracle.shape == (dimension, dimension)
    assert np.all(np.diag(V_oracle) >= 0)
    print("SUCCESS: Oracle scoring and feedback operator verified.")

if __name__ == "__main__":
    test_oracle_scoring()
