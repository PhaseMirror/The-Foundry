/**
 * Langlands Automorphy Layer
 * ADR-083 (PM-2505): Article I — symmetry and modular coherence
 *
 * Mathematical contracts:
 *   crt_coherence:   ∀i≠j: gcd(p_i, p_j) = 1  (coprime residue classes)
 *   l_function:      opNormT_i * epsilon_i < spectralRadiusMax  (L-value proxy)
 *   symmetry_block:  G[i][i] * epsilon_i < 1  ∧  G[i][j] < √(ε_i * ε_j)
 *
 * These are operational proxies for the Langlands correspondence;
 * see ADR-083 for the full arithmetic expansion roadmap.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ModuleBinding = {
  /** p_i — must be prime */
  primeIndex: number;
  /** ε_i ∈ (0,1) */
  epsilon: number;
  /** ‖T_i‖ */
  opNormT: number;
};

export type LanglandsCheck = {
  name: string;
  passed: boolean;
  detail?: string;
};

export type LanglandsResult = {
  coherent: boolean;
  reason?: string;
  checks: LanglandsCheck[];
};

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function gcd(a: number, b: number): number {
  while (b !== 0) { [a, b] = [b, a % b]; }
  return a;
}

// ---------------------------------------------------------------------------
// checkCRTCoherence
// ---------------------------------------------------------------------------

/**
 * All module pairs must be coprime: gcd(p_i, p_j) = 1 for i ≠ j.
 *
 * This is the CRT (Chinese Remainder Theorem) coherence condition — each
 * module occupies a distinct residue class, enabling unambiguous lifting.
 */
export function checkCRTCoherence(modules: ModuleBinding[]): LanglandsResult {
  const checks: LanglandsCheck[] = [];
  let allPassed = true;

  for (let i = 0; i < modules.length; i++) {
    for (let j = i + 1; j < modules.length; j++) {
      const a = modules[i].primeIndex;
      const b = modules[j].primeIndex;
      const g = gcd(Math.abs(a), Math.abs(b));
      const passed = g === 1;
      if (!passed) allPassed = false;
      checks.push({
        name: `crt-coherence(p${i}=${a}, p${j}=${b})`,
        passed,
        detail: passed
          ? `gcd(${a}, ${b}) = 1 — coprime`
          : `gcd(${a}, ${b}) = ${g} — NOT coprime: LANGLANDS_INCOHERENT`,
      });
    }
  }

  // Degenerate: 0 or 1 modules trivially coherent
  if (checks.length === 0) {
    checks.push({ name: 'crt-coherence', passed: true, detail: 'trivially coherent (< 2 modules)' });
  }

  const failedCheck = checks.find((c) => !c.passed);
  return {
    coherent: allPassed,
    reason: failedCheck?.detail,
    checks,
  };
}

// ---------------------------------------------------------------------------
// checkLFunctionBound
// ---------------------------------------------------------------------------

const DEFAULT_SPECTRAL_RADIUS_MAX = 1.0;

/**
 * Per-module L-function proxy: opNormT_i * epsilon_i < spectralRadiusMax
 *
 * This is a conservative approximation of |L(s, π_i)| at the critical strip.
 * The product opNormT * epsilon must remain strictly below the spectral bound.
 */
export function checkLFunctionBound(
  modules: ModuleBinding[],
  spectralRadiusMax = DEFAULT_SPECTRAL_RADIUS_MAX,
): LanglandsResult {
  const checks: LanglandsCheck[] = [];
  let allPassed = true;

  for (let i = 0; i < modules.length; i++) {
    const proxy = modules[i].opNormT * modules[i].epsilon;
    const passed = proxy < spectralRadiusMax;
    if (!passed) allPassed = false;
    checks.push({
      name: `l-function-bound(p${i}=${modules[i].primeIndex})`,
      passed,
      detail: passed
        ? `‖T‖*ε = ${proxy.toFixed(6)} < ${spectralRadiusMax}`
        : `‖T‖*ε = ${proxy.toFixed(6)} >= ${spectralRadiusMax} — L_FUNCTION_EXCEEDED`,
    });
  }

  if (checks.length === 0) {
    checks.push({ name: 'l-function-bound', passed: true, detail: 'no modules to check' });
  }

  const failedCheck = checks.find((c) => !c.passed);
  return {
    coherent: allPassed,
    reason: failedCheck?.detail,
    checks,
  };
}

// ---------------------------------------------------------------------------
// checkSymmetryBlock
// ---------------------------------------------------------------------------

/**
 * Per-module diagonal contractivity and geometric-mean coupling bound:
 *   G[i][i] * epsilon_i < 1        (diagonal contractivity)
 *   G[i][j] < √(ε_i * ε_j)        (off-diagonal coupling bound)
 *
 * gainMatrix[i][j] is the coupling weight from module i to module j.
 * gainMatrix must be square and match modules.length.
 */
export function checkSymmetryBlock(
  modules: ModuleBinding[],
  gainMatrix: number[][],
): LanglandsResult {
  const checks: LanglandsCheck[] = [];
  const n = modules.length;

  if (gainMatrix.length !== n || gainMatrix.some((row) => row.length !== n)) {
    return {
      coherent: false,
      reason: `gainMatrix dimensions ${gainMatrix.length}x${gainMatrix[0]?.length ?? 0} do not match module count ${n}`,
      checks: [{ name: 'symmetry-block-dimensions', passed: false }],
    };
  }

  let allPassed = true;

  for (let i = 0; i < n; i++) {
    // Diagonal contractivity
    const diag = gainMatrix[i][i] * modules[i].epsilon;
    const diagOk = diag < 1.0;
    if (!diagOk) allPassed = false;
    checks.push({
      name: `diagonal-contractivity(i=${i}, p=${modules[i].primeIndex})`,
      passed: diagOk,
      detail: diagOk
        ? `G[${i}][${i}]*ε = ${diag.toFixed(6)} < 1`
        : `G[${i}][${i}]*ε = ${diag.toFixed(6)} >= 1 — DIAGONAL_NOT_CONTRACTIVE`,
    });

    // Off-diagonal coupling bound
    for (let j = 0; j < n; j++) {
      if (i === j) continue;
      const coupling = Math.abs(gainMatrix[i][j]);
      const geometricBound = Math.sqrt(modules[i].epsilon * modules[j].epsilon);
      const couplingOk = coupling < geometricBound;
      if (!couplingOk) allPassed = false;
      checks.push({
        name: `coupling-bound(i=${i}, j=${j})`,
        passed: couplingOk,
        detail: couplingOk
          ? `|G[${i}][${j}]|=${coupling.toFixed(6)} < √(ε_${i}*ε_${j})=${geometricBound.toFixed(6)}`
          : `|G[${i}][${j}]|=${coupling.toFixed(6)} >= √(ε_${i}*ε_${j})=${geometricBound.toFixed(6)} — COUPLING_EXCEEDED`,
      });
    }
  }

  if (n === 0) {
    checks.push({ name: 'symmetry-block', passed: true, detail: 'trivially satisfied (0 modules)' });
  }

  const failedCheck = checks.find((c) => !c.passed);
  return {
    coherent: allPassed,
    reason: failedCheck?.detail,
    checks,
  };
}

// ---------------------------------------------------------------------------
// checkLanglandsCoherence — composite gate
// ---------------------------------------------------------------------------

/**
 * Composite Langlands coherence check: CRT + L-function + symmetry block.
 *
 * Returns coherent=false on the first failing sub-check; all sub-checks
 * are still run so the caller receives a full diagnostic report.
 */
export function checkLanglandsCoherence(
  modules: ModuleBinding[],
  gainMatrix: number[][],
  spectralRadiusMax = DEFAULT_SPECTRAL_RADIUS_MAX,
): LanglandsResult {
  const allChecks: LanglandsCheck[] = [];

  const crtResult = checkCRTCoherence(modules);
  allChecks.push(...crtResult.checks);

  const lResult = checkLFunctionBound(modules, spectralRadiusMax);
  allChecks.push(...lResult.checks);

  const symResult = checkSymmetryBlock(modules, gainMatrix);
  allChecks.push(...symResult.checks);

  const coherent = crtResult.coherent && lResult.coherent && symResult.coherent;
  const failedCheck = allChecks.find((c) => !c.passed);

  return {
    coherent,
    reason: coherent ? undefined : failedCheck?.detail,
    checks: allChecks,
  };
}
