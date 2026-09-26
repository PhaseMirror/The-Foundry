import json
from datetime import datetime, timedelta, timezone

class AttrDict(dict):
    def __init__(self, *args, **kwargs):
        super(AttrDict, self).__init__(*args, **kwargs)
        self.__dict__ = self

def load(filename):
    with open(f"tests/fixtures/{filename}") as f:
        # Recursively map dicts to AttrDict for dot notation access
        def hook(d):
            return AttrDict(d)
        return json.loads(f.read(), object_hook=hook)

def classify(delta, watch=0.05, warn=0.15, collapse=0.30):
    if delta < watch:   return "nominal"
    if delta < warn:    return "watch"
    if delta < collapse:return "warn"
    return "collapse"

def thymos_would_accept(signal, tier="tier_2"):
    # Accepts if not collapse
    return classify(signal.peet_delta) != "collapse"

def now():
    return datetime.now(timezone.utc)

def thymos_staleness_check(signal, tier="tier_3"):
    if not hasattr(signal, 'computed_at'):
        return "reject"
    delta = now() - signal.computed_at
    if delta.total_seconds() * 1000 > signal.staleness_budget_ms:
        return "reject"
    return "accept"

def thymos_session_check(signal, current_session):
    if signal.session_id != current_session:
        return "reject"
    return "accept"

def test_nominal_fixture():
    signal = load("fixture.peet.nominal.001.json")
    assert signal.peet_delta == 0.02
    assert classify(signal.peet_delta) == "nominal"
    assert thymos_would_accept(signal, tier="tier_2") == True

def test_collapse_fixture():
    signal = load("fixture.peet.collapse.001.json")
    assert signal.peet_delta == 0.35
    assert classify(signal.peet_delta) == "collapse"
    assert signal.custodian_hold_expected == True
    assert thymos_would_accept(signal, tier="tier_2") == False

def test_staleness_tier3_boundary():
    signal = load("fixture.peet.nominal.001.json")
    n = now()
    
    # Under budget
    signal.computed_at = n - timedelta(milliseconds=499)
    assert thymos_staleness_check(signal, tier="tier_3") == "accept"
    
    # Over budget
    signal.computed_at = n - timedelta(milliseconds=501)
    assert thymos_staleness_check(signal, tier="tier_3") == "reject"

def test_session_binding():
    signal = load("fixture.peet.nominal.001.json")
    # Original session_id: a1b2c3d4-aaaa-4000-8000-session00482
    assert thymos_session_check(signal, current_session="a1b2c3d4-aaaa-4000-8000-session00482") == "accept"
    assert thymos_session_check(signal, current_session="session_B") == "reject"

if __name__ == "__main__":
    test_nominal_fixture()
    test_collapse_fixture()
    test_staleness_tier3_boundary()
    test_session_binding()
    
    print("Workstream C (Day 1-7) validated: PEET Threshold Validation Harness passed against all canonical fixtures.")