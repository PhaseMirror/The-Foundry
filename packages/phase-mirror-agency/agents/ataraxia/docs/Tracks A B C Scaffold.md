# ✦ The transition to Phase 1 Execution is formalized.

Harness v1 successfully proved that the MultiplicityCell invariants are not merely mathematically sound, but capable
of discrete, bounded execution on min-spec hardware without violating latency constraints or breaking the L0
operator sequence.

To resolve the integration dissonance across Workstreams A, B, and C, I have generated the canonical shared fixture
library in tests/fixtures/:

- fixture.consent.001.json (Valid consent tensor, prime index 1009)
- fixture.model.001.json (Certified tier_2 model, prime index 2017)
- fixture.auth.001.json (Clinical auth, prime index 3019, 100 ACE units)
- fixture.fhir.observation.001.json (Synthetic FHIR Observation payload)
- fixture.peet.nominal.001.json (Nominal PEET signal, δ = 0.02)
- fixture.peet.collapse.001.json (Collapse tier PEET signal, δ = 0.35, custodian hold flag)

All three workstreams now have a shared integration substrate. They can build against exact mathematical knowns
rather than independent assumptions.

The workstreams are unblocked. How would you like to direct the execution—shall we initiate Workstream A (Archivum
Sprint), Workstream B (Thymos Runtime), or Workstream C (PEET Sentinel) first?

All three simultaneously. The fixture library eliminates the coordination dependency that would have required sequencing. Run them in parallel with one constraint: Workstream A has a gate that both B and C depend on.

***

## The Sequencing Constraint — Named Precisely

Workstream A has one milestone that blocks B and C from reaching the integration milestone — not from starting, but from completing:

> **The namespace resolver must be operational before either Thymos or PEET can produce Archivum-anchored records.**

B and C can build, test against fixtures, and validate their internal invariants independently for the full 30-day horizon. But the integration milestone — the single `agent_action` with a verified four-chain Archivum lineage — requires the resolver to be live.

Workstream A therefore has an internal deadline: **namespace resolver operational by day 14**. That is the one sequencing constraint. Everything else is parallel.

***

## Workstream A — Archivum Sprint — Day 1 Directive

The critical path through Workstream A is not the full CRDT implementation. It is the narrow path to a verifiable Merkle proof on a single record. Everything else is parallel to that path or downstream of it.

**Day 1–3: Prime Assignment Engine**

```python
# Minimal viable prime assignment
# Input:  namespace, node_id
# Output: next prime from pre-seeded local registry
# Assert: assigned prime is unique within namespace
# Assert: prime is within current batch reservation block (depth=500)

class LocalPrimeRegistry:
    def __init__(self, namespace: str, seed_block: list[int]):
        self.namespace = namespace
        self.reserved = deque(seed_block)  # 500 pre-seeded primes
        self.consumed = {}  # prime → record_id
        self.state = "RESERVED"

    def assign(self, record_id: str) -> int:
        if not self.reserved:
            raise PrimeExhaustionError("Batch reservation depleted")
        prime = self.reserved.popleft()
        self.consumed[prime] = record_id
        return prime

    def void_orphaned(self, prime: int):
        # VOID_ORPHANED tombstone — reclaims sequence space
        self.consumed[prime] = "VOID_ORPHANED"
```

**Day 3–7: Merkle-CRDT Local Node**

Single-node Archivum. No replication yet. The target is one verifiable Merkle proof:

```python
# Target artifact:
proof = archivum.anchor(
    record=fixture_consent_001,
    namespace="ahgi.consent",
    prime_index=1009
)
assert proof.verify() == True
assert proof.namespace == "ahgi.consent"
assert proof.prime_index == 1009
assert proof.record_hash == sha256(canonical(fixture_consent_001))
```

**Day 7–14: Namespace Resolver**

Read-critical. Called on every certification check. Latency budget is the binding constraint — it must resolve in under 10ms on min-spec hardware or it violates the `max_latency_ms` envelope of the clinical_auth tensor.

```python
# Namespace resolver — read path
def resolve(prime_index: int, namespace: str) -> ArchivumRecord:
    # Assert: prime_index exists in namespace partition
    # Assert: prime_index belongs to this node's reservation block
    # Assert: record is not VOID_ORPHANED
    # Return: full ArchivumRecord with Merkle proof
    # Latency: < 10ms on min-spec hardware
```

**Day 14–30: WAL + CRDT Reconciliation**

Once the resolver is live, B and C can reach the integration milestone. Workstream A then completes the WAL write path for async `agent_action` anchoring and the two-node CRDT partition test.

***

## Workstream B — Thymos Runtime — Day 1 Directive

The implementation sequence follows the operator order. Build innermost first.

**Day 1–7: $T_{\Lambda_m}$ — State Transition Operator**

```python
class MultiplicityCell:
    def __init__(self, agent_class: str, lambda_m: float, dim: int = 1024):
        self.agent_class = agent_class
        self.lambda_m = lambda_m
        self.dim = dim
        self.state = np.zeros(dim)
        self.ace_budget = None  # bound at clinical_auth load

    def T(self, psi: np.ndarray, x: np.ndarray) -> np.ndarray:
        # Contractive state transition
        # Must satisfy: ||T(psi)|| <= lambda_m * ||psi||
        psi_next = self.lambda_m * psi + (1 - self.lambda_m) * x
        assert np.linalg.norm(psi_next) <= self.lambda_m * np.linalg.norm(psi) + 1e-6
        return psi_next

    def Pi_CSL(self, psi: np.ndarray) -> tuple[np.ndarray, bool]:
        # Constitutional projector — checks all six L1-HC invariants
        # Returns projected state and pass/fail
        ...

    def P_E(self, psi: np.ndarray, confidence: float) -> tuple[np.ndarray, bool]:
        # Ethical projector — viability gate
        # Blocks if confidence < 0.6
        ...

    def step(self, x: np.ndarray, ace_cost: float) -> GovernanceVerdict:
        # Debit ACE at transition start — before any computation
        self.ace_budget.debit(ace_cost)  # raises on exhaustion

        psi_1 = self.T(self.state, x)
        psi_2, csl_pass = self.Pi_CSL(psi_1)
        psi_3, ethical_pass = self.P_E(psi_2, confidence=1.0 - peet_delta)

        self.state = psi_3
        return GovernanceVerdict(
            permitted=csl_pass and ethical_pass,
            new_state=psi_3,
            ace_consumed=ace_cost
        )
```

**Day 7–14: ExternalAgentInterface + GovernanceVerdict**

The canonical interface through which all agents submit proposals. This is the boundary — no agent touches the MultiplicityCell directly.

**Day 14–21: Phase Label Computation + Coherence Index**

Session-local classification. System-wide index publication to `spectral_integrity_agent`.

**Day 21–30: Integration milestone preparation**

Wire ExternalAgentInterface to fixture library. Validate full certification check block against `fixture.auth.001`.

***

## Workstream C — PEET Sentinel — Day 1 Directive

**Day 1–7: Threshold Validation Harness (Phase C1)**

All six fixture cases must pass before any sentinel code runs:

```python
def test_nominal_fixture():
    signal = load("fixture.peet.nominal.001.json")
    assert signal.peet_delta == 0.02
    assert classify(signal.peet_delta) == "nominal"
    assert thymos_would_accept(signal, tier="tier_2") == True

def test_collapse_fixture():
    signal = load("fixture.peet.collapse.001.json")
    assert signal.peet_delta == 0.35
    assert classify(signal.peet_delta) == "collapse"
    assert signal.custodian_hold == True
    assert thymos_would_accept(signal, tier="tier_2") == False

def test_staleness_tier3_boundary():
    signal = load("fixture.peet.nominal.001.json")
    signal.computed_at = now() - timedelta(milliseconds=499)
    assert thymos_staleness_check(signal, tier="tier_3") == "accept"
    signal.computed_at = now() - timedelta(milliseconds=501)
    assert thymos_staleness_check(signal, tier="tier_3") == "reject"

def test_session_binding():
    signal = load("fixture.peet.nominal.001.json")
    signal.session_id = "session_A"
    assert thymos_session_check(signal, current_session="session_B") == "reject"
```

**Day 7–21: Sentinel Implementation (Phase C2)**

PEET sentinel as sidecar to Thymos. Publishes signal on the interface spec contract. Consumes `fixture.model.001` drift baseline.

**Day 21–30: End-to-end signal flow validation**

PEET computes $\delta_{\text{PEET}}$ → Thymos consumes → `agent_action` telemetry records `peet_delta`. First complete signal flow. This is the Workstream C integration milestone.

***

## 30-Day Sprint Dashboard

```
Day  1-3   A: Prime assignment engine
Day  1-7   B: T_{Λ_m} operator + contraction assertion
Day  1-7   C: Threshold validation harness (Phase C1)

Day  3-7   A: Merkle-CRDT local node + single proof
Day  7-14  B: ExternalAgentInterface + GovernanceVerdict
Day  7-21  C: PEET sentinel implementation (Phase C2)

Day  7-14  A: ← GATE — Namespace resolver operational
                B and C unblocked for integration work

Day 14-21  B: Phase label computation + coherence index
Day 14-30  A: WAL + CRDT reconciliation test

Day 21-30  B: Integration milestone prep
Day 21-30  C: End-to-end signal flow validation

Day 30     INTEGRATION MILESTONE:
           Single clinical_safety_agent inference
           Six certification checks passed
           Four-chain Archivum lineage verified
           PEET delta recorded in telemetry
           ACE debit confirmed
           Explainability receipt generated
           Offline sovereign node
```

The sprint is fully specified. The integration milestone is reachable. Begin all three workstreams today.

