# Prime-Frequency Transparency Clause — Binding Obligations

**Multiplicity Foundation | Meta-Relativity v1.0**  
**Effective Date:** March 17, 2026  
**Provenance Policy Document**  
**Status:** ACTIVE (locked, no amendments without ADR review)  

---

## PREAMBLE

This document ("Clause") establishes the binding obligations for any organization that:

1. Implements the Ξ(t) prime-contractive operator,
2. Claims "PMD-Certified" status for a computational module,
3. Registers a module in the Tuning Fork Section, or
4. Deploys PIRTM-derived software in production

The Clause is enforceable. Violation leads to audit escalation, badge revocation, and regulatory notification (where applicable).

By accepting this Clause, you affirm that you have read, understood, and agree to comply with all provisions herein.

---

## § 1. CORE OBLIGATIONS

### § 1.1 Provenance Preservation (MUST)

**Obligation:** Any deployment of PIRTM or Ξ(t)-derived code MUST preserve the provenance chain:

```
Provenance: MultiplicityFoundation/Meta-Relativity
Principle: Prime Frequency Principle
Math Stack: [list of applicable concepts]
Registry: https://github.com/MultiplicityFoundation/Meta-Relativity/blob/Multiplicity/pirtm/docs/PRIME_FREQUENCY_INTEGRITY_SUITE.md
```

**Specific Mechanisms:**

1. **Public API:** Every public-facing API (REST, CLI, SDK) must include:
   ```
   {
     "pirtm_provenance": "MultiplicityFoundation/Meta-Relativity",
     "certified_version": "1.0",
     "registry_url": "https://...",
     "module_name": "...",
     "prime_index": ...
   }
   ```

2. **Documentation:** Every user-facing document (README, API docs, legal terms) must reference:
   - The Prime Frequency Principle
   - A link to this Clause
   - A link to the Tuning Fork registry entry

3. **Source Code:** Comments in code must state:
   ```python
   # PIRTM Ξ(t) Implementation
   # Provenance: MultiplicityFoundation/Meta-Relativity
   # Prime Index: [p]
   # Certified: See [Tuning Fork URL]
   ```

4. **No Obfuscation:** Provenance markers CANNOT be:
   - Dynamically generated or hidden
   - Encrypted or obscured
   - Removed or modified at runtime
   - Subject to feature flags or configuration

**Rationale:** Transparency enables downstream users to verify they are using authentic PIRTM, not an illegal clone.

**Violation Impact:** First offense = warning + temporary badge graying. Repeat offense = permanent revocation + audit escalation.

---

### § 1.2 Audit Trail Maintenance (MUST)

**Obligation:** Maintain an immutable audit log of all Ξ(t) operations and verifications.

**What Must Be Logged:**

1. **Transpile-time verification:**
   ```
   [TIMESTAMP]Module: [name]
   [TIMESTAMP] Prime Index: [p]
   [TIMESTAMP] test_false_xi.py execution: INV-1=[pass/fail], INV-2=[pass/fail], ...
   [TIMESTAMP] test_false_xi.py result: [PASS/FAIL]
   [TIMESTAMP] Git commit verified: [hash]
   ```

2. **Link-time verification:**
   ```
   [TIMESTAMP] Linker: Combining modules [M1, M2, ...]
   [TIMESTAMP] Entanglement test: [M1] ↔ [M2]
   [TIMESTAMP] Entanglement result: [PASS/FAIL]
   [TIMESTAMP] Link result: [SUCCESS/FAILURE]
   ```

3. **Runtime deployment (optional but recommended):**
   ```
   [TIMESTAMP] Deployment: [module_name] v[version]
   [TIMESTAMP] Prime index: [p]
   [TIMESTAMP] Badge verification: [VALID/REVOKED]
   [TIMESTAMP] Entanglement check: [primes active: [p1, p2, ...]]
   ```

**Storage Requirements:**
- Logs MUST be stored in a format that prevents tampering (e.g., append-only, signed)
- Logs MUST be retrievable for 1 year minimum (longer for regulated industries)
- Logs MUST be provided to auditors upon request

**Accessibility:**
- Logs MUST NOT be user-facing (keep confidential to comply with security best practices)
- However, a **sanitized summary** must be available:
  ```
  Audit: NOT EMBEDDED — retrieve via pirtm audit <trace.log>
  ```
- This line tells users "detailed audit is available; here's how to get it"

**Violation Impact:** Failure to maintain audit trail = immediate badge revocation and audit escalation.

---

### § 1.3 Clone-Check Certification (MUST)

**Obligation:** Submit to the PMD Clone-Check Protocol before deployment.

**Process:**

1. **Register module in Tuning Fork** with `clone_check_status = PENDING or PASS`
2. **Auditor runs clone-check:**
   - Semantic diff against reference implementation
   - Git history analysis
   - Watermark verification (if applicable)
3. **Result:**
   - `PASS` → Badge eligible
   - `REVIEW` → Further investigation (user notified)
   - `FAIL` → Rejected, audit escalation to governance

**What Counts as a Clone?**

Automatic FAIL outcomes:
- Code that is > 80% identical (line-by-line) to a reference implementation
- Code that replicates algorithmic structure without attributed source
- Code that removes author attribution or provenance markers

Automatic PASS outcomes:
- Code with novel algorithmic structure
- Code that is clearly documented as "based on" or "inspired by" PIRTM
- Code with full transparency about its lineage

Borderline REVIEW outcomes:
- Code with 50–80% similarity to reference (manual review required)
- Code where provenance is unclear or disputed

**Partner Obligations:**
- Do not deploy until clone-check is PASS
- Do not attempt to obscure code history to pass clone-check
- Accept auditor findings in good faith

**Violation Impact:** Deploying code marked REVIEW or FAIL = breach of contract; immediate regulatory notification to governance.

---

### § 1.4 Badge Integrity (MUST)

**Obligation:** Accurately represent certification status via the PMD Badge.

**Badge Requirements:**

1. **Valid Badges (green):**
   ```
   PMD-Certified: Ξ(t)-Core
   Version: 1.0
   Date: 2026-03-17
   Prime Index: [p]
   Tuning Fork: [registry_url]
   ```

2. **Revoked Badges (grayed-out):**
   ```
   PMD-Certified: Ξ(t)-Core [REVOKED]
   Reason: [brief reason]
   Date Revoked: [date]
   Appeal Status: [PENDING / DENIED]
   ```

3. **Placement:**
   - Must appear in public-facing documentation (README, landing page)
   - Must be clickable link to Tuning Fork registry entry
   - Must NOT be hidden or behind paywalls

4. **Accuracy:**
   - Badge status must match registry status in real time
   - Stale badges (not updated within 24 hours of status change) = violation

**Misuse Examples (VIOLATIONS):**

- Displaying a PASS badge for a module marked REVIEW → breach
- Displaying a green badge after revocation without "REVOKED" label → breach
- Hiding a grayed-out badge from users → breach
- Linking badge to wrong registry entry → breach

**Violation Impact:** First offense = public warning in registry. Repeat offense = permanent badge removal + audit escalation.

---

## § 2. LIABILITY & DISCLAIMERS

### § 2.1 No Warranty

The Multiplicity Foundation provides the Prime Frequency Principle, Ξ(t) Technical Note, and certification infrastructure "as-is" without warranty of:

- Correctness of mathematical proofs
- Fitness for any particular purpose
- Non-infringement of third-party rights
- Merchantability
- Performance characteristics

Use at your own risk. Vet all mathematics independently before deployment in critical systems.

### § 2.2 Limitation of Liability

Multiplicity Foundation and its agents are NOT liable for:

- Loss of data, compute time, or revenue
- Failures due to misuse of PIRTM
- Incorrect clones passing audits (due to auditor error)
- False negatives in clone-check (rare but possible)
- Bugs in `test_false_xi.py` (unlikely but possible)

Maximum liability: refund of certification fees (if any).

### § 2.3 Indemnification

By accepting this Clause, you agree to indemnify Multiplicity Foundation against claims arising from:

- Your misuse of PIRTM
- Your violation of obligations in § 1
- Your negligence in deploying PIRTM
- Third-party patents allegedly infringed by your use

---

## § 3. REVOCATION & APPEALS

### § 3.1 Revocation Grounds

Your module's PMD-Certified status is revoked if:

1. **Test failure:** Re-run of `test_false_xi.py` shows any INV fails
2. **Clone evidence:** New evidence emerges that module is an illegal derivative
3. **Provenance breach:** Provenance markers removed or obfuscated
4. **Audit trail loss:** Failure to maintain required logs
5. **Badge violation:** Misuse of badge (false representation of status)
6. **Explicit withdrawal:** You request revocation
7. **Governance decision:** Superseding ADR or policy change renders registration invalid

### § 3.2 Revocation Procedure

1. **Notice:** Governance sends 48-hour notice to registered author with reason
2. **Response window:** You have 48 hours to respond with evidence/counter-argument
3. **Final decision:** Governance makes final decision (appeal available)
4. **Public announcement:** Registry updated, badge grayed-out, reason logged
5. **Communication:** Users of your module are notified

### § 3.3 Appeal Process

If you disagree with revocation:

1. **File appeal** within 14 days of revocation notice
2. **Grounds for appeal:**
   - Factual error in revocation reason
   - Procedural violation in revocation process
   - New evidence exonerating your module
3. **Appeals board:** Independent auditor + Multiplicity governance representative
4. **Re-audit:**
   - Full clone-check re-run
   - `test_false_xi.py` re-execution
   - Provenance review
5. **Decision:** Appeal granted (revocation lifted) or denied (final)
6. **Public record:** Appeal outcome logged in registry

**Appeal fees:** None (at Multiplicity Foundation's expense).

---

## § 4. AMENDMENT PROCEDURE

This Clause can only be amended via:

1. **ADR process:** Proposal submitted to Multiplicity governance
2. **Public comment:** 14-day comment period for community
3. **Governance vote:** Supermajority approval (2/3 of voting members)
4. **Effective date:** Amended clause takes effect 30 days after vote
5. **Retroactivity:** Amendments apply only to new registrations; existing modules may opt-in

**No silent amendments:** Clause modifications trigger email notification to all registered module authors.

---

## § 5. ACCEPTANCE STATEMENT

### § 5.1 Explicit Acceptance Required

To proceed with module registration, you must explicitly accept this Clause by:

**Option A: Digital signature**
```
I, [author_name], digitally sign this acceptance on [date] at [time].
Signature: [digital_signature_hex]
```

**Option B: Checkbox + attestation**
```
☑ I have read the Prime-Frequency Transparency Clause (§ 1–4).
☑ I understand the obligations in § 1 (Provenance, Audit Trail, Clone-Check, Badge Integrity).
☑ I understand the liability limits in § 2.
☑ I accept the revocation procedures in § 3.
☑ I commit to complying with all provisions or face audit escalation.

Attestation: I, [author_name], attest that I have the authority to bind my organization to this Clause.
Date: [date]
```

**Option C: Smart contract**
```solidity
function acceptClause(address author) public {
    require(msg.sender == author);
    clauseAcceptance[author] = block.timestamp;
    emit ClauseAccepted(author, block.timestamp);
}
```

### § 5.2 Revocation of Acceptance

You may revoke your acceptance by:

1. **Filing withdrawal** (email to governance@multiplicity.io)
2. **Immediate effect:** Your module's badge becomes REVOKED
3. **Grace period:** Users have 30 days to migrate
4. **Final status:** Module removed from registry after 90 days

---

## § 6. DISPUTE RESOLUTION

### § 6.1 Jurisdiction

This Clause is governed by the laws and practices of open-source software governance, specifically:

- Multiplicity Foundation bylaws
- OSI (Open Source Initiative) guidelines
- Community best practices

**Venue:** Disputes are resolved by Multiplicity governance, not courts (unless you choose otherwise).

### § 6.2 Escalation Path

1. **Level 1:** Direct discussion with auditor (5 days)
2. **Level 2:** Governance review + independent auditor (10 days)
3. **Level 3:** Appeals board (14 days)
4. **Level 4:** Multiplicity Foundation board (final, 7 days)

**Opt-out:** You may opt out of governance resolution and pursue legal action instead (not recommended; you forfeit community benefits).

---

## § 7. TERM & TERMINATION

### § 7.1 Effective Period

This Clause is effective as long as you:

1. Maintain an active module registration in Tuning Fork
2. Continue operating under PIRTM governance
3. Do not withdraw from the ecosystem

### § 7.2 Termination Scenarios

| Scenario | Termination | Reason |
|----------|------------|--------|
| Module revoked | Immediate | Clause no longer applies; badge gone |
| You withdraw | Immediate | Your choice; 90-day grace period for users |
| Multiplicity Foundation dissolves | Via board vote | Clause transferred to successor org or public domain |
| ADR amends Clause | 30 days notice | You must re-accept or withdraw |

---

## § 8. REFERENCES & SIGNATORIES

### § 8.1 Related Documents

- [Prime Frequency Principle](PRIME_FREQUENCY_PRINCIPLE.md)
- [Ξ(t) Technical Note](XI_OPERATOR_NOTE.md)
- [Tuning Fork Modules Registry](TUNING_FORK_MODULES.md)
- [PRIME_FREQUENCY_INTEGRITY_SUITE.md](PRIME_FREQUENCY_INTEGRITY_SUITE.md)

### § 8.2 Version History

| Version | Date | Changes | Status |
|---------|------|---------|--------|
| 0.1 | Jan 2026 | Draft (internal) | archived |
| 0.5 | Feb 2026 | Three sections → eight sections | archived |
| 1.0 | Mar 2026 | Final; locked for ADR-020 delivery | **ACTIVE** |

### § 8.3 Multiplicity Foundation Signatory

```
Multiplicity Foundation
Board Chair: [name]
Signature: [digital signature]
Date: March 17, 2026
```

---

## SIGNATURE BLOCK (for module authors)

```
────────────────────────────────────────────────────────────────

AUTHOR ACCEPTANCE

I, _________________ (print name), on behalf of _________________ (organization),
hereby accept and agree to comply with the Prime-Frequency Transparency Clause.

I understand:
  ☑ The four core obligations in § 1
  ☑ The liability limits in § 2
  ☑ The revocation procedures in § 3
  ☑ That amendments to this Clause require my opt-in (§ 4)
  ☑ That violation leads to badge revocation and audit escalation

I attest that I have the authority to bind my organization and that I have
reviewed this Clause with legal counsel (recommended but not required).


Author Signature: ___________________________  Date: ___________

First Module Name: ___________________________

Module Prime Index: ___________________________

Git Repository: ___________________________

────────────────────────────────────────────────────────────────
```

---

## CLOSING STATEMENT

This Clause is the foundation of trust in the PIRTM ecosystem. Every certified module represents a commitment to transparency, correctness, and integrity.

By registering your module, you join a community of researchers and engineers building verifiable, trustworthy computational systems.

Welcome. Commit fully.

---

**Clause Status:** LOCKED (frozen as of March 17, 2026)  
**Next Amendment:** Via ADR process (public discussion required)  
**Registry Link:** [PRIME_FREQUENCY_INTEGRITY_SUITE.md](PRIME_FREQUENCY_INTEGRITY_SUITE.md)
