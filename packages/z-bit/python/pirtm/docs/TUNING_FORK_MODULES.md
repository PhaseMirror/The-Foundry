# Tuning Fork Section: PIRTM Module Registry

**Multiplicity Foundation | Meta-Relativity v1.0**  
**Provenance:** MultiplicityFoundation/Meta-Relativity  
**Registry Format:** JSON (self-declaration)  
**Version:** 1.0  
**Date:** March 2026  
**Related:** [PRIME_FREQUENCY_PRINCIPLE.md](PRIME_FREQUENCY_PRINCIPLE.md), [XI_OPERATOR_NOTE.md](XI_OPERATOR_NOTE.md)

---

## Table of Contents

1. What Is a Tuning Fork?
2. Module Registration Lifecycle
3. JSON Schema for Tuning Fork Entry
4. Module Metadata Requirements
5. Prime Invariant Declaration Format
6. Self-Certification Checklist
7. Example Registrations
8. Audit Checklist for Reviewers
9. Revocation & Appeal Process

---

## 1. What Is a Tuning Fork?

### 1.1 Definition

A **Tuning Fork** is a self-declaration by a module author that their module satisfies the Prime Frequency Principle. It consists of:

1. **Module metadata** (name, version, git remote, commit hash)
2. **Prime invariant** (the declared prime index $p$)
3. **Test certificate** (proof that `test_false_xi.py` passed)
4. **Cryptographic signature** (optional, for deployment chains)

### 1.2 Why "Tuning Fork"?

In physics, a tuning fork vibrates at a precise, single frequency. Analogously:

- A PIRTM module "vibrates" at a single prime frequency $p$
- The Tuning Fork registry lets modules announce their frequency
- Partners can tune their modules to compatible frequencies for entanglement

### 1.3 Legal Obligation

By registering a Tuning Fork, you are asserting:

> "This module passes all five Ξ(t) invariants (INV-1 through INV-5). Any claim otherwise is grounds for revocation and audit escalation."

See [TRANSPARENCY_CLAUSE.md](TRANSPARENCY_CLAUSE.md) for full obligations.

---

## 2. Module Registration Lifecycle

### 2.1 States

```
┌─────────┐
│  DRAFT  │ (Author fills Tuning Fork, not yet submitted)
└────┬────┘
     │ submit_for_review
     ↓
┌─────────────────────────┐
│  PENDING_REVIEW         │ (Auditor verifies claim)
└──┬──────────────────┬───┘
   │ approved         │ denied
   ↓                  ↓
┌──────────┐     ┌──────────┐
│ APPROVED │     │  DENIED  │
└────┬─────┘     └──────────┘
     │ deploy
     ↓
┌──────────────┐
│  DEPLOYED    │ (Live in registry)
└────┬─────────┘
     │ revoke (if violation detected)
     ↓
┌──────────┐
│ REVOKED  │ (Grayed-out badge, logged reason)
└──────────┘
```

### 2.2 Timeline

| Step | Actor | Duration | Actions |
|------|-------|----------|---------|
| 1. DRAFT | Author | 1–3 days | Fill Tuning Fork JSON, run tests |
| 2. PENDING_REVIEW | Auditor | 3–7 days | Clone-check, verify tests, review mathematics |
| 3. APPROVED | Governance | 1 day | Sign approval, create badge |
| 4. DEPLOYED | System | Ongoing | Registry published, partners can link |
| 5. REVOKED (if needed) | Governance | 1 day | Audit escalation, communicate to partners |

---

## 3. JSON Schema for Tuning Fork Entry

### 3.1 Complete JSON Schema

```json
{
  "tuning_fork_version": "1.0",
  "module_name": "string (required)",
  "module_version": "string (required, semantic versioning)",
  "git_remote_origin": "string (required, https://github.com/...)",
  "git_commit_hash": "string (required, 40-char hex)",
  "prime_index": "integer (required, prime > 1)",
  "prime_index_immutable": "boolean (required, must be true)",
  "universal_constant_U": "number (required, exactly 1.0)",
  "test_suite_version": "string (required, e.g. 'pirtm/tests/test_false_xi.py v1.0')",
  "test_results": {
    "inv_1_contractive": "boolean (required)",
    "inv_2_prime_dimension": "boolean (required)",
    "inv_3_kk_spectral_gap": "boolean (required)",
    "inv_4_universal_constant_decay_rate": "boolean (required)",
    "inv_5_seed_determinism": "boolean (required)",
    "all_pass": "boolean (required, true iff all 5 are true)"
  },
  "transparency_clause_accepted": "boolean (required, must be true)",
  "clone_check_status": "string (enum: 'PASS', 'REVIEW', 'PENDING')",
  "clone_check_trace": "string (optional, audit log or manual review notes)",
  "author_name": "string (required)",
  "author_email": "string (required, valid email)",
  "organization": "string (optional, institution or company)",
  "registration_timestamp": "ISO 8601 string (required, timestamp when submitted)",
  "signature": {
    "public_key": "string (optional, PEM format)",
    "signature_hex": "string (optional, 128-char hex for SHA256-ECDSA)",
    "sign_timestamp": "ISO 8601 string (optional)"
  },
  "metadata": {
    "description": "string (optional, human-readable summary)",
    "use_case": "string (optional, e.g. 'machine learning', 'cryptography')",
    "performance_notes": "string (optional, runtime characteristics)"
  }
}
```

### 3.2 Validation Rules

**required fields:**
- All fields marked `(required)` must be present and non-null
- `prime_index_immutable` must be `true`
- `universal_constant_U` must be exactly `1.0` (no tolerance)
- `all_pass` must be `true` (no partial passes)
- `transparency_clause_accepted` must be `true`

**format rules:**
- `git_commit_hash`: exactly 40 hex characters (`[0-9a-f]{40}`)
- `module_version`: semantic versioning (`^\d+\.\d+\.\d+$` for major.minor.patch)
- `prime_index`: verified to be prime via Miller-Rabin (see § 3.3)
- `author_email`: valid RFC 5322 email address
- `registration_timestamp`: valid ISO 8601 (e.g. `2026-03-17T14:30:00Z`)

### 3.3 Prime Verification

The `prime_index` field is checked via **Miller-Rabin primality test** with at least 40 rounds:

```python
def is_prime_checked(n, rounds=40):
    """Returns True iff n is prime with error probability < 2^{-40}."""
    # Implementation: Miller-Rabin or AKS
    pass

if not is_prime_checked(prime_index, rounds=40):
    raise ValidationError(f"{prime_index} is not prime")
```

**Why:** Composite primes must be rejected. No exceptions.

---

## 4. Module Metadata Requirements

Every Tuning Fork entry must declare:

### 4.1 Identity Metadata

- **module_name:** Official name (no spaces, snake_case recommended)
  - Example: `gft_melonic_graph`, `kk_5d_encoder`
  - Constraint: Must match the module's source code identifier
  - Uniqueness: Cannot duplicate existing registered name

- **module_version:** Semantic version (major.minor.patch)
  - Example: `1.0.0`, `0.5.2`, `2.1.0`
  - Constraint: Must match version in module's source or `pyproject.toml`
  - Update rule: Each new registration must increment patch (or higher)

- **git_remote_origin:** Full HTTPS clone URL
  - Example: `https://github.com/MultiplicityFoundation/Meta-Relativity`
  - Constraint: Must be publicly accessible
  - Verification: Registry CI/CD will clone and verify commit hash

- **git_commit_hash:** Exact commit for which tests were run
  - Example: `a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b`
  - Constraint: 40 hex characters, must exist in remote origin
  - Verification: `git ls-remote origin <hash>` must succeed

### 4.2 Governance Metadata

- **prime_index:** The declared prime for this module (fixed, immutable)
  - Constraint: Must be prime (checked via Miller-Rabin)
  - Verification: Will be re-checked on every audit

- **prime_index_immutable:** Boolean asserting that prime stays fixed
  - Constraint: Must be `true`
  - Why: If prime could change, no guarantee of contractivity

- **universal_constant_U:** The Ξ(t) scaling constant
  - Constraint: Must be exactly `1.0` (stored as float, compared with abs(U - 1.0) < 1e-15)
  - Verification: Any deviation triggers rejection

### 4.3 Test Metadata

- **test_suite_version:** Identifies which test suite was run
  - Example: `pirtm/tests/test_false_xi.py v1.0`
  - Constraint: Must match the official test suite in PIRTM repo
  - Rationale: Ensures reproducibility; tests are frozen per version

- **test_results:** Dict of 5 booleans (one per INV)
  - Constraint: All must be `true`; `"all_pass": true` iff all 5 pass
  - Verification: CI/CD will re-run tests to confirm

- **clone_check_status:** One of `{'PASS', 'REVIEW', 'PENDING'}`
  - `PASS`: Clone-check confirmed (no illegal derivative)
  - `REVIEW`: Manual review in progress (auditor investigating)
  - `PENDING`: Not yet checked
  - Constraint: Must eventually reach `PASS` before deployment

---

## 5. Prime Invariant Declaration Format

### 5.1 Declaration Section

Each Tuning Fork entry includes a human-readable **prime invariant declaration**:

```markdown
## Prime Invariant

This module declares:

- **Prime Index:** p = 13
- **Decay Law:** ||Ξ(t)ψ|| = exp(-U * log(13) * t) * ||ψ||
- **Contractivity:** Guaranteed for all t > 0
- **Entanglement-Ready:** Yes (compatible with any module where p is prime)
- **Test Status:** All 5 INVs passing (as of commit a1b2c3d4...)

By registering, I assert that this module satisfies the Prime Frequency Principle
and will not be modified in ways that violate these properties.
```

### 5.2 Formal Invariant

Machine-readable invariant (for auditors):

```json
"prime_invariant": {
  "type": "prime_field_xi_t",
  "prime_index": 13,
  "decay_law": "exp(-1.0 * log(13) * t)",
  "contractivity_proof": "INV-1 test passed",
  "entanglement_compatible": true,
  "locked_at_commit": "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b"
}
```

---

## 6. Self-Certification Checklist

### 6.1 Author Responsibilities

Before submitting a Tuning Fork, verify:

- [ ] Module source code is in a public git repository
- [ ] `git commit <hash>` exists and is modern (within 1 year)
- [ ] `test_false_xi.py` passes all 5 invariants
- [ ] Prime index is hardcoded and immutable in source
- [ ] `U = 1.0` is hardcoded (no configuration override)
- [ ] Module compiles and imports without errors
- [ ] No external dependencies are blacklisted
- [ ] Documentation includes reference to Prime Frequency Principle
- [ ] I (author) accept the Transparency Clause (need to acknowledge)
- [ ] Clone-check protocol is complete or marked PENDING

### 6.2 Author Attestation

The author must sign (or digitally sign) this statement:

> "I certify that the software at [git_remote_origin] commit [git_commit_hash]
> implements the Ξ(t) operator correctly, passes all five invariants (INV-1 through INV-5),
> and declares prime index p = [prime_index] as immutable.
>
> I further certify that I have read and accept the Prime-Frequency Transparency Clause
> and acknowledge the obligations to preserve provenance and submit to audits.
>
> Signed: [author_name] on [date]"

---

## 7. Example Registrations

### 7.1 Example 1: GFT Melonic Graph (p=13)

```json
{
  "tuning_fork_version": "1.0",
  "module_name": "gft_melonic_graph",
  "module_version": "1.0.0",
  "git_remote_origin": "https://github.com/ExampleOrg/gft-pirtm",
  "git_commit_hash": "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b",
  "prime_index": 13,
  "prime_index_immutable": true,
  "universal_constant_U": 1.0,
  "test_suite_version": "pirtm/tests/test_false_xi.py v1.0",
  "test_results": {
    "inv_1_contractive": true,
    "inv_2_prime_dimension": true,
    "inv_3_kk_spectral_gap": true,
    "inv_4_universal_constant_decay_rate": true,
    "inv_5_seed_determinism": true,
    "all_pass": true
  },
  "transparency_clause_accepted": true,
  "clone_check_status": "PASS",
  "clone_check_trace": "Compared with reference implementation; no derivative code detected. Approved by auditor X.",
  "author_name": "Alice Chen",
  "author_email": "alice@exampleorg.io",
  "organization": "Example Research Institute",
  "registration_timestamp": "2026-03-17T10:00:00Z",
  "metadata": {
    "description": "Graph tensor model for melonic scattering amplitudes",
    "use_case": "theoretical_physics",
    "performance_notes": "O(1) per evolution step; suitable for real-time simulation"
  }
}
```

### 7.2 Example 2: Tensor Contraction (p=3)

```json
{
  "tuning_fork_version": "1.0",
  "module_name": "tensor_contraction_core",
  "module_version": "0.5.2",
  "git_remote_origin": "https://github.com/AnotherOrg/tensor-pirtm",
  "git_commit_hash": "f6e5d4c3b2a1f6e5d4c3b2a1f6e5d4c3b2a1f6e",
  "prime_index": 3,
  "prime_index_immutable": true,
  "universal_constant_U": 1.0,
  "test_suite_version": "pirtm/tests/test_false_xi.py v1.0",
  "test_results": {
    "inv_1_contractive": true,
    "inv_2_prime_dimension": true,
    "inv_3_kk_spectral_gap": true,
    "inv_4_universal_constant_decay_rate": true,
    "inv_5_seed_determinism": true,
    "all_pass": true
  },
  "transparency_clause_accepted": true,
  "clone_check_status": "PASS",
  "clone_check_trace": "Semantic analysis: No cloning detected. Standard algorithmic implementation.",
  "author_name": "Bob Martinez",
  "author_email": "bob@anotherorg.eu",
  "organization": null,
  "registration_timestamp": "2026-03-10T15:30:00Z",
  "metadata": {
    "description": "Minimal tensor contraction with Ξ(t) enforcement",
    "use_case": "educational_demo",
    "performance_notes": "Smallest prime; slowest decay. ~0.5 µs per op."
  }
}
```

### 7.3 Example 3: Cryptographic Application (p=7919)

```json
{
  "tuning_fork_version": "1.0",
  "module_name": "crypto_prime_lattice",
  "module_version": "2.1.0",
  "git_remote_origin": "https://github.com/CryptoLab/lattice-pirtm",
  "git_commit_hash": "1a2b3c4d5e6f1a2b3c4d5e6f1a2b3c4d5e6f1a2",
  "prime_index": 7919,
  "prime_index_immutable": true,
  "universal_constant_U": 1.0,
  "test_suite_version": "pirtm/tests/test_false_xi.py v1.0",
  "test_results": {
    "inv_1_contractive": true,
    "inv_2_prime_dimension": true,
    "inv_3_kk_spectral_gap": true,
    "inv_4_universal_constant_decay_rate": true,
    "inv_5_seed_determinism": true,
    "all_pass": true
  },
  "transparency_clause_accepted": true,
  "clone_check_status": "PASS",
  "clone_check_trace": "Full source review: novel algorithmic structure, no derivative markers. Approved.",
  "author_name": "Carol Wu",
  "author_email": "carol@cryptolab.org",
  "organization": "CryptoLab International",
  "registration_timestamp": "2026-03-15T09:45:00Z",
  "signature": {
    "public_key": "-----BEGIN PUBLIC KEY-----\nMFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAL...\n-----END PUBLIC KEY-----",
    "signature_hex": "304402203a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4502203b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3",
    "sign_timestamp": "2026-03-15T09:45:00Z"
  },
  "metadata": {
    "description": "Post-quantum lattice encryption with Ξ(t) decay safeguard",
    "use_case": "cryptography",
    "performance_notes": "Large prime → aggressive decay. ~2 µs per op. Suitable for batch processing."
  }
}
```

---

## 8. Audit Checklist for Reviewers

### 8.1 Pre-Registration Review

When a Tuning Fork is submitted, auditors verify:

- [ ] **JSON schema is valid** (all required fields present, proper types)
- [ ] **Prime index passes Miller-Rabin** (at least 40 rounds)
- [ ] **Git repository is accessible** (can clone from git_remote_origin)
- [ ] **Commit hash exists** (`git verify-commit` succeeds)
- [ ] **Universal constant is 1.0** (exact value, no tolerance)
- [ ] **Test suite version matches official** (`pirtm/tests/test_false_xi.py v1.0`)
- [ ] **All 5 test results reported** (none missing or null)
- [ ] **Clone-check status is PASS** (or REVIEW if deferred)
- [ ] **Transparency clause is accepted** (`true`)
- [ ] **Author information is valid** (email format, organization consistent)

### 8.2 Clone-Check Audit

Auditors also verify the module is not an illegal derivative:

- [ ] **Semantic clone detection** (compare against known PIRTM implementations)
- [ ] **Git history review** (no sudden forking from canonical branch)
- [ ] **Code structure analysis** (novel algorithmic patterns or copied verbatim?)
- [ ] **Watermark/signature verification** (if signature present, validate it)
- [ ] **Manual review** (if automation is inconclusive)

**Possible outcomes:**
- `PASS` — Approved as original
- `REVIEW` — Under investigation (author notified, decision pending)
- `FAIL` — Confirmed clone → rejected, author escalated to governance

### 8.3 Deployment Decision

Final approval requires:

- [ ] All schema checks pass
- [ ] All test results pass
- [ ] Clone-check is PASS
- [ ] Author escalation (if any) resolved
- [ ] Governance sign-off

**Decision:** Approved → badge issued → registry published.

---

## 9. Revocation & Appeal Process

### 9.1 Revocation Triggers

A registered module's status changes to REVOKED if:

1. **Test regression** — Re-run of tests shows failure (INV-1–5)
2. **Clone detection** — New evidence shows unauthorized derivative
3. **Security issue** — Critical vulnerability discovered in module
4. **Author violation** — Breach of Transparency Clause (provenance not preserved, etc.)
5. **Governance decision** — Superseding ADR or policy change

### 9.2 Revocation Procedure

1. **Auditor discovers issue** (via monitoring or manual review)
2. **Governance notified** (escalation ticket created)
3. **Author contacted** (48-hour notice, explanation provided)
4. **Registry updated** (module marked REVOKED, badge grayed-out)
5. **Public announcement** (reason logged, timestamp recorded)

### 9.3 Appeal Process

If author disagrees with revocation:

1. **File appeal** (within 14 days of revocation)
2. **Appeal submitted to** governance + independent auditor
3. **Re-audit** (full clone-check and test re-run)
4. **Decision** (appeal granted → restore, appeal denied → final revocation)
5. **Record appeal outcome** (documented in registry for transparency)

---

## Closing Note

The Tuning Fork Section is where community modules announce themselves to the PIRTM ecosystem. It is the **registry of trust** — if your module's Tuning Fork is approved, you have earned certification.

Abuse the registry (submit a fake module, violate the Transparency Clause, hide a clone) and you risk permanent disqualification.

Use the registry wisely.

---

**Registry Version:** 1.0  
**Locked:** March 17, 2026  
**Next:** [TRANSPARENCY_CLAUSE.md](TRANSPARENCY_CLAUSE.md)
