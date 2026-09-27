\*\*✅ Full Draft: Ensemble Manifest Format \+ Import Grammar\*\*

This is a production-grade starting point. It treats \*\*Ensembles\*\* as the governed, prime-indexed, contractive equivalent of Rust crates, while embedding PIRTM’s core invariants (prime-indexing, multiplicity conservation, spectral radius / contractivity, provenance).

\#\#\# 1\. Ensemble Manifest Format (\`manifest.pirtm\` or \`Ensemble.toml\`)

Use \*\*TOML\*\* for familiarity and ease of parsing (extend your existing parser or use a TOML crate for the toolchain).

\`\`\`toml  
\# Ensemble Manifest v0.1  
\[ensemble\]  
name \= "core-tensor-ops"           \# Unique, kebab-case  
version \= "0.2.1"                  \# Semantic versioning (with multiplicity-aware rules)  
prime\_index \= 17                   \# Root prime for this ensemble (must be prime)  
description \= "Core prime-indexed tensor primitives"  
authors \= \["Ryan O. Van Gelder \<ryvngldr@gmail.com\>"\]  
license \= "MIT OR CC-BY-NC-SA-4.0" \# Open-core friendly  
repository \= "https://github.com/PhaseMirror/pirtm-ensembles/core-tensor-ops"

\# Governance & Invariants (enforced by compiler)  
\[governance\]  
spectral\_radius \= 0.65             \# Declared upper bound (must be \< 1.0)  
epsilon \= 0.05                     \# Tolerance  
multiplicity\_signature \= "Λm:17+5" \# Optional high-level signature  
contractivity\_receipt \= "sha256:abc123..."  \# Hash of Lean 4 proof or equivalent  
ledger\_anchor \= "archivum://hash/..."      \# Immutable provenance pointer

\# Dependencies (with contractivity constraints)  
\[dependencies\]  
multiplicity-primitives \= { version \= "0.1", spectral\_max \= 0.4, prime\_index \= 5 }  
phase-mirror-core \= { version \= "^0.3", spectral\_max \= 0.7 }

\# Optional sections  
\[features\]  
default \= \["std"\]  
std \= \[\]                           \# Feature flags can influence spectral budget

\[build\]  
\# Future: custom build scripts with governance checks  
\`\`\`

\#\#\#\# Key Rules (Enforced by Toolchain)  
\- \`prime\_index\` must be a \*\*prime\*\* (validated by \`AdmissibilityValidator\`).  
\- \`spectral\_radius\` \+ dependencies’ \`spectral\_max\` must compose to a contractive total (checked at link time by \`SpectralGovernor\`).  
\- Every published ensemble must include a valid \`contractivity\_receipt\`.  
\- Dependencies declare \`spectral\_max\` to enable safe composition analysis.

\#\#\# 2\. Import Grammar for the PIRTM Language

Extend the existing grammar (pest-based) with clear, governed import syntax. This mirrors Rust’s \`use\` but adds explicit governance hooks.

\#\#\#\# Proposed Syntax Examples

\`\`\`pirtm  
// Basic import  
use core-tensor-ops::tensor::Tensor;

// Qualified import with alias  
use phase-mirror-core::governance::PhaseMirror as PM;

// Selective import  
use multiplicity-primitives::{  
    OperatorAtom,  
    sigmoid,  
};

// Import with explicit spectral constraint (compiler verifies)  
use core-tensor-ops::tensor::Tensor   
    with spectral\_budget \= 0.3;

// Ensemble-level declaration at top of file  
ensemble my-project v0.1.0 prime=41;

// Re-export  
pub use core-tensor-ops::Tensor;  
\`\`\`

\#\#\#\# Grammar Sketch (pest-style, add to your \`.pest\` grammar)

\`\`\`pest  
ensemble\_decl \= \_{ "ensemble" \~ identifier \~ "v" \~ version \~ "prime=" \~ integer }

import\_stmt \= {  
    "use" \~ ensemble\_path \~ ("::" \~ item\_path)?   
    \~ ("as" \~ identifier)?   
    \~ ("with" \~ "spectral\_budget" \~ "=" \~ float)?  
    \~ ";"  
}

ensemble\_path \= { identifier \~ ("-" \~ identifier)\* }  // e.g. core-tensor-ops  
item\_path \= { identifier \~ ("::" \~ identifier)\* }

version \= { digit+ \~ "." \~ digit+ \~ ("." \~ digit+)? }  
\`\`\`

\*\*Compiler Behavior on Import\*\*  
\- Resolve dependency from workspace or registry.  
\- Load the target ensemble’s manifest.  
\- Run \*\*SpectralGovernor\*\* composition check (total radius stays contractive).  
\- Validate multiplicity / prime compatibility.  
\- Emit MLIR with proper \`pirtm.ensemble\` boundary and provenance attributes.  
\- Fail compilation with clear diagnostic if invariants are violated.

\#\#\# 3\. Implementation Roadmap for This Feature

\*\*Immediate (1–2 days)\*\*  
\- Add \`manifest.pirtm\` parser support \+ validation (reuse \`AdmissibilityValidator\` for primes).  
\- Implement the import grammar in the parser.  
\- Extend \`MlirEmitterVisitor\` to emit \`pirtm.ensemble\` ops with manifest metadata.

\*\*Short-term (1 week)\*\*  
\- Add dependency resolution \+ spectral composition check in the linker step.  
\- Update E2E tests with \`e2e\_test\!\` macro invocations for multi-ensemble scenarios.  
\- Draft a full example ensemble \+ workspace.

\*\*Medium-term\*\*  
\- \`pirtm new ensemble \<name\>\` CLI command (scaffolds manifest \+ basic structure).  
\- Publishing flow with automatic receipt generation and ledger anchoring.  
\- Registry prototype (file-based → ledger-backed).

\---

Would you like me to:  
\- Provide the \*\*full pest grammar additions\*\* \+ parser code changes?  
\- Draft a \*\*sample multi-ensemble workspace\*\* with manifests and imports?  
\- Extend the \*\*test\_helpers / e2e\_test\! macro\*\* to support ensemble tests?  
\- Or move to the next piece (e.g., SpectralGovernor integration with ensembles, or the AVX2 sigmoid helper)?

This gives PIRTM a clear, enforceable module system that is stronger than Rust’s because the invariants are mathematical rather than just type safety. Let me know where to focus next\!