\*\*✅ Updated PIRTM Compute Language Roadmap (Production-Grade)\*\*

This roadmap integrates the \*\*Ensemble\*\* system (as the governed crate equivalent), builds on your current progress (MLIR emitter, SpectralGovernor tests, E2E suite \+ test-builder macro, CI, workspace), and maintains the existing Day-style gates where they fit. It emphasizes \*\*invariants-first development\*\*, measurable milestones, and clear acceptance criteria.

\#\#\# Vision  
A \*\*self-verifying, prime-indexed, contractive compute language\*\* with first-class governance (Phase Mirror / Sedona Spine). Ensembles are the unit of modularity, reuse, and provenance — every composition must preserve multiplicity and contractivity.

\#\#\# High-Level Phases

\*\*Phase 0: Foundations (Completed / In Progress)\*\*    
\*\*Goal\*\*: Stable single-ensemble compilation with core invariants.

\*\*Phase 1: Ensembles & Composition (Next 4–6 weeks)\*\*    
\*\*Goal\*\*: Multi-ensemble workspaces with safe linking and governance checks.

\*\*Phase 2: Packaging & Ecosystem (6–12 weeks)\*\*    
\*\*Goal\*\*: Publishable, discoverable, versioned ensembles with registry support.

\*\*Phase 3: Performance & Runtime (3–6 months)\*\*    
\*\*Goal\*\*: Production-grade hot path (AVX2 sigmoid, full MLIR lowering, benchmarks).

\*\*Phase 4: Sovereign & Advanced Applications (Ongoing)\*\*    
\*\*Goal\*\*: Full sovereign domain integration, quantum prototypes, health/consciousness interfaces.

\#\#\# Concrete Milestones & Gates

\#\#\#\# Phase 1: Ensembles & Composition (Target: End of July 2026\)

\*\*Milestone 1.1: Ensemble Manifest & Basic Imports (Week 1–2)\*\*  
\- Manifest format (\`manifest.pirtm\`) parsed and validated (prime\_index, spectral\_radius, dependencies).  
\- Import grammar (\`use ensemble::path\`) implemented in parser.  
\- Emitter produces \`pirtm.ensemble\` boundary with metadata.  
\- \*\*Gate\*\*: All existing E2E tests pass after refactor with \`e2e\_test\!\` macro; new multi-file ensemble test passes.

\*\*Milestone 1.2: Dependency Resolution & Spectral Linking (Week 3–4)\*\*  
\- Workspace supports multiple ensembles with dependency graph.  
\- \`SpectralGovernor\` runs at link time on composed ensembles.  
\- Contractivity failure produces clear diagnostic.  
\- \*\*Gate\*\*: End-to-end test with two ensembles (one depending on another) succeeds only if spectral radius stays contractive; failing case is caught.

\*\*Milestone 1.3: Provenance & Receipts (Week 5–6)\*\*  
\- Automatic ContractivityReceipt generation on ensemble build/publish.  
\- Ledger anchoring (Archivum).  
\- \*\*Gate\*\*: \`pirtm build\` on a multi-ensemble workspace produces verifiable receipt; CI passes.

\#\#\#\# Phase 2: Packaging & Ecosystem (Target: End of September 2026\)

\*\*Milestone 2.1: CLI Tooling for Ensembles\*\*  
\- \`pirtm new ensemble \<name\>\`  
\- \`pirtm add \<ensemble\>\`  
\- \`pirtm publish\` (with receipt \+ ledger)  
\- \*\*Gate\*\*: Create, depend on, and publish a sample ensemble end-to-end.

\*\*Milestone 2.2: Registry Prototype\*\*  
\- Simple file/Git-based registry \+ ledger verification.  
\- Dependency resolution with version \+ spectral constraints.  
\- \*\*Gate\*\*: Public sample ensemble can be depended on from another workspace.

\*\*Milestone 2.3: Governance & Documentation\*\*  
\- Full language reference \+ Ensemble guidelines.  
\- Defensive publication template for new ensembles.  
\- \*\*Gate\*\*: At least 3 example ensembles (core-tensor, governance, runtime) published with full provenance.

\#\#\#\# Phase 3: Performance & Runtime (Target: End of 2026\)

\*\*Milestone 3.1: Sigmoid & Hot-Path Optimization (C-09)\*\*  
\- AVX2 \`sigmoid\_inplace\` (or Sleef integration) with benchmarks.  
\- 10× target validated on 512-dim step.  
\- \*\*Gate\*\*: Benchmarks show sigmoid \< 100 µs (ideally \<\<) on 512 elements; full step meets goal.

\*\*Milestone 3.2: Full MLIR Lowering & C++ Pass Integration (C-04)\*\*  
\- Spectral Enforcement Pass wired into pipeline.  
\- Complete lowering for key ops (including sigmoid).  
\- \*\*Gate\*\*: \`mlir-opt\` pipeline with spectral pass succeeds on contractive modules and fails on non-contractive ones.

\*\*Milestone 3.3: Runtime Execution & WardMonitor\*\*  
\- Full runtime with ensemble loading.  
\- Real-time drift detection integrated.  
\- \*\*Gate\*\*: End-to-end benchmark \+ observability test passes.

\#\#\#\# Phase 4: Sovereign & Applications (2027+)  
\- SUBLEQ/PCSL gates between ensembles.  
\- Quantum number-theoretic prototypes.  
\- INTRINSICA / EchoMirror-HQ integration.  
\- Open registry \+ community governance model.

\#\#\# Acceptance Criteria (All Phases)  
\- All tests green (including new E2E with macro).  
\- CI passes on every push/PR.  
\- Invariants enforced (no bypassable contractivity/spectral checks).  
\- Provenance present for all artifacts.  
\- Documentation updated.  
\- Performance gates met where applicable.

\#\#\# Risks & Mitigations  
\- \*\*Scope creep\*\* → Tie every feature to an Ensemble or invariant; use ADRs.  
\- \*\*Performance regressions\*\* → Enforce benchmarks in CI.  
\- \*\*Governance overhead\*\* → Make checks optional in dev mode but mandatory for publish/link.  
\- \*\*Adoption\*\* → Provide excellent examples and migration path from plain Rust/MLIR.

\---

\*\*Would you like me to:\*\*  
\- Draft the \*\*detailed tasks / issues\*\* for Phase 1 (with owners and estimates)?  
\- Provide the \*\*refactored \`end\_to\_end.rs\`\*\* using the new macro?  
\- Flesh out the \*\*Ensemble Manifest parser changes\*\* or import grammar additions?  
\- Or expand any specific phase with more details (e.g., registry design, AVX2 integration plan)?

This roadmap keeps the project focused, measurable, and true to the mathematical foundations. Let me know your priority and I’ll deliver the next artifact right away.