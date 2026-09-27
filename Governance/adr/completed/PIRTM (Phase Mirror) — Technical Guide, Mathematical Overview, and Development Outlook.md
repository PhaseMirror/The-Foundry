PIRTM (Phase Mirror) —
Technical Guide, Mathematical
Overview, and Development
Outlook
Overview
PIRTM (as described in the current Phase Mirror development
artifacts) is a compiler-and-runtime oriented effort to represent and
execute prime-indexed, recursively structured tensor computations
under explicit, machine-checkable stability constraints at two
different phases: (1) per-module transpile-time checks and (2)
network-wide link-time checks.[1]
In this architecture, the PIRTM MLIR dialect is used as the canonical
intermediate representation (IR) surface for carrying the type-level
invariants and for attaching verification logic (via generated and
custom verifiers) so that invalid “multiplicity signatures” fail early
with precise diagnostics.[2][1]
A practical motivation for an MLIR dialect-based approach is that
MLIR is explicitly designed to support multiple, coexisting dialects and
pass pipelines that can progressively lower high-level domain
semantics to low-level codegen while retaining verification structure
and custom assembly formats.[2]

What PIRTM does (operationally)
Compile-time structure
PIRTM uses MLIR as the formal representation layer: programs are
represented as modules containing operations and values in SSA
form, with dialect-specific types and attributes providing structured,
verifiable metadata.[2]
Within MLIR, dialects are namespaces that define custom operations,
attributes, and types; this is the mechanism PIRTM uses to introduce
prime/mod-indexed types and a session-graph operation stub that
can later be lowered or linked.[2]

Verification-driven compilation
The current Day-0 artifacts define a type layer in TableGen with
genVerifyDecl = 1, meaning MLIR’s TableGen generator will emit
verifier method declarations that must be implemented in C++ and
will be run during construction/parsing of the types.[3]
This is aligned with MLIR’s standard practice: TableGen definitions
can generate builders, parsers/printers (via assemblyFormat), and
verifiers, reducing boilerplate while making the .td file the single
“record of truth” about what the op/type is supposed to look like.[4]
[3]

Two-phase (transpile vs link)
The PIRTM plan uses a deliberate split:
     Transpile time: the dialect must accept unresolved coupling
     information so compilation can proceed while references are
     still symbolic.
     Link time: coupling is resolved and a spectral/small-gain style
     check is performed over the assembled session graph.
This split is implemented (in the Day-0 dialect stub plan) by typing
gain_matrix as an optional dense-array attribute so that a sentinel
“unresolved” coupling marker can be carried without failing the
verifier, and a later resolved path can run a numerical routine (power
iteration) when a concrete matrix is present.[4]

Development status: the Day-0 artifacts
1) pirtm.td (dialect stub)
The current Day-0 TableGen stub establishes four type definitions and
a SessionGraphOp stub, but intentionally contains no passes, no
lowering, and no operational semantics beyond the verifier entry
points and assembly formats. This matches MLIR best practice: use
TableGen/ODS to define the syntactic and structural layer first, then
add lowering passes and transformations later.[5][4]
Because genVerifyDecl = 1 is set on the types, the next compilation
step requires providing the C++ verifier implementations that
TableGen declares. MLIR’s attribute/type definition documentation
describes this exact mechanism: enabling genVerifyDecl generates
verification hooks that are invoked from generated builders and
checked constructors.[3]

2) prime-to-mod-rename.md (migration + audit)
The migration guide is designed to be both a change plan and an
enforcement instrument: it enumerates rename sites (IR string
literals and field names) and explicit non-rename sites (e.g.,
prime_index, _is_prime()), and defines an explicit shim removal
protocol with a Day-14 hard delete. This form of “migration doc as
audit checklist” is a standard governance pattern when compiler IR
strings and APIs must remain stable across a transition window.[1]

3) pirtm-types-basic.mlir (Day 0–3 gate test)
The Day 0–3 test is a verifier-driven conformance test that requires
exact diagnostic strings for two invalid cases: one composite that is
not prime and one composite that is not squarefree.
This approach is consistent with MLIR’s --verify-diagnostics workflow,
where tests can assert exact expected diagnostics and therefore force
verifiers to provide high-quality error messages rather than silent
failures.[2]

The only remaining Day-0 decision: type
verifier implementation
The .td plan requires a concrete implementation file (e.g.,
pirtm_types.cpp) to supply arithmetic predicates used by type
verifiers:
     isPrime(int64_t) (Miller–Rabin)
     isSquarefree(int64_t) (trial division up to √n)
This follows directly from the MLIR TableGen contract for
genVerifyDecl: the dialect author must implement the generated
verify(...) hooks (or construction invariant verifiers) in C++ when
declarative constraints aren’t sufficient.[3]

Mathematical overview (what the
invariants are trying to enforce)
Prime-indexing as a decomposition discipline
PIRTM’s “prime/mod” vocabulary fits a wider mathematical pattern:
primes provide a canonical factorization basis, so constraining
parameters to primes or squarefree integers forces a kind of “non-
redundant” decomposition discipline on the system’s indexing
scheme.
The Day-0 tests explicitly require diagnosing when a mod= is not
prime and when it is not squarefree, with an explanation that
includes factorization and a Möbius function note (μ(n) = 0 iff n has a
squared prime factor). This enforces that composite indices used for
composition do not carry repeated prime power multiplicity at the
type level.

Why squarefree constraints matter
Squarefree constraints often matter when you want composition to
behave like “set union over primes” rather than “multiset with
repeated prime powers.” From a systems perspective, this can be
used to prevent degenerate identifications where the same prime
channel is duplicated, which could obscure provenance and
complicate later linking or auditing.

Session-graph spectral checks (power iteration)
At link time, the session graph introduces an explicit “gain matrix”
concept and uses a numerical procedure (power iteration) as a
mechanism to estimate a dominant eigenvalue or spectral radius-like
quantity in order to gate stability.
Power iteration is commonly used to estimate the largest eigenvalue
magnitude of a matrix when you can cheaply apply the matrix-vector
product repeatedly, which makes it a plausible choice for a link-time
check that must run over a resolved coupling graph.

Architecture guide (how it fits together)
Why MLIR is the right substrate
MLIR’s dialect mechanism exists specifically to let a project define
domain-specific operations/types/attributes and then define pass
pipelines to transform and lower those operations. MLIR also
supports multiple forms (textual, in-memory, bytecode) representing
the same semantics, which is important for “auditable IR” goals.[2]
A PIRTM dialect implemented via TableGen can use:
     assemblyFormat to enforce a stable text syntax (e.g., mod=
     everywhere),
     verifier hooks to enforce arithmetic invariants at parse/build
     time,
     optional attributes (OptionalAttr<...>) to represent staging states
     (unresolved → resolved) without breaking well-formedness.
These are all standard features documented by MLIR’s ODS and
Attr/Type definition manuals.[4][3]

Dialect definition and verification mechanics
MLIR’s Attribute/Type ODS makes genVerifyDecl a first-class
mechanism: it generates verify(...) methods and failable
getChecked(...) builders so invalid parameters can be rejected with a
diagnostic at construction time.[3]
MLIR’s operation definition system similarly supports optional
attributes (OptionalAttr<...>) and custom verifiers (hasVerifier=1) so
that PIRTM’s SessionGraphOp can accept a sentinel unresolved state
during early compilation and then switch to strict verification once a
concrete matrix is attached.[4]
Future outlook (realistic implications)
Near-term (Day 0–16)
If the Day 0–3 gate passes, PIRTM will have a “structurally sound”
type layer: i.e., MLIR parsing/printing is stable, and the type
invariants are enforced with test-backed diagnostics.
The next realistic capability after the type layer is stable is link-time
coupling resolution and spectral gating, because the SessionGraphOp
stub already anticipates an unresolved-to-resolved transition and a
numerical stability check.

Medium-term (Day 30–90)
A credible medium-term milestone is an end-to-end pipeline:
  1. Transpile a set of modules with local invariants.
  2. Link them into a session graph with resolved couplings.
  3. Run spectral small-gain checks.
  4. Emit a bytecode or executable artifact with an auditable “proof
     payload” (even if it is initially just a structured metadata
     section).
This sequence matches MLIR’s philosophy: start with a dialect +
verifiers, then add passes and lowering and eventually settle on
stable bytecode versioning and upgrade paths if needed.[2]

Realistic strengths
     Early failure with context: verifier-first design, coupled with --
     verify-diagnostics tests, creates a culture where invariants are
     enforced at the earliest stage and with human-readable
     diagnostics.
     Staging without lying: Optional attributes and explicit sentinels
     make it possible to represent “not yet resolved” states without
     resorting to invalid IR.
     Composable tooling: dialects and passes can remain modular;
     Tooling can own build/CI/migration while PIRTM owns
     semantics.
Realistic risks and limitations
    Mathematical-to-engineering gap: ensuring that the spectral
    gating check (e.g., power iteration) is a faithful proxy for the
    intended stability property requires careful numerical analysis,
    conditioning considerations, and clear specification of what
    norm/spectral quantity is being bounded.
    Diagnostic stability as API: using exact diagnostic strings as
    tests is powerful but can ossify developer experience; it requires
    explicit policy about when diagnostic text changes are allowed.
    Performance costs: runtime proof-carrying or repeated spectral
    checks can be expensive; the system must be careful about when
    checks run (transpile-only vs link-only vs runtime).

Recommended next artifacts (to keep
governance and implementation aligned)
    Tooling ADR: “Day 0–3 type-layer gate” describing the CI checks,
    expected-error strings, and the C++ verifier helper functions.
    Tooling ADR: “prime→mod migration” describing the shim
    protocol and grep merge gates.
    PIRTM ADR note: “Tooling owns implementation ADRs; PIRTM
    ADRs own semantics,” to avoid split-brain.
These ADRs serve as explicit levers: they bind what changes are
permitted, where they happen, and what tests or gates prove them.

References
  1. Prime-Indexed Tensor Mathematics for Auditable AI Systems - 🚀
     Introducing PIRTM — Prime-Indexed Recursive Tensor
     Mathematics: a new way to represent system stat...
  2. MLIR Language Referencemlir.llvm.org › docs › LangRef - Multi-
     Level IR Compiler Framework
  3. llvm-project/mlir/docs/DefiningDialects/AttributesAndTypes.md
     at main · llvm/llvm-project - The LLVM Project is a collection of
     modular and reusable compiler and toolchain technologies. -
     llvm...
4. llvm-project/mlir/docs/DefiningDialects/Operations.md at main ·
   llvm/llvm-project - The LLVM Project is a collection of modular
   and reusable compiler and toolchain technologies. - llvm...
5. How to Build your own MLIR Dialect - FOSDEM 2023
