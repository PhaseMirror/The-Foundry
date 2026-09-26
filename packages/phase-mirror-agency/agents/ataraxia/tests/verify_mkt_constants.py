# tests/verify_mkt_constants.py
import math
import cmath

ALPHA_K = (math.pi - 1) / 2  # authoritative definition

def test_alpha_k_value():
    assert abs(ALPHA_K - 1.07080) < 1e-5, f"ALPHA_K={ALPHA_K}"

def test_cos_alpha_k():
    assert abs(math.cos(ALPHA_K) - 0.47943) < 1e-5

def test_su2_identity():
    # A_K = e^(i*alpha_k), unit modulus
    # -(A_K^2 + A_K^-2) = 2*cos(1)
    A_K = cmath.exp(1j * ALPHA_K)
    lhs = -(A_K**2 + A_K**-2)
    rhs = 2 * math.cos(1)
    assert abs(lhs.real - rhs) < 1e-5, f"lhs={lhs.real}, rhs={rhs}"
    assert abs(lhs.imag) < 1e-10, f"imaginary residual={lhs.imag}"

def test_wrong_value_rejected():
    wrong = math.pi / 2 - 1  # the transcription error
    assert abs(wrong - ALPHA_K) > 0.4, "transcription error not caught"

if __name__ == "__main__":
    test_alpha_k_value()
    test_cos_alpha_k()
    test_su2_identity()
    test_wrong_value_rejected()
    print("All MKT constant tests passed.")
    print(f"  ALPHA_K     = {ALPHA_K:.8f}")
    print(f"  cos(ALPHA_K)= {math.cos(ALPHA_K):.8f}")
