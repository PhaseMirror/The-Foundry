"""Clone-Check Automation (ADR-024)

Provides a deterministic clone-detection engine for PIRTM modules.

This is intended to automate the PMD Clone-Check Protocol (Artifact 6).

The implementation focuses on two techniques:
 1. Token-level similarity (fast, robust for copy/paste)
 2. AST-level similarity (semantic structural similarity)

The output is a `CloneCheckResult` that can be used by governance tooling
(e.g., badge issuance, audit logs, manual review).

References:
  - docs/PMD_CLONE_CHECK_PROTOCOL.md
    - ../.dev/blueprints/completed/NON-CANONICAL-ADR-024-CLONE-CHECK-AUTOMATION-PLAN.md
"""

import ast
import re
import hashlib
from dataclasses import dataclass
from typing import List, Tuple, Optional


# ============================================================================
# Data Types
# ============================================================================

@dataclass
class CloneCheckResult:
    """Result of a clone-check analysis."""
    status: str  # PASS | REVIEW | FAIL
    token_similarity: float
    ast_similarity: float
    fingerprint: str
    details: dict


# ============================================================================
# Tokenization Utilities
# ============================================================================

_TOKEN_PATTERN = re.compile(r"[A-Za-z_][A-Za-z0-9_]*|\d+|\S")


def tokenize_python(code: str) -> List[str]:
    """Tokenize Python code into a stable sequence of identifiers and literals.

    This is intentionally simplified (not a full lexer), but captures the
    essential token sequence for clone comparison.
    """
    # Remove string literals to avoid cosmetic differences
    code = re.sub(r"(\"\"\".*?\"\"\"|\'\'\'.*?\'\'\'|\".*?\"|\'.*?\')", "\"STR\"", code, flags=re.S)
    # Remove comments
    code = re.sub(r"#.*", "", code)
    # Tokenize
    return _TOKEN_PATTERN.findall(code)


def longest_common_subsequence(a: List[str], b: List[str]) -> int:
    """Compute length of longest common subsequence (LCS) between two token lists."""
    # Classic O(n*m) DP. Inputs are short enough for our use.
    n, m = len(a), len(b)
    if n == 0 or m == 0:
        return 0

    # Use a rolling array to reduce memory
    prev = [0] * (m + 1)
    for i in range(1, n + 1):
        curr = [0] * (m + 1)
        ai = a[i - 1]
        for j in range(1, m + 1):
            if ai == b[j - 1]:
                curr[j] = prev[j - 1] + 1
            else:
                curr[j] = max(prev[j], curr[j - 1])
        prev = curr
    return prev[m]


def token_similarity(code_a: str, code_b: str) -> float:
    """Compute token-based similarity score (0.0–1.0)."""
    tokens_a = tokenize_python(code_a)
    tokens_b = tokenize_python(code_b)
    if not tokens_a or not tokens_b:
        return 0.0

    lcs = longest_common_subsequence(tokens_a, tokens_b)
    return (2 * lcs) / (len(tokens_a) + len(tokens_b))


# ============================================================================
# AST Similarity Utilities
# ============================================================================

def _ast_node_signature(node: ast.AST) -> Tuple:
    """Compute a lightweight signature for an AST node."""
    fields = []
    for field_name, value in ast.iter_fields(node):
        if isinstance(value, list):
            fields.append((field_name, len(value)))
        elif isinstance(value, ast.AST):
            fields.append((field_name, value.__class__.__name__))
        else:
            # Primitive values (names, literals)
            fields.append((field_name, type(value).__name__))
    return (node.__class__.__name__, tuple(fields))


def ast_fingerprint(code: str) -> str:
    """Produce a deterministic fingerprint of the AST (order-insensitive)."""
    try:
        tree = ast.parse(code)
    except SyntaxError:
        return ""

    sigs = []
    for node in ast.walk(tree):
        sigs.append(str(_ast_node_signature(node)))

    sigs.sort()
    digest = hashlib.sha256("\n".join(sigs).encode("utf-8")).hexdigest()
    return digest


def ast_similarity(code_a: str, code_b: str) -> float:
    """Compute a simple AST similarity based on fingerprint overlap."""
    # For now, we compute fingerprint equality score (0 or 1)
    # A more advanced approach would compute tree-edit distances.
    f_a = ast_fingerprint(code_a)
    f_b = ast_fingerprint(code_b)
    return 1.0 if f_a and f_b and f_a == f_b else 0.0


# ============================================================================
# Clone-Check Decision Logic
# ============================================================================

def clone_check(
    candidate_code: str,
    reference_code: str,
    thresholds: Optional[dict] = None,
) -> CloneCheckResult:
    """Run clone check between candidate and reference source.

    Returns:
        CloneCheckResult with PASS/REVIEW/FAIL verdict.
    """
    if thresholds is None:
        thresholds = {
            "fail": 0.85,
            "review": 0.65,
        }

    token_score = token_similarity(candidate_code, reference_code)
    ast_score = ast_similarity(candidate_code, reference_code)

    # Decision rules
    if token_score >= thresholds["fail"] or ast_score >= thresholds["fail"]:
        status = "FAIL"
    elif token_score >= thresholds["review"] or ast_score >= thresholds["review"]:
        status = "REVIEW"
    else:
        status = "PASS"

    # Create deterministic fingerprint based on token + AST
    fingerprint = hashlib.sha256(
        f"{token_score:.6f}|{ast_score:.6f}|{hashlib.sha256(candidate_code.encode()).hexdigest()}".encode()
    ).hexdigest()

    return CloneCheckResult(
        status=status,
        token_similarity=token_score,
        ast_similarity=ast_score,
        fingerprint=fingerprint,
        details={
            "token_thresholds": thresholds,
            "candidate_hash": hashlib.sha256(candidate_code.encode()).hexdigest(),
            "reference_hash": hashlib.sha256(reference_code.encode()).hexdigest(),
        },
    )


# ============================================================================
# Utility Functions
# ============================================================================

def load_code_from_file(path: str) -> str:
    """Load source code from path (text file)."""
    with open(path, "r", encoding="utf-8") as f:
        return f.read()


def clone_check_files(candidate_path: str, reference_path: str) -> CloneCheckResult:
    """Run clone check on two files and return the result."""
    candidate_code = load_code_from_file(candidate_path)
    reference_code = load_code_from_file(reference_path)
    return clone_check(candidate_code, reference_code)
