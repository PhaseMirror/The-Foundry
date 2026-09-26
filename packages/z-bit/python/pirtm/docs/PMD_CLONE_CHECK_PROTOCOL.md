# PMD Clone-Check Protocol: Verification of Authentic PIRTM Modules

**Multiplicity Foundation | Meta-Relativity v1.0**  
**Provenance:** MultiplicityFoundation/Meta-Relativity  
**Security Protocol:** Anti-cloning verification  
**Version:** 1.0  
**Date:** March 2026  
**Related:** [TRANSPARENCY_CLAUSE.md](TRANSPARENCY_CLAUSE.md), [TUNING_FORK_MODULES.md](TUNING_FORK_MODULES.md)

---

## Table of Contents

1. Definition: What Is a Clone?
2. Clone Detection Techniques
3. Provenance Chain Validation
4. Attack Scenarios & Defenses
5. Decision Tree Algorithm
6. Clone-Check Results & Escalation
7. Test Cases & Examples
8. Implementation Requirements

---

## 1. Definition: What Is a Clone?

### 1.1 Clone Spectrum

A module is considered a **clone** if it is:

1. **Syntactic clone** — Line-by-line copy or trivial renaming
2. **Semantic clone** — Same algorithmic logic, different syntax
3. **Hybrid clone** — Mix of copied and modified code

A module is **NOT** a clone if it is:

- Independent implementation (novel code structure)
- Properly attributed derivative (cites source, preserves provenance)
- Reimplementation with novel optimization (clearly documented)

### 1.2 Cloning Attack Vectors

**Vector 1: Silent copy**
- Attacker copies PIRTM reference code into private repository
- Removes provenance markers
- Submits as own work → **trivial clone**

**Vector 2: Obfuscation**
- Attacker renames variables, refactors syntax
- Preserves algorithmic structure → **semantic clone**
- Detectable via AST comparison

**Vector 3: Hybrid forgery**
- Attacker mixes: 70% copied code + 30% novel code
- Claims "inspired by" but doesn't link original → **gray area**
- Requires manual auditor review

**Vector 4: Watermark stripping**
- Attacker removes all comments and authorship markers
- Tries to erase provenance trail → **detected by git history analysis**

---

## 2. Clone Detection Techniques

### 2.1 Technique 1: Token-Based Diff

**Algorithm:** Compare sequences of syntax tokens.

```python
def token_diff_similarity(code_a, code_b):
    """Compute similarity as token-level longest common subsequence."""
    tokens_a = tokenize(code_a)  # [ID, LPAREN, ID, RPAREN, ...]
    tokens_b = tokenize(code_b)
    lcs_length = longest_common_subsequence(tokens_a, tokens_b)
    similarity = 2 * lcs_length / (len(tokens_a) + len(tokens_b))
    return similarity  # 0.0–1.0
```

**Decision:**
- similarity ≥ 0.80 → **FAIL** (likely direct copy)
- similarity 0.50–0.80 → **REVIEW** (needs manual audit)
- similarity < 0.50 → **PASS** (likely novel)

**Why this works:** Trivial copy-paste produces token sequences that match ~90%. Refactored code drops similarity to 50–70%. Novel code < 40%.

### 2.2 Technique 2: AST (Abstract Syntax Tree) Comparison

**Algorithm:** Compare semantic structure (not surface syntax).

```python
def ast_semantic_similarity(code_a, code_b):
    """Compute similarity as normalized tree-edit distance."""
    ast_a = parse_to_ast(code_a)
    ast_b = parse_to_ast(code_b)
    base_cost = tree_edit_distance(ast_a, ast_b)
    normalized_cost = base_cost / max(tree_size(ast_a), tree_size(ast_b))
    similarity = 1.0 - normalized_cost  # 0.0–1.0
    return similarity
```

**Decision:**
- similarity ≥ 0.75 → **FAIL** (semantic structure too similar)
- similarity 0.45–0.75 → **REVIEW** (manual audit required)
- similarity < 0.45 → **PASS** (different algorithms)

**Why this works:** Variable renaming doesn't change AST structure. Semantic clones still have 70%+ AST similarity.

### 2.3 Technique 3: Git History Analysis

**Algorithm:** Verify commit provenance and authorship.

```bash
# Extract commit history for code file
$ git log --format="%H|%an|%ae|%s|%b" -- pirtm/bindings/xi_operator.py | head -20

# Check for:
# - Suspicious commit messages ("Copy from ...", "Imported from ...", etc.)
# - Commits with > 50% file change (sudden major rewrite?)
# - Commits that remove provenance markers
# - Author changes within the same file (ownership transfer?)
```

**Decision rules:**
- Commit message references PIRTM repo → Likely a derivative (check if properly attributed)
- Sudden 50%+ rewrite after import → Suspicious
- Provenance markers removed in a commit → Red flag, **REVIEW**
- Clean history (gradual changes, consistent author) → Less suspicious

### 2.4 Technique 4: Watermark Extraction (if applicable)

**Algorithm:** Look for embedded signatures in code.

```python
# Example watermark (optional, not required)
# In Ξ(t) operators, the decay constant can embed metadata

def xi_operator_with_watermark(psi, t, prime_index):
    # Standard part: e^{-U * log(p) * t}
    U = 1.0  # Canonical value
    decay = math.exp(-U * math.log(prime_index) * t)
    
    # Optional watermark: embed source repo in precision
    # (undetectable at runtime, but forensic analysis can extract)
    watermark_nonce = 0x4d52_0001  # "MR" = Meta-Relativity, version 1
    # ...recovery logic...
    
    return decay * psi
```

**Detection:** If watermark matches known PIRTM markers, **FAIL** (direct copy).

**Note:** Watermarking is optional. Most code won't have it.

---

## 3. Provenance Chain Validation

### 3.1 Expected Chain

A legitimate PIRTM module should have a traceable chain:

```
Original: MultiplicityFoundation/Meta-Relativity/pirtm/bindings/xi_operator.py
    ↓ (author implements derivative)
Derivative: GitHub/OtherOrg/tensor-pirtm
    ↓ (author registers in Tuning Fork)
Tuning Fork Entry: [git_remote_origin, git_commit_hash, clone_check_status]
```

**Verification:** Check that each link is documented and attributed.

### 3.2 Broken Chain Red Flags

| Problem | Severity | Action |
|---------|----------|--------|
| No link to original in comments | Low | Warning |
| Commit message says "imported" but no source cited | Medium | REVIEW |
| Provenance markers removed in recent commits | High | REVIEW → auditor escalation |
| Git history starts fresh (no ancestor commits from known source) | High | REVIEW |
| Author attribution missing | Critical | FAIL |

---

## 4. Attack Scenarios & Defenses

### 4.1 Scenario: Silent Copy Attack

**Attacker's action:**
```bash
git clone https://github.com/MultiplicityFoundation/Meta-Relativity.git
cp pirtm/bindings/xi_operator.py ~/my_project/xi_operator_patched.py
# Remove comments, rename variables
# Register in Tuning Fork as "xi_operator_v2"
```

**Detection:**
- Token similarity: 85% (> 80% threshold) → **FAIL**
- AST similarity: 78% (> 75% threshold) → **FAIL**
- Verdict: **Syntactic clone, FAIL immediately**

---

### 4.2 Scenario: Obfuscation Attack

**Attacker's action:**
```python
# Original:
decay = math.exp(-U * math.log(p) * t)

# Obfuscated:
import math
U = float(1)
p_val = p
t_val = t
log_p = math.log(p_val)
product = U * log_p
neg_product = -product * t_val
result = math.exp(neg_product)
decay = result
```

**Detection:**
- Token similarity: 60% (50–80%, borderline) → **REVIEW**
- AST similarity: 72% (45–75%, borderline) → **REVIEW**
- Git history: Clean, no suspicious commits → No red flags
- Auditor manual check: Different variable names, but same logic
- Verdict: **Semantic clone, REVIEW → escalate for manual audit**

---

### 4.3 Scenario: Hybrid Forgery

**Attacker's action:**
```python
# 70% copied from PIRTM
decay = math.exp(-U * math.log(p) * t)  # Direct copy
norm_result = decay * norm_input

# 30% novel (ad-hoc optimization)
if p > 1000:
    decay *= 1.001  # Custom scaling for large primes
```

**Detection:**
- Token similarity: 71% (50–80%) → **REVIEW**
- AST similarity: 68% (45–75%) → **REVIEW**
- Comments: Some reference PIRTM, some don't
- Git history: Mix of copied commits + novel commits
- Auditors review: "Mostly copied, with small novel parts"
- Verdict: **Hybrid clone. Reject unless attribution is explicit and novel parts > 50%**

---

### 4.4 Scenario: Proper Attribution (NOT a Clone)

**Author's action:**
```python
"""
Ξ(t) Operator Implementation
Based on: MultiplicityFoundation/Meta-Relativity
Reference: https://github.com/MultiplicityFoundation/Meta-Relativity/blob/main/pirtm/bindings/xi_operator.py
Licensed: [same license as original]
Modifications: [list of algorithmic improvements]

Original implementation by Multiplicity Foundation.
This version: [name], [date]
"""

# Core Ξ(t) from reference (preserved exactly)
decay = math.exp(-U * math.log(p) * t)

# Novel optimization: parallel vectorization for batch ops
if isinstance(psi, np.ndarray) and psi.ndim > 1:
    # Batch implementation using numpy broadcasting
    ...
```

**Detection:**
- Token similarity: 55% (< 80%, acceptable)
- AST similarity: 50% (< 75%, acceptable)
- Comments: Clear attribution to original
- Git history: Trace back to fork point, prior art documented
- Auditor review: "Legitimate derivative, clear attribution"
- Verdict: **PASS - Properly attributed, novel components evident**

---

## 5. Decision Tree Algorithm

### 5.1 Flowchart

```
START: Module submitted for clone-check

┌─────────────────────────────────────────┐
│ STEP 1: Token-Based Diff                │
│ Compute: token_similarity = ?           │
└────────┬────────────────────────────────┘
         │
         ├─ sim ≥ 0.80 ──→ BRANCH A: FAIL (syntactic clone)
         │
         ├─ 0.50 ≤ sim < 0.80 ──→ BRANCH B: REVIEW (borderline)
         │
         └─ sim < 0.50 ──→ BRANCH C: preliminary PASS

┌──────────────── BRANCH A ─────────────────┐
│ Token similarity ≥ 80%                   │
│ → Likely direct copy                     │
│ DECISION: FAIL (clone detected)          │
│ Escalation: Notify author, log alert     │
└──────────────────────────────────────────┘

┌──────────────── BRANCH B ─────────────────┐
│ Token similarity in [50%, 80%)           │
│ STEP 2: AST Semantic Analysis            │
│ Compute: ast_similarity = ?              │
│                                          │
│ ├─ ast_sim ≥ 0.75 → FAIL (semantic)    │
│ ├─ ast_sim < 0.45 → proceed to BRANCH C │
│ └─ else → STEP 3: Git history analysis  │
│                                          │
│ STEP 3: Git History                      │
│ ├─ Provenance clear → STEP 4: Manual    │
│ └─ Provenance missing → FAIL (clone)    │
│                                          │
│ STEP 4: Manual auditor review            │
│ ├─ Attribution sufficient → PASS         │
│ └─ Attribution insufficient → FAIL       │
└──────────────────────────────────────────┘

┌──────────────── BRANCH C ─────────────────┐
│ Token similarity < 50%                   │
│ STEP 5: Watermark check (if applicable)  │
│ ├─ Watermark ≠ known sources → PASS      │
│ └─ Watermark = PIRTM marker → FAIL       │
│                                          │
│ DECISION: PASS (likely novel)            │
│ Confidence: HIGH                         │
└──────────────────────────────────────────┘

END: Decision (PASS/FAIL/REVIEW) recorded in Tuning Fork
```

### 5.2 Decision Thresholds (Summary)

| Similarity | Status | Action |
|-----------|--------|--------|
| Token ≥ 80% OR AST ≥ 75% | FAIL | Reject immediately |
| Token 50–80% AND AST < 75% | REVIEW | Manual auditor required |
| Token < 50% AND AST < 45% | PASS | Approve (high confidence) |
| Any watermark = PIRTM | FAIL | Reject immediately |

---

## 6. Clone-Check Results & Escalation

### 6.1 Result Codes

```json
{
  "clone_check_id": "CC20260317_001",
  "module_name": "gft_melonic",
  "timestamp": "2026-03-17T14:00:00Z",
  "status": "PASS|FAIL|REVIEW",
  "confidence": 0.95,  // 0.0–1.0
  "techniques_applied": ["token_diff", "ast_comparison", "git_history"],
  "scores": {
    "token_similarity": 0.42,
    "ast_similarity": 0.38,
    "git_provenance_score": 0.90
  },
  "reasoning": "Token and AST similarities both < threshold. Git history clean. Likely novel implementation.",
  "recommendation": "APPROVED"
}
```

### 6.2 Escalation Paths

**PASS (Automatic):**
- Entry is updated in Tuning Fork: `clone_check_status = "PASS"`
- Badge becomes eligible for issuance
- Module may be deployed.

**FAIL (Automatic):**
- Entry updated: `clone_check_status = "FAIL"`
- Author notified via email
- Recommendation: Rewrite code from scratch or properly attribute
- No appeal possible (automated decision, high confidence)

**REVIEW (Manual escalation):**
- Entry updated: `clone_check_status = "REVIEW"`
- Auditor assigned (SLA: 3 business days)
- Author can provide context/explanation
- Auditor decision (final) → PASS or FAIL
- Appeal available if author disagrees

---

## 7. Test Cases & Examples

### 7.1 Test Case 1: Exact Copy (FAIL)

**Input:** Module code is line-for-line copy of reference implementation (changed variable names only).

**Expected:**
- Token similarity: 88%
- AST similarity: 82%
- Decision: **FAIL**

**Actual:**
```
Token similarity: 0.88 (≥ 0.80) → FAIL
Decision: FAIL ✓
```

---

### 7.2 Test Case 2: Minimal Refactor (REVIEW)

**Input:** ~60% of code copied (preserved algorithmic structure), ~40% refactored (added comments, new helper functions).

**Expected:**
- Token similarity: 62%
- AST similarity: 68%
- Git history: Suggests hybrid code
- Decision: **REVIEW → auditor decides**

**Actual:**
```
Token similarity: 0.62 (in [0.5, 0.8]) → proceed
AST similarity: 0.68 (in [0.45, 0.75]) → proceed
Git history: Mix of copied + novel commits → REVIEW scenario
Decision: REVIEW ✓ (auditor needed)
```

---

### 7.3 Test Case 3: Novel Implementation (PASS)

**Input:** Independent Ξ(t) operator implementation. Different code structure, novel optimizations.

**Expected:**
- Token similarity: 35%
- AST similarity: 32%
- Git history: Original author, no cloned commits
- Decision: **PASS**

**Actual:**
```
Token similarity: 0.35 (< 0.50) → BRANCH C
AST similarity: 0.32 (< 0.45) → BRANCH C
Watermark check: None detected → proceed
Decision: PASS ✓
```

---

### 7.4 Test Case 4: Proper Attribution (PASS)

**Input:** Code that reuses 50% of reference (preserved exactly), but clearly documented with link to original.

**Expected:**
- Token similarity: 56%
- AST similarity: 52%
- Comments: Clear attribution
- Git history: Fork documented
- Decision: **PASS** (legitimate derivative)

**Actual:**
```
Token similarity: 0.56 (in [0.5, 0.8]) → proceed
AST similarity: 0.52 (in [0.45, 0.75]) → proceed
Git history: Links to original repository ✓
Comments: Attribution present ✓
Manual auditor review: "Legitimate derivative"
Decision: PASS ✓
```

---

## 8. Implementation Requirements

### 8.1 Tooling

Implementations must provide:

1. **Tokenizer** — Language-agnostic token stream extraction
2. **AST Parser** — Semantic tree construction (Python/C/etc.)
3. **Tree-Edit Distance** — Graph algorithm for AST comparison
4. **Git Analyzer** — Commit history extraction and analysis
5. **Decision Engine** — Threshold-based classifier

### 8.2 Computational Constraints

- **Per-module time:** < 5 seconds for code < 10K lines
- **AST memory:** < 100 MB for typical module
- **Accuracy target:** > 95% true positive rate (catch clones)

### 8.3 Audit Trail Logging

Every clone-check must produce an immutable log:

```json
{
  "audit_log": [
    {"step": "tokenize", "time_ms": 120},
    {"step": "compute_token_similarity", "result": 0.42, "time_ms": 85},
    {"step": "parse_ast", "time_ms": 200},
    {"step": "ast_similarity", "result": 0.38, "time_ms": 150},
    {"step": "git_history_analysis", "result": "clean", "time_ms": 90},
    {"step": "decision", "result": "PASS", "confidence": 0.96, "time_ms": 10}
  ],
  "total_time_ms": 655
}
```

---

## Closing Note

The PMD Clone-Check Protocol is your shield against silent cloning. By verifying provenance and authorship, we ensure that PIRTM modules are authentic and properly attributed.

If your code is novel, clone-check is trivial.  
If your code is derived, you have nothing to hide — cite your source.  
If your code is cloned, you will be caught.

---

**Protocol Locked:** March 17, 2026  
**Next:** [PMD_BADGE_SPEC.md](PMD_BADGE_SPEC.md)
