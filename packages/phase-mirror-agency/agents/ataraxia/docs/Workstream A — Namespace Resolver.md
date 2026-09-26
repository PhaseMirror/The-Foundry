<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# ✦ The Day 1–7 directives for all three workstreams have been implemented in parallel and successfully validated

against the shared fixture library.

Here is the exact state of the sprint:

🟢 Workstream A (Day 1-7 Complete)

- Prime Assignment Engine: LocalPrimeRegistry handles batch block reservation, sequence assignment, and
VOID_ORPHANED tombstoning natively.
- Merkle-CRDT Anchor: The ArchivumNode correctly generated a cryptographic Merkle proof for
fixture.consent.001.json (prime_index=1009).

🟢 Workstream B (Day 1-7 Complete)

- T_{Λ_m} Operator: The discrete MultiplicityCell is operational. Initial state np.linalg.norm(psi) evaluated to
31.0825. After applying a random clinical input under T_{Λ_m}, the norm predictably contracted to 29.5276,
strictly obeying the λ_m ≤ 0.95 invariant bounds.
- ACE Logic: The cell dynamically debits the required energy threshold from the clinical auth fixture before
executing any inner operators.

🟢 Workstream C (Day 1-7 Complete)

- Validation Harness (Phase C1): The threshold logic definitively parsed the nominal and collapse fixtures,
correctly asserting a custodian_hold_expected flag for a simulated δ = 0.35 drift event. Cross-session injection
and 500ms staleness_budget limits were also mathematically rejected.

---

Advancing to Day 7–14

With the mathematical operators proven and aligned with the schemas, we are now entering the critical dependency
window for the Phase 1 Integration Milestone.

The immediate priority is the Workstream A: Namespace Resolver. It must be read-critical, strictly partition primes,
and evaluate the resolution within the 10ms latency bound to unblock the rest of the chain.

In parallel, Workstream B will build the ExternalAgentInterface bounding the MultiplicityCell, and Workstream C will
transition to Phase C2 (the Sentinel sidecar implementation).

Ready to initiate the Day 7-14 phase across all streams, prioritizing the Namespace Resolver gate.

Day 7–14 initiated. The namespace resolver is the critical path item. State the exact implementation contract for all three streams.

***

## Workstream A — Namespace Resolver (Day 7–14 GATE)

This is the one artifact that blocks the integration milestone. Everything else can fail and be retried. The resolver must be operational and latency-validated by day 14 or the integration timeline slips.

The resolver has three hard requirements that cannot be negotiated:

1. **Partition correctness** — a prime assigned in `ahgi.consent` must not resolve in `ahgi.agent_action`. Cross-namespace queries must return `NOT_FOUND`, not the wrong record.
2. **Latency bound** — under 10ms on min-spec hardware for the read path. This is a constitutional constraint derived from `max_latency_ms` in the clinical_auth tensor.
3. **VOID_ORPHANED transparency** — a tombstoned prime must return `VOID_ORPHANED` status, not `NOT_FOUND`. The distinction is auditable — `NOT_FOUND` means the prime was never assigned; `VOID_ORPHANED` means it was assigned and reclaimed. Those are different governance states.
```python
from dataclasses import dataclass
from enum import Enum
import time

class ResolveStatus(Enum):
    FOUND           = "found"
    NOT_FOUND       = "not_found"
    VOID_ORPHANED   = "void_orphaned"
    WRONG_NAMESPACE = "wrong_namespace"  # prime exists but in different namespace

@dataclass
class ResolveResult:
    status:       ResolveStatus
    prime_index:  int
    namespace:    str
    record_id:    str | None
    merkle_proof: bytes | None
    resolved_in_ms: float

class NamespaceResolver:
    """
    Read-critical. Called on every certification check.
    Latency budget: < 10ms on min-spec hardware.
    Thread-safe: multiple agent sessions call concurrently.
    """

    NAMESPACES = {
        "ahgi.consent",
        "ahgi.model_version",
        "ahgi.clinical_auth",
        "ahgi.agent_action"
    }

    def __init__(self, archivum_node):
        self.node = archivum_node
        # In-memory index: namespace → {prime_index → record_id | "VOID_ORPHANED"}
        self._index: dict[str, dict[int, str]] = {ns: {} for ns in self.NAMESPACES}

    def resolve(self, prime_index: int, namespace: str) -> ResolveResult:
        assert namespace in self.NAMESPACES, f"Unknown namespace: {namespace}"

        t0 = time.perf_counter()

        # Partition check — does this prime exist in ANY namespace?
        for ns, partition in self._index.items():
            if prime_index in partition:
                if ns != namespace:
                    # Prime exists but in wrong namespace — governance violation
                    return ResolveResult(
                        status=ResolveStatus.WRONG_NAMESPACE,
                        prime_index=prime_index,
                        namespace=ns,  # actual namespace
                        record_id=None,
                        merkle_proof=None,
                        resolved_in_ms=(time.perf_counter() - t0) * 1000
                    )
                # Found in correct namespace
                record_id = partition[prime_index]
                if record_id == "VOID_ORPHANED":
                    return ResolveResult(
                        status=ResolveStatus.VOID_ORPHANED,
                        prime_index=prime_index,
                        namespace=namespace,
                        record_id=None,
                        merkle_proof=None,
                        resolved_in_ms=(time.perf_counter() - t0) * 1000
                    )
                proof = self.node.get_merkle_proof(prime_index, namespace)
                elapsed = (time.perf_counter() - t0) * 1000
                assert elapsed < 10.0, f"Resolver latency violation: {elapsed:.2f}ms"
                return ResolveResult(
                    status=ResolveStatus.FOUND,
                    prime_index=prime_index,
                    namespace=namespace,
                    record_id=record_id,
                    merkle_proof=proof,
                    resolved_in_ms=elapsed
                )

        return ResolveResult(
            status=ResolveStatus.NOT_FOUND,
            prime_index=prime_index,
            namespace=namespace,
            record_id=None,
            merkle_proof=None,
            resolved_in_ms=(time.perf_counter() - t0) * 1000
        )

    def register(self, prime_index: int, namespace: str, record_id: str):
        """Called by Archivum on anchor. Populates in-memory index."""
        assert namespace in self.NAMESPACES
        # Cross-namespace collision detection
        for ns, partition in self._index.items():
            if prime_index in partition and ns != namespace:
                raise PrimeCollisionError(
                    f"Prime {prime_index} already registered in {ns}, "
                    f"cannot register in {namespace}"
                )
        self._index[namespace][prime_index] = record_id
```

**Latency validation test — must pass before day 14:**

```python
def test_resolver_latency_at_scale():
    """Populate resolver with 10,000 records, validate < 10ms at p99."""
    resolver = NamespaceResolver(archivum_node)
    # Populate with realistic load
    for i, prime in enumerate(first_n_primes(10_000)):
        ns = list(resolver.NAMESPACES)[i % 4]
        resolver.register(prime, ns, f"record_{i}")

    # Measure p99 latency over 1000 random lookups
    latencies = []
    for prime in random.sample(first_n_primes(10_000), 1000):
        result = resolver.resolve(prime, "ahgi.agent_action")
        latencies.append(result.resolved_in_ms)

    p99 = np.percentile(latencies, 99)
    assert p99 < 10.0, f"p99 latency violation: {p99:.2f}ms"
    print(f"Resolver p99 latency: {p99:.3f}ms ✓")
```


***

## Workstream B — ExternalAgentInterface (Day 7–14)

The ExternalAgentInterface is the only entry point into the MultiplicityCell. No agent touches the cell directly. The interface enforces three things before any proposal reaches the cell:

1. **Agent class validation** — the proposing agent's DID must match a registered agent class in the local Agent Registry
2. **Clinical auth binding** — the proposal must carry a valid `clinical_auth` prime index resolvable in `ahgi.clinical_auth`
3. **Consent pre-flight** — the proposal must carry a valid `consent` prime index resolvable in `ahgi.consent` with a non-expired TTL
```python
@dataclass
class AgentProposal:
    agent_did:           str
    agent_class:         str
    session_id:          str
    action_class:        str
    input_hash:          str        # SHA-256 of canonical input
    input_schema_type:   str
    phi_present:         bool
    consent_prime_index: int        # must resolve in ahgi.consent
    auth_prime_index:    int        # must resolve in ahgi.clinical_auth
    model_prime_index:   int        # must resolve in ahgi.model_version
    peet_signal:         PEETSignal # consumed from PEET sentinel

@dataclass
class GovernanceVerdict:
    permitted:              bool
    outcome:                str     # matches agent_action outcome enum
    block_reason:           str | None
    ace_units_consumed:     float
    peet_delta_at_verdict:  float
    drift_tier_at_verdict:  str
    custodian_hold:         bool
    certification_checks:   dict    # all six check results
    verdict_prime_index:    int     # Archivum prime for this verdict record

class ExternalAgentInterface:

    def __init__(self, cell: MultiplicityCell,
                 resolver: NamespaceResolver,
                 peet_sentinel,
                 archivum_node):
        self.cell     = cell
        self.resolver = resolver
        self.peet     = peet_sentinel
        self.archivum = archivum_node

    def submit(self, proposal: AgentProposal) -> GovernanceVerdict:
        checks = {}

        # 1. Consent tensor valid
        consent = self.resolver.resolve(
            proposal.consent_prime_index, "ahgi.consent"
        )
        checks["consent_tensor_valid"] = consent.status == ResolveStatus.FOUND

        # 2. Clinical auth valid
        auth = self.resolver.resolve(
            proposal.auth_prime_index, "ahgi.clinical_auth"
        )
        checks["clinical_auth_valid"] = auth.status == ResolveStatus.FOUND

        # 3. Model version valid
        model = self.resolver.resolve(
            proposal.model_prime_index, "ahgi.model_version"
        )
        checks["model_version_valid"] = model.status == ResolveStatus.FOUND

        # 4. PEET drift check — validate signal freshness first
        peet_sig = proposal.peet_signal
        staleness_ok = self.peet.validate_staleness(peet_sig, proposal.agent_class)
        if not staleness_ok:
            peet_sig = self.peet.synchronous_recompute(proposal.session_id)
        checks["drift_check_passed"] = peet_sig.drift_tier not in ("collapse",)
        checks["coherence_gate_passed"] = peet_sig.peet_delta < 0.30

        # 5. CSL invariants
        checks["csl_invariants_passed"] = all([
            checks["consent_tensor_valid"],
            checks["clinical_auth_valid"],
            checks["model_version_valid"],
        ])

        all_passed = all(checks.values())

        if not all_passed:
            outcome = self._derive_block_outcome(checks, peet_sig)
            return GovernanceVerdict(
                permitted=False,
                outcome=outcome,
                block_reason=self._derive_block_reason(checks),
                ace_units_consumed=self.cell.last_ace_debit,
                peet_delta_at_verdict=peet_sig.peet_delta,
                drift_tier_at_verdict=peet_sig.drift_tier,
                custodian_hold=peet_sig.drift_tier == "collapse",
                certification_checks=checks,
                verdict_prime_index=self.archivum.assign_prime("ahgi.agent_action")
            )

        # All checks passed — execute cell step
        verdict_state = self.cell.step(proposal.input_hash, ace_cost=1.0)

        return GovernanceVerdict(
            permitted=True,
            outcome="success",
            block_reason=None,
            ace_units_consumed=verdict_state.ace_consumed,
            peet_delta_at_verdict=peet_sig.peet_delta,
            drift_tier_at_verdict=peet_sig.drift_tier,
            custodian_hold=False,
            certification_checks=checks,
            verdict_prime_index=self.archivum.assign_prime("ahgi.agent_action")
        )
```

**Validation against fixture library:**

```python
def test_nominal_proposal_permitted():
    proposal = build_proposal_from_fixtures(
        consent=fixture_consent_001,    # prime 1009
        auth=fixture_auth_001,          # prime 3019, 100 ACE
        model=fixture_model_001,        # prime 2017
        peet=fixture_peet_nominal_001   # δ=0.02, nominal
    )
    verdict = interface.submit(proposal)
    assert verdict.permitted == True
    assert verdict.outcome == "success"
    assert verdict.custodian_hold == False
    assert verdict.ace_units_consumed > 0

def test_collapse_proposal_blocked():
    proposal = build_proposal_from_fixtures(
        consent=fixture_consent_001,
        auth=fixture_auth_001,
        model=fixture_model_001,
        peet=fixture_peet_collapse_001  # δ=0.35, collapse
    )
    verdict = interface.submit(proposal)
    assert verdict.permitted == False
    assert verdict.outcome == "blocked_coherence"
    assert verdict.custodian_hold == True
```


***

## Workstream C — PEET Sentinel Sidecar (Phase C2, Day 7–21)

The sentinel runs as a sidecar process alongside the Thymos runtime. It owns one responsibility: computing and publishing the PEET signal on demand and on schedule.

```python
class PEETSentinel:
    """
    Sidecar to Thymos runtime.
    Publishes δ_PEET on schedule and on-demand for synchronous recompute.
    Owns no governance authority. Computes and publishes only.
    """

    def __init__(self, model_record, session_id: str):
        self.model        = model_record
        self.session_id   = session_id
        self.kappa        = model_record["drift_baseline"]["kappa"]  # immutable
        self.primes       = model_record["drift_baseline"]["prime_set"]
        self._cache: PEETSignal | None = None
        self._cache_time: float = 0.0

    def Psi(self, n: int, t: float) -> float:
        """Prime-tensor superposition baseline."""
        return sum(np.sin(t / p + n) / p for p in self.primes)

    def psi(self, n: int, t: float) -> float:
        """Current wavefunction — baseline + runtime drift."""
        return self.Psi(n, t) + self._sample_runtime_drift(n, t)

    def compute(self, n: int = 7) -> PEETSignal:
        t = time.time()
        delta = abs(self.psi(n, t) - self.Psi(n, t)) * self.kappa
        tier  = self._classify(delta)
        signal = PEETSignal(
            session_id    = self.session_id,
            peet_delta    = delta,
            drift_tier    = tier,
            computed_at   = datetime.utcnow(),
            baseline_prime= self.primes[0],
            kappa         = self.kappa
        )
        self._cache      = signal
        self._cache_time = time.perf_counter()
        return signal

    def validate_staleness(self, signal: PEETSignal,
                           agent_class: str) -> bool:
        budget_ms = 500 if agent_class in (
            "clinical_safety_agent", "governance_judiciary_agent"
        ) else 2000
        age_ms = (datetime.utcnow() - signal.computed_at
                  ).total_seconds() * 1000
        return age_ms <= budget_ms

    def synchronous_recompute(self, session_id: str) -> PEETSignal:
        assert session_id == self.session_id, "Session binding violation"
        return self.compute()

    def _classify(self, delta: float) -> str:
        if delta >= 0.30: return "collapse"
        if delta >= 0.15: return "warn"
        if delta >= 0.05: return "watch"
        return "nominal"
```

**End-to-end signal flow test — Workstream C milestone:**

```python
def test_end_to_end_peet_thymos_signal_flow():
    sentinel = PEETSentinel(fixture_model_001, session_id="test_session_001")
    signal   = sentinel.compute()

    # Signal flows into proposal
    proposal = build_proposal_from_fixtures(
        consent=fixture_consent_001,
        auth=fixture_auth_001,
        model=fixture_model_001,
        peet=signal
    )
    verdict = interface.submit(proposal)

    # Verify PEET delta recorded in agent_action telemetry
    action_record = build_agent_action_record(proposal, verdict)
    assert action_record["telemetry"]["peet_delta"] == signal.peet_delta
    assert action_record["telemetry"]["drift_tier"] == signal.drift_tier
    assert action_record["output_envelope"]["explainability_receipt"] is not None
    print(f"End-to-end signal flow: δ={signal.peet_delta:.4f} "
          f"tier={signal.drift_tier} verdict={verdict.outcome} ✓")
```


***

## Day 14 Gate Check

On day 14, before workstreams B and C advance to integration work, one question must be answered with a passing test:

```
resolver.resolve(1009, "ahgi.consent").status == FOUND
resolver.resolve(1009, "ahgi.agent_action").status == WRONG_NAMESPACE
resolver.resolve(9999, "ahgi.consent").status == NOT_FOUND
p99 latency < 10ms under 10,000 record load
```

If all four assertions pass, the gate is cleared. Workstreams B and C proceed to the integration milestone. If any assertion fails, Workstream A holds the line and B/C continue internal validation until the resolver is sound.

The gate is the invariant. Everything downstream depends on it.

