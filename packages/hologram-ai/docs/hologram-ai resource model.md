# hologram-ai resource model: maximum entropy in minimum k

Grounded at hologram-ai HEAD `570fb6f`. Upstream absorbed this model as
`docs/conceptual-model/04-resource-model.md`; that file is now authoritative,
this doc tracks it. Objective: viable LLM streaming
in-browser at optimal performance. Means: hold the maximum entropy in the
minimum k-representation; the resource model is minimal when the addressing
equivalence coincides with the semantic equivalence of the workload, and
verification is placed at trust boundaries only.

## Axes, floors, levers

| Axis | Floor | Lever | Ledger anchor |
|---|---|---|---|
| Rest | corpus entropy / addressing quotient | coarsen the quotient (canonical form) | `kappa-addressing`, candidate S0 canonical rows |
| Transit | set-difference(remote, known) under the quotient; known = provenance-recorded κ, not cached bytes | κ-prior: provenance under the shard's content pin (HTTP ETag, the Hub's blob hash), κ-manifest (cross-model, declared); coalesced ranges | `kappa-provenance-resolution`, `network-skip` |
| Structure | O(config) graph + 32B·#tensors(config) identity data | parametric generation; minimal rep = (family id, config, κ-manifest) | `parametric-graph`, `parametricity` |
| Residency | max stage + context window + resident prefix labels O(L·seq·d_kv), per environment | stage granularity; measured-headroom residency (stages resident while the environment measurably has room; one stage is the floor; fallback to strict windowing, never refusal) | `staged-execution`, `stage-residency-cache`, `memory-guard` |
| Generation | novel suffix cone only | window follows the sequence (geometric buckets, model context as ceiling); recursion through the known: resident labels re-derived, not re-executed (CE) | `staged-window-growth`, `decode-elision`, `structural-ce` |

## Generation over the known

The compute-side statement of the goal. A decode step's derivation walk
re-derives labels for the unchanged prefix cone and executes only the novel
suffix. This is the cache-collapse advantage established by UOR-Atlas-UTQC
(subverting exponential expansion via κ-residency) inherited through
holospaces; hologram-ai instantiates it as decode elision, with no KV-cache.
Generated content is itself κ-labeled on production, so generation extends the
known set: each step's output is known content for every subsequent step.
Elision keys on realized token ids: once emitted, a token is an input, and the
prefix cone derives from it regardless of how it was chosen. Pinned sampler
state (params + seed) enters the derivation key only where the walk itself is
reproduced: speculative continuation cones and cross-session identical walks.

The novel cone, precisely: one position's forward pass. Per token,
O(L·d²) projection/MLP work at the new position plus attention reads over the
resident prefix labels (the K/V-class outputs of every prior position, held
in the session memo). The prefix labels are O(L·seq·d_kv) bytes, grow
linearly with the sequence, and are the memo's dominant tenant; they belong
in the residency floor.

Boundaries: derived-label reuse requires bit-exact kernel determinism,
witnessed per environment (`structural-ce`); cross-environment reuse is open,
not build.

## Soundness condition (all axes)

Three conditions, all required:

1. **Congruence.** A quotient is admissible only if it is a congruence with
   respect to the kernels: any two representatives of a class are
   execution-indistinguishable. Decidability and fail-closed checks guard
   label identity only; without congruence, representative substitution
   changes outputs while every hash check passes.
2. **Tagged verification.** Under quotients the check is
   canonicalize-then-hash, so every κ carries its quotient tag (byte-κ is the
   identity quotient). Untagged coexistence invalidates provenance records and
   compiled bindings; migration between quotients is re-mint + rebind, never
   reinterpretation.
3. **Fail closed, recover by rebind.** An asserted κ either verifies
   (canonicalize-then-hash under its tag) or resolution rejects with the
   label. A rejected prior is recovered by fetching the current model's
   recorded range, minting κ from the bytes, and recompiling the weightless
   binding. A wrong prior degrades to a stream; it never dead-ends the
   journey and never executes on unverified content.

The prior accelerates; the posterior governs.

Cost tension: canonical quotients pay canonicalize-then-hash in the streaming
and verification paths. Each declared equivalence is its own dictionary row
with its own witness and its own measured cost; no aggregate canonicalization
claim.

## Critical path (in-browser)

What the user experiences is time-to-first-token and tokens/sec. Each cost is
owned by exactly one lever:

- **Wire:** transit prior (skip known κ, coalesced ranges). Dominates
  time-to-first-use on cold start; zero on warm start.
- **Compile:** weightless, O(config); import+optimize once per window size,
  reused while the window fits (`engine.rs` window reuse). Off the per-token
  path.
- **Materialization:** per stage per window; verified-set makes it read-only
  I/O after first touch. OPFS sync access handles on the worker path.
- **Decode:** two levers, one per factor of cost = cone size × per-element
  cost. Elision bounds the cone to the novel suffix; the Q0 kernel floor
  bounds per-element cost (see Kernel floor). Zero verification, zero
  recompute-to-check. This is the tokens/sec owner.
- **Sampler:** pinned state; negligible cost, but on the path and part of the
  derivation key.

A cost on the per-token path that is not decode or sampler is a defect.

## Kernel floor (micro-architectural)

The rest/generation principle recurs at cache scale. A function over a finite
domain is its own table: at Q0 (Z/256) any operation's value-dependent state
is a 256-entry LUT (4 cache lines) plus a 64B psumbook (1 line), L1-resident
by construction. Hit rate on reused state is structurally 1; residual traffic
is single-pass sequential streaming (compulsory misses only, prefetch-hidden).
Fiber-ordered Q8 GEMM touches 1 L1 line per radix pass (hologram plan 033).

Scope: the bound is per tier. Q1 tables (`[u16;65536]`, 128 KB) are
L2-resident on typical L1d; the claim does not lift to Q1. Precision above Q0
routes through the carry chain only (see Totality); there is no float escape.

Witness: native hardware counters (L1-dcache miss ratio partitioned into
table vs streaming accesses, ~0 on the former after warmup) as a
performance-contract row. wasm exposes no counters; in-browser the statement
stays structural, native measurement is the proxy.

## One principle, three scales

Recursion through the known (UOR-Atlas-UTQC: cache collapse subverts
expansion) instantiated at each residency tier:

| Scale | Known set | Reuse act | Store |
|---|---|---|---|
| Content | provenance-recorded κ | wire skip, materialize-once | OPFS κ-store |
| Compute | derived labels (CE) | decode elision of the prefix cone | session memo |
| Kernel | function values over finite domain | LUT lookup replaces recompute | L1 |

The wasm/native decode gap closes from both ends: elision shrinks the cone
(fewer elements), the Q0 floor bounds cost per element (table lookups, no
transcendentals, no thrashing). Neither lever requires threads; both are
admissible in wasm today. What remains after both is irreducible novel
arithmetic, which is the definition of the floor.

## Totality: no classical fallback

The execution path is single and total. Every graph operation lowers to the
quantum hierarchy (Q0→Q3 carry chain); precision is not a mode switch to a
float path but a carry lift, decided by curvature (CurvatureFlux, statically
promoted where the compiler proves it). The float reference exists at gate
time only: tables are built `narrow(f(widen(bits)))`, bit-identical to the
reference by construction, and the reference is then retired from runtime.
A runtime float escape is a defect of the same kind as per-token
verification: it reintroduces the cost structure the model eliminates and
forks semantics into two paths with two behaviors.

Distinguish resource fallback from semantic fallback. Strict windowing under
memory pressure is a projection within the k-model (same semantics, different
plan; never refused). A classical kernel path is a second semantics and is
inadmissible. The first degrades performance; the second forfeits the model.

Arbitrary models: coverage is the totality of the lowering, measured by the
open row `arbitrary-architecture-coverage`. An op the hierarchy does not yet
express is a dictionary gap that halts loudly, never a license for a float
path. Arbitrary input: totality holds per tier by finiteness (any byte
stream is Q0-valid; higher tiers reached by carry), so novel input executes
on the same path as known input; reuse varies, semantics never.

Arbitrary ceilings are prohibited. Any guard whose bound derives from a
residency assumption is transitional and must be made unreachable by
structure, never kept as a rejection. The instrument is sub-tensor
κ-resolution: a stage binds a byte range of a κ, verified once against the
whole label; the tensor is then a term over ranges exactly as the model is a
term over κs. The head is the first application: vocab-chunked head stages
sized to the pipeline's own layer-stage granularity, logits reduced across
chunks, no whole-vocabulary image ever resident. Any vocab at any scale then
executes, and the preflight floor has no reachable input. The same
instrument dissolves any future per-tensor ceiling: no single tensor need
ever fit anything.

Landed as `chunked-head` (`8e6323f`): range bindings materialize only their
range after one whole-κ verification; chunk size follows stage granularity;
the head floor guard survives only on the monolithic plan, where it is true,
and is unreachable from the staged plan by construction.

Candidate row: `total-algebraic-path` (build) — every executed kernel is a
hierarchy kernel; zero runtime float dispatch; parity with the retired
reference witnessed at gate time per (op, tier).

## Lifecycle: saturation-derived residency (UOR-Framework #2)

Every residency tier currently uses an ad-hoc retention policy (cache budget,
admission probe, off-hot-path memo trimming). Issue #2's move: derive decay
from resolution state instead of assigning it. λ_eff = λ_base · T_ctx, where
T_ctx falls to zero as an object's fibers pin; σ = 1 means no decay.

The pinning events are exactly the trust-boundary crossings this model
already defines; no new runtime work, only counters off the hot path:

| Event (already occurring) | Pin weight | Tier affected |
|---|---|---|
| κ bound in the active compiled archive | σ = 1 (ground state) | κ-store: never evict while bound |
| First-touch verification (session set) | high | κ-store, session memo |
| Label recurs as operand in a derivation (CE reuse) | medium | session memo: prefix cone crystallizes |
| Materialization / read | low | κ-store |
| Verification failure / prior mismatch | unpin + T spike | evaporates, re-resolves from provenance |

Consequences per tier. κ-store eviction becomes σ-ordered: unbound gas-phase
content (tensors of unloaded models) evaporates first, the active binding is
crystalline by construction. The session memo's trimming is derived: prefix
cone labels re-pin every token (σ → 1, never trimmed), abandoned speculative
branches heat and evaporate. The recovery path gains its eviction event for
free: a failed verification is an unpinning, so corrupted content leaves the
cache by the same law that admitted it.

λ_base is pressure-scaled: the residency admission probe generalizes from a
binary resident/strict switch to a graded policy where headroom pressure
raises global decay and low-σ content evaporates first, protecting the
crystallized core. This keeps the totality distinction intact: a continuous
resource projection, same semantics at every pressure.

Discipline: hologram-ai needs only the eviction ordering σ induces, not the
thermodynamic vocabulary; FiberBudget/T_ctx stay upstream primitives.
Candidate row `saturation-residency` (build): eviction order is σ-order;
bound κ is never evicted; a failed verification unpins; policy quality
(hit rate vs LRU baseline) measured, never asserted.

## Closure of the known set over derivation

Unexplored headroom: the known set closes over deterministic derivation. Any
artifact computed deterministically from κ inputs has a derived κ and is
itself content, persisted in the κ-store exactly like weights. Each expensive
step runs once per host and enters every later session's prior (the UTQC
seeding pattern: seed with the entailed flow); the warm browser resolves work
instead of re-performing it.

Artifact classes this admits, each currently recomputed per session:

| Derived artifact | Derivation inputs | Cost it removes from the client |
|---|---|---|
| Compiled stage archives | model κ-manifest, config, window bucket | streamed compile (~2 s/window + import) |
| Fused LUTs (Q0/Q1 unary chains) | op chain, dtype, tier | table build; chains collapse to one lookup |
| Quantized weight forms | tensor κ, quantization params | wide form transits at most once; after the quantized derivation crystallizes, wide blobs go gas-phase and never re-transit or re-materialize |
| Curvature profiles | model κ-manifest, calibration set κ | per-layer lift decisions precomputed; runtime dispatch stays <10 ns |
| Prefill cones (recurring prompt prefixes) | graph κ, template/prefix κ, bucket | prefill of the recurring prefix across sessions; TTFT pays only the novel suffix |

Soundness is inherited, nothing new: derived κ verifies by
canonicalize-then-hash under its tag; every artifact is re-derivable locally,
so a wrong prior fails closed and recovers by deriving instead of fetching.
Congruence for the quantized form is the Q0 execution semantics itself (the
quantized form is the native form; see Totality). Prefill cones sit behind
`structural-ce`: valid within an environment equivalence class, and the class
boundary is witnessed, never assumed.

Saturation composes: derived artifacts pin by the same events (bound archive
σ = 1, prefill cones re-pin per session that shares the prefix), so hot
derivations crystallize in the host κ-store and rare ones evaporate. The
κ-store becomes a derivation cache ordered by use.

Candidate rows: `derived-artifact-kappa` (build; derivation key is total and
deterministic, artifact re-derives bit-identical, fail-closed with
derive-as-recovery), `prefill-cone-reuse` (build; cone valid iff environment
class matches its witness; TTFT delta measured), `quantized-transit` (build;
wide form fetched at most once per tensor, never re-fetched after the
quantized form crystallizes, never a runtime operand).

## Annealing: memo and table are one spectrum

A table is a total memo over a finite domain; a memo is a partial table over
an observed domain. The Q0 LUT, the prefill cone, and the session memo are
the same object at three densities: total (every input tabulated), one point
(a single known input, fully derived), and sparse (inputs seen so far). This
gives cone tabulation a law rather than a heuristic.

A cone tabulates when either bound is met:

- **Structural**: its input domain is finite and within the table feasibility
  hierarchy (embedding rows, Q0/Q1 unary chains, any token-conditional
  subgraph whose domain is the vocabulary). Feasibility is a type-level fact.
- **Statistical**: σ over its observed domain crosses the crystallization
  threshold. The memo entries for a hot cone are densified into an indexable
  table; cold regions stay sparse or absent. The saturation lifecycle already
  supplies the ordering; tabulation is what σ = 1 means operationally.

Tables tier by size across the same residency hierarchy: Q0 op tables in L1,
fused chains in heap, vocab-scale cone tables (e.g. token-conditional layer-0
projections, ~vocab·d entries) in the OPFS κ-store. Tabulation is a density
claim, never a residency claim; the L1 statement belongs to the kernel floor
alone.

Both directions are semantics-free: a table entry is `derive(inputs)` by
construction, re-derivable, fail-closed under its derived κ. Eviction is
melting, by the same lifecycle. The system anneals toward lookup: deployment
age converts execution into resolution, and per-token cost decays toward the
irreducible novel frontier. This is the operational form of the
cache-collapse claim: expansion is subverted not once at design time but
continuously, wherever use concentrates.

Idle time feeds the anneal. Between turns the browser pre-derives entailed
work off the critical path: the next window bucket's archive, continuation
cones under the pinned sampler, table densification for cones near threshold.
Idle compute converts to known content; nothing speculative is trusted beyond
its derived κ. Under pressure, speculation is the lowest-σ content by
definition, so λ_base scaling throttles idle derivation first; the anneal
never competes with the admission probe.

Candidate rows: `cone-tabulation` (build; a tabulated cone re-derives
bit-identical per entry; densification and melting follow σ-order; lookup
and derivation are output-indistinguishable), `idle-derivation` (build;
speculative work never touches the per-token path; abandoned speculation
evaporates by lifecycle; hit quality measured).

## End state: two traffic classes

The annealed per-token access set is total over two classes, with nothing in
between:

1. **Structurally L1-resident reused state**: Q0 op tables, psumbooks,
   dispatch state. Hit rate 1 by the kernel floor.
2. **Single-pass prefetchable streams**: the position's weight traversal
   (stage archives in materialization order), the resident prefix labels
   (sequential scan under attention), input/output activations. Compulsory
   misses only.

Elision removes recomputation (the prefix never re-executes), tabulation
removes derivation where use concentrates (lookup replaces execute), and
totality removes every access pattern outside the two classes (no float
escape, no irregular dispatch). The per-token floor is then
O(L·d²) table-lookup MACs + O(L·seq·d_kv) streamed label reads, both
bandwidth-shaped, neither latency-bound. Anything measured above this floor
is attributable: a cone not yet elided, a table not yet dense, or an access
in neither class, which is a defect by Totality.

This sharpens the critical-path rule into an audit: every per-token cost is
either decode-floor traffic in one of the two classes, sampler, or a named
defect.

## Benchmark: efficiency against floors

The floors make benchmarking generic: report measured/floor per axis, never
absolute times. Absolute numbers are machine facts; the ratios are the
implementation's quality, comparable across hosts, models, and inputs. A
ratio of 1 is the information-theoretic ceiling for that axis; every excess
is attributable through the closed enumeration.

Calibration first: a microbench measures the environment's stream bandwidth
(sequential wasm heap traversal) and lookup throughput (L1-resident table).
All floors are stated in these measured units, so the harness is generic by
construction.

Per-axis ratios:

| Axis | Ratio (measured / floor) | Floor source |
|---|---|---|
| Wire | bytes fetched / set-difference entropy | transit axis; warm start floor is 0 |
| Rest | store bytes / corpus entropy under the active quotient | rest axis |
| Structure | archive bytes / (O(config) + 32B·#tensors) | structure axis |
| Residency | peak claimed heap / (max stage + window + prefix labels) | residency axis |
| TTFT | measured / (wire + compile + prefill floors, each 0 on hit) | derivation closure |
| Decode | s/token / (stream bytes per token ÷ calibrated bandwidth + lookups ÷ calibrated lookup rate) | end-state two classes |

Decode's floor is computable per (model, seq, environment): stream bytes =
weights touched per position + prefix labels + activations; lookup count =
tabulated MACs. Both classes are bandwidth-shaped, so the floor is a linear
form in calibrated units.

Genericity of coverage: arbitrary models via a parametric sweep over
(family, config), which is `arbitrary-architecture-coverage` exercised, not
sampled anecdotes. Scale is a dimension of the sweep, not a fixture choice:
the floors are parametric in config, so the witness of "arbitrary" is ratio
invariance as parameters grow through the environment's structural bounds,
past the residency budget (strict windowing engages), past the wasm heap
(the window is the bound, never the model), past OPFS quota (cache-not-mirror
engages). Small models are smoke tests; the claim is only witnessed where
the model exceeds what the environment can hold, since below that line
staged execution is indistinguishable from residency. A ratio that degrades
at a boundary names the leaking mechanism; a flat ratio across the boundary
is the scaling claim, measured.

Arbitrary input via an entropy-controlled corpus sweeping
the reuse spectrum from all-novel to all-known; the primary output is the
reuse curve, per-token ratio as a function of prior coverage, whose limit at
full coverage witnesses the anneal and whose all-novel end witnesses the raw
floor. Input length sweeps through window buckets to the model's context
ceiling, so growth machinery is exercised, not assumed.

Attribution closes the loop. Counters per class, all off the hot path:
elided vs executed cone elements, table hits vs derives, skipped vs fetched
bytes, asserted vs verified materializations, in-class vs out-of-class
access (native counters as proxy). Every point of ratio excess maps to one
lever in this document; a residual mapping to no lever is a model gap and
becomes a row.

Harness discipline: the harness is itself a k-citizen. Fixtures are
parametric, derived from (family, config, seed) with weights generated
deterministically and streamed; an oversized fixture is never fully
materialized anywhere, including on disk, since its identity is its
derivation key. Everything the harness produces (fixtures, derived
artifacts, counters, reports) enters the κ-store as derived content under
the same lifecycle: nothing pins past the run, so fixture content is
gas-phase at teardown and evaporates under the standing cache budget.
A run's residual footprint is its report κ plus whatever the run itself
saturated; repeated runs re-derive or resolve, never accumulate.

This is the content of the open `performance-contract` row: the contract is
a set of ratio thresholds per axis, held open until measured, tightened as
levers land, never asserted.

## Verification placement

Verify at trust-boundary crossings, once per crossing, never per traversal.

- **Mint (network → runtime):** free; hashing is what produces κ.
- **Prior meets content:** manifest- or provenance-asserted κ verifies at
  first materialization (canonicalize-then-hash under its tag). Once.
- **Session cache:** a session-local verified-κ set; a κ verified this
  session materializes without re-hash. Staged execution re-materializes;
  it must not re-verify.
- **Write path:** cache integrity is write-once atomicity (temp-then-rename),
  not read-side re-hashing.
- **Elision path:** zero runtime verification. Derived labels are asserted in
  the hot path; their soundness is gate-time (`structural-*` witnesses, CI).
  Recompute-to-check deletes the advantage.

## Ledger state at `570fb6f`

50 rows: 15 verified, 32 build, 3 open. `570fb6f` lands `quantized-transit`
(S3, build), native core: a projection's quantized form derives
deterministically from its wide κ (transposed at derivation, per-channel
symmetric int8, ~3.8x smaller, bit-identical re-derivation) and enters the
κ-store as ordinary derived content. Stage graphs bind it as two ranged
sub-tensor κ-bindings feeding Dequantize adjacent to its matmul, the
substrate-fused shape; rank>2 activations flatten around the matmul (the
fused kernel is 2D). Witnessed: with every wide projection evicted, the
staged pipeline generates moving zero wide bytes and equals the quantized
monolithic archive. Quantization is a semantic tier; quality vs the wide
tier is measured, never asserted. Browser derivation tier is the named
follow-on.

`d917a77` completes sub-tensor
κ-resolution's transit side: `KappaStore::resolve_range` moves only a
binding's byte range once the κ is session-verified (Dir seeks; browser
reads OPFS at offset or issues a ranged GET inside the recorded provenance
span). Verification stays the only whole read. Witnessed on the chunked-head
fixture: verified-pass ranged reads tile the tensor exactly, 2 MB moved
where whole-resolve-and-slice moved 9 MB.

`8e6323f` lands both candidate rows
as one (`chunked-head`), source-confirmed:

- κ-range bindings: `AiParam::External` gains an optional byte range,
  serialized `ConstantId(n):<κ>@offset+len`; first touch resolves and
  verifies the whole κ (session set makes later touches read-only I/O), the
  constant patches with its verified slice. No tensor is atomic.
- Chunked head: vocab-row chunks at the pipeline's own stage granularity;
  chunk 0 carries residual + norm, each chunk concats its logits slice.
  A head within layer granularity is one chunk, byte-identical archives for
  existing fixtures. Derivation keys bump to v2.
- Plan-aware preflight: the floor guard remains only where true (the
  monolithic plan); the staged plan validates the graphs it actually builds.
  The 1.5B rejection is unreachable by construction.
- Witnessed: chunks tile the head κ exactly within layer granularity;
  chunked logits agree within kernel reduction-order tolerance (≤ 4e-7,
  matmul tiling varies with output width) with exact greedy parity;
  chunked generation equals monolithic. Real scale: Qwen2.5-1.5B, previously
  trapping at its head, compiles to 34 stages and chats in headless
  Chromium.
- Follow-on `KappaStore::resolve_range` landed in `d917a77` (above).

`3e33e03`, three real-scale fixes
(Qwen2.5-1.5B staged) plus the idle anneal's first clause, all witnessed:

- Margin-aware admission (`stage-residency-cache`, `memory-guard`): a
  stage's true working set includes two full F32 execution images beyond the
  material copies; admission now reserves the pipeline's largest-stage
  transient bound (3× raw bytes + 8 B/element, parametric in dtype),
  computed exactly from the manifest and κ-maps before anything
  materializes. Refusing probe degrades to strict windowing.
- Quota fail-soft with σ-order eviction (`memory-guard`): measured headroom
  is a projection; the real quota answers at the write. Refused tensor-cache
  writes stop caching (journey continues on provenance); refused structure
  writes evaporate gas-phase tensors until the crystalline structure lands.
  Witnessed under a real CDP-enforced quota: download completes, chat
  answers.
- Head execution floor (`bounded-embedding`, refined): the 1.5B head's
  execution working set (3.27 GB measured) structurally exceeds the 32-bit
  tab ceiling even strict; the floor (2×elems×4 + 3×elems×storage) fires at
  graph build during preflight, rejecting in seconds with zero bytes moved,
  naming tensor, numbers, and paths. The 0.5B tied head passes and runs.
  The floor is transitional: a whole-vocabulary matmul is a residency
  assumption, not a law. Stage granularity applies to the head itself; with
  κ-range bindings and vocab-chunked head stages the guard becomes
  unreachable by construction (see candidate rows).
- `idle-derivation` (S3, build) first clause: between turns the session
  pre-derives the next bucket's stage archives off the per-token path; a
  later crossing resolves instead of compiling; speculation inert,
  `derived_hits` counts.

`3e22634`: `network-skip` (S1, build) landed:
the ETag is the content pin (the Hub's blob hash), captured from the existing
preflight header reads; a global provenance record maps ranges to κs; on a
repeat under an identical pin, recorded ranges enter the manifest without
transiting and unknown runs move as coalesced ranges; a changed pin discards
the prior wholesale. Witnessed hermetically: repeat download moves zero shard
body bytes in exactly two header-range requests. The pin replaces the earlier
revision-pin oracle framing; skipped κs still only assert, verification stays
at first materialization, wrong priors unpin and recover. Cross-model
κ-manifest tier stays declared, not implemented.

`8b6313d`: warm-turn's faster
resolve surfaced a transcript race (debounced flush vs re-enabled Send built
turn 3's prompt from a truncated turn 2); final completion now commits
synchronously before the composer re-enables. Hermetic suite green three
consecutive runs. Landed since `2315c56`, source-confirmed:

- `warm-turn` (S4, build): `StagedChatSession` (wasm class,
  `hologram-ai-wasm/src/lib.rs:779`) persists the growable staged session
  across sends; worker outlives the send, keyed by model dir. Witnessed in
  browser: turn 2 warm, zero materializations, non-empty completion. Cancel
  and errors terminate; the next send is a cold turn with identical
  semantics. Warmth is a projection, never a meaning. Semantic parity of
  warm execution is carried by the native cached-vs-strict and
  growable-vs-fixed parity scenarios, not by the browser row.
- `saturation-residency` (build): `KappaStore::invalidate` is the unpin hook
  (`materialize.rs`); first-touch mismatch invalidates the failing entry only,
  re-resolves once through the deeper tier, re-verifies before execution;
  unrecoverable failure stays loud naming the label. The κ-store previously
  had no eviction; a corrupted entry dead-ended.
- `derived-artifact-kappa` (build): `DerivedStore` (`staged.rs`), key = κ
  over exact derivation inputs (config, κ-manifest, window, partition);
  `GrowableStagedSession` resolves stage archives content-verified at load,
  off the per-token path; corrupted entry evaporates, recovery is derivation.
  Cross-turn residency witnessed: second generation over a warm session adds
  zero stage materializations.

Prior landings (`2315c56`): `session-verified-kappa`, `stage-residency-cache`
(measured native 3-4x), `staged-window-growth`, `session-window`,
`deterministic-compile`, `bounded-embedding`.

Open: `arbitrary-architecture-coverage`, `total-algebraic-path` (adopted
upstream from this model's Totality section), `performance-contract` (its
content is the Benchmark section). Candidate rows not yet in the ledger:
canonical quotients, network skip, prefill cones, quantized transit,
cone tabulation, idle derivation.

## Measured (2026-07-05, Qwen2.5-0.5B bf16, headless Chromium)

Reported, never asserted: download + streamed compile ~31–38 s; first token
~60–90 s; ~85 s/token in wasm thereafter. Native on the same κ-store:
~4 s/token resident vs 15–25 s strict. SIMD128 moved end-to-end ~4% (LLVM
does not reassociate float reductions).

The critical-path rule now names the frontier precisely: with verification
and rematerialization off the per-token path, the remaining per-token cost is
a full forward pass over all stages. Both decode levers apply: elision
(`decode-elision`, build) shrinks the cone; Q0-tier kernels (kernel floor,
candidate performance-contract row) bound per-element cost. The path to
closing the ~20× wasm/native gap runs through both, threadless.
