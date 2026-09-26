import pytest
from zrsd.core.decomposition import get_prime_factors, PrimeAnchor

def test_prime_factorization_basic():
    assert get_prime_factors(2) == {2: 1}
    assert get_prime_factors(12) == {2: 2, 3: 1}
    assert get_prime_factors(30) == {2: 1, 3: 1, 5: 1}
    assert get_prime_factors(1) == {}

def test_prime_factorization_large():
    # 104729 is the 10000th prime
    assert get_prime_factors(104729) == {104729: 1}
    assert get_prime_factors(104729 * 2) == {2: 1, 104729: 1}

def test_prime_anchor_decomposition():
    anchor = PrimeAnchor(60)
    assert anchor.decompose() == {2: 2, 3: 1, 5: 1}

def test_prime_anchor_invalid():
    with pytest.raises(ValueError):
        PrimeAnchor(0)
    with pytest.raises(ValueError):
        PrimeAnchor(-5)
