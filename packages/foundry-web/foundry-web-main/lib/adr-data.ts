import { ADR, ADRRegistry, ADRStatus } from './adr-types';

export const FOUNDRY_ADR_SETS: Record<string, ADR[]> = {
  core: [
    {
      id: 'ADR-001',
      title: 'Integer Jordan Bond Governance',
      status: 'Superseded',
      context: 'Floating-point non-determinism introduces drift and spoliation risk in state transitions across distributed nodes.',
      decision: 'Enforce fixed-point integer Jordan bond arithmetic scaled by N = 1024 at the kernel boundary.',
      consequences: ['Arithmetic determinism guaranteed across heterogeneous nodes', 'Floating point drift strictly eliminated'],
      supersedes: null,
      links: [
        { uri: 'PhaseMirror.Care.Scale', kind: 'LeanDeclaration', description: 'Canonical fixed-point scale N = 1024' },
        { uri: 'Care.lean', kind: 'SourceFile', description: 'Integer fixed-point operations' },
      ],
    },
    {
      id: 'ADR-002',
      title: 'Sedona Spine Retention Engine Sole Source of Truth',
      status: 'Accepted',
      context: 'Decentralized litigation hold rules risk spoliation drift if computed independently by UI or client agents.',
      decision: 'All ESI preservation risk logic must route exclusively through the Sedona Spine Rust Engine and WASM SDK.',
      consequences: ['Zero drift in litigation hold calculations', 'Mandatory provenance chain: Policy → Event → Kernel → Witness'],
      supersedes: null,
      links: [
        { uri: 'models/legalese-scopist/CONTRACT.md', kind: 'SpecificationDoc', description: 'Preservation alert protocol' },
        { uri: 'models/legalese-scopist/', kind: 'SourceFile', description: 'Rust Engine Core implementation' },
      ],
    },
    {
      id: 'ADR-003',
      title: 'Per-Triad Resonance Floors (Audit v2)',
      status: 'Accepted',
      context: 'Aggregate mean resonance floor in ADR-001 permitted averaging blind spots where individual triads could fall below viability.',
      decision: 'Strengthen viability audit to require every individual triad to meet or exceed ResFloor = 870.',
      consequences: ['Eliminates averaging blind spot proved by averaging_blind_spot theorem', 'Preserves backward compatibility with audit v1'],
      supersedes: null,
      links: [
        { uri: 'ADR/Theorems/CareViability.lean', kind: 'SourceFile', description: 'Formalization of v2 thresholds' },
        { uri: 'PhaseMirror.CareViability.phase_mirror_audit_v2', kind: 'LeanDeclaration', description: 'Per-triad binary audit' },
      ],
    },
    {
      id: 'ADR-004',
      title: 'Meet-Semilattice Partition Refinement & LCR Operator',
      status: 'Accepted',
      context: 'SPMD distributed execution requires a formal refinement order over tensor sharding states.',
      decision: 'Enforce pointwise meet operator (⊓) over logical mesh axes with idempotent, associative, commutative semantics.',
      consequences: ['Deterministic least common refinement across distributed execution paths', 'Fail-closed immediate rejection of conflicting sharding schedules'],
      supersedes: null,
      links: [
        { uri: 'specs/p2c_petc_v12.md', kind: 'SpecificationDoc', description: 'P²C PETC v1.2 Specification Section 2.3' },
        { uri: 'packages/rust/pirtm-compiler/src/sharding.rs', kind: 'SourceFile', description: 'LCR Meet Operator Implementation' },
      ],
    },
    {
      id: 'ADR-005',
      title: 'BLAKE2b-16 Personalization & Canonical Bytecode Wire Format',
      status: 'Accepted',
      context: 'Witness bytecode streams require compact, tamper-evident framing with low verification overhead.',
      decision: 'Standardize binary wire format on header magic P2CWITv2, version 0x0102, LEB128/ZigZag varints, trailer 0xAA 0x55.',
      consequences: ['Bit-flip and truncation detection at frame boundary', 'Allocation-free stack-based decoding in high-performance runtimes'],
      supersedes: null,
      links: [
        { uri: 'specs/p2c_petc_v12.md', kind: 'SpecificationDoc', description: 'P²C PETC v1.2 Binary Wire Format Section 3' },
        { uri: 'packages/rust/core/src/petc.rs', kind: 'SourceFile', description: 'Bytecode Frame Parser' },
      ],
    },
    {
      id: 'ADR-006',
      title: 'MultiContract Atomic Contraction with PartialSum Tokens',
      status: 'Accepted',
      context: 'Contraction over sharded tensor dimensions produces partial sums requiring explicit collective reductions.',
      decision: 'Standardize opcode 0x05 (MultiContract) to atomically verify dual signatures and emit PartialSum(mesh_axis) tokens.',
      consequences: ['Prevents unreduced partial sum escapes in SPMD graphs', 'Simultaneous atomic multi-axis tensor contractions in O(k) time'],
      supersedes: null,
      links: [
        { uri: 'specs/p2c_petc_v12.md', kind: 'SpecificationDoc', description: 'P²C PETC v1.2 Opcode Semantics Section 4' },
        { uri: 'packages/rust/engine/src/petc.rs', kind: 'SourceFile', description: 'MultiContract Evaluator' },
      ],
    },
    {
      id: 'ADR-007',
      title: 'Commutative Collective Transformers for Deterministic Sharding Commit',
      status: 'Accepted',
      context: 'Multi-mesh collective operations must yield identical global sharding states regardless of topological scheduling order.',
      decision: 'Define collective transformers T_m that transition axis m to Replicated, and formally verify operator commutativity.',
      consequences: ['Topology-invariant global sharding commitment', 'Eliminates deadlocks and non-determinism in multi-axis reduction pipelines'],
      supersedes: null,
      links: [
        { uri: 'specs/p2c_petc_v12.md', kind: 'SpecificationDoc', description: 'P²C PETC v1.2 Section 2.3 Collective Transformers' },
        { uri: 'lean/Multiplicity/PETC.lean', kind: 'LeanDeclaration', description: 'Collective transformer commutation' },
      ],
    },
    {
      id: 'ADR-008',
      title: 'Prime Signature Canonical Monoid as Exclusive Rust Kernel Substrate',
      status: 'Accepted',
      context: 'All multiplicity computations must share a single, deterministic representation to prevent representational drift.',
      decision: 'The only permitted representation is a finitely supported map from primes to exponents with free commutative monoid structure.',
      consequences: ['Signature equality is decidable by structural comparison', 'Multiplicity product is strictly associative and commutative', 'Foreign representations must convert at kernel boundary or be rejected'],
      supersedes: null,
      links: [
        { uri: 'PhaseMirror.PrimeSignature', kind: 'LeanDeclaration', description: 'Formal specification of signature monoid' },
        { uri: 'packages/rust/multiplicity/multiplicity-core/src/signature.rs', kind: 'SourceFile', description: 'Target Rust implementation' },
      ],
    },
    {
      id: 'ADR-009',
      title: 'Mandatory Contraction Witness & Spectral Radius Verification Before Emission Gate',
      status: 'Accepted',
      context: 'Unconstrained recurrence or agent emission can produce unbounded Lyapunov drift.',
      decision: 'No signal may pass the Emission Gate unless a machine-checkable ContractionWitness proves spectral radius < 1.',
      consequences: ['EmissionGate returns Suppress or Hold when no valid witness present', 'SpectralGovernor is sole authority to mint ContractionWitness', 'Any bypass constitutes a hard kernel violation'],
      supersedes: null,
      links: [
        { uri: 'PhaseMirror.SpectralGovernor', kind: 'LeanDeclaration', description: 'Formal contract of spectral governor' },
        { uri: 'packages/rust/ramanujan-multiplicity', kind: 'SourceFile', description: 'Witness generation site' },
      ],
    },
    {
      id: 'ADR-010',
      title: 'Axiom-Clean Kernel Boundary and Manifested Proof Debt Policy',
      status: 'Accepted',
      context: 'Unmanifested sorry, todo!, or commented-out critical paths create verification leakage.',
      decision: 'The kernel boundary must be axiom-clean. Every open proof obligation must be fully discharged or explicitly manifested.',
      consequences: ['CI rejects any increase in manifested or unmanifested sorry count', 'Kernel startup performs static honesty manifest check', 'Research surfaces may contain open obligations only when quarantined'],
      supersedes: null,
      links: [
        { uri: '.github/workflows/adr-verify.yml', kind: 'SpecificationDoc', description: 'Honesty audit workflow' },
        { uri: 'docs/CURRENT_TRUTH.md', kind: 'SpecificationDoc', description: 'Living honesty ledger' },
      ],
    },
  ],
  governance: [
    {
      id: 'ADR-0013',
      title: 'UOR Civic Infrastructure',
      status: 'Accepted',
      context: 'The Foundry DAO progresses through three strategic developmental epochs.',
      decision: 'Adopt the canonical BCS wire format for the UnsignedCrmfEnvelope, the PWEH integrity binding, the contractivity gate, and fail-closed governance.',
      consequences: ['Deterministic cross-language canonical byte streams', 'Path-dependent tamper resistance across PWEH chain', 'Fail-closed governance: unmodeled defect halts L0', 'Integer-only wire: floating point structurally excluded'],
      supersedes: null,
      links: [
        { uri: 'docs/papers/UOR Civic Infrastructure_.docx', kind: 'SourceFile', description: 'UOR Civic Infrastructure' },
        { uri: 'lean/MTPI/ADR0013.lean', kind: 'SourceFile', description: 'Canonical BCS wire format formalized as Lean 4 theorems' },
        { uri: 'packages/rust/crmf/src/canonical.rs', kind: 'SourceFile', description: 'Canonical BCS wire format (Kani-verified)' },
      ],
    },
    {
      id: 'ADR-0017',
      title: 'Reinitialization — 90-Day Operating Plan and Volunteer Talent Model',
      status: 'Accepted',
      context: 'UOR Foundation must reinitialize under volunteer-led, no-funding assumption.',
      decision: 'Adopt 90-Day Operating Plan: one primary objective, Day Zero two-week mobilization, five workstreams max.',
      consequences: ['Execution capped by WIP limits', 'No-funding assumption binding', 'Cycle either closes deliverables or fails exit rule loudly'],
      supersedes: null,
      links: [
        { uri: 'docs/papers/UOR_Final_90_Day_Operating_Plan.docx', kind: 'SourceFile', description: '90-Day Operating Plan' },
      ],
    },
    {
      id: 'ADR-0113',
      title: 'Universal Closure Calculator — Unified Kernel Surface',
      status: 'Accepted',
      context: 'The Foundry hosts several independently verified surfaces with no single accepted decision binding them.',
      decision: 'Adopt the UCC sextuple as the canonical integration surface and wire every verified Foundry surface to it.',
      consequences: ['Every closure call returns Closure, Defect, Receipt, and Levers', 'Unlawful transitions fail closed at L0', 'Proof debt is explicit and bounded', 'Integer-only wire: floating point excluded'],
      supersedes: null,
      links: [
        { uri: 'docs/specs/ucc_sextuple_v1.md', kind: 'SpecificationDoc', description: 'Canonical sextuple wire format' },
        { uri: 'contracts/universal_closure.yaml', kind: 'SpecificationDoc', description: 'Declarative associator tolerance' },
        { uri: 'ADR/Theorems/Homestead_UCC_Care_Bridge.lean', kind: 'LeanDeclaration', description: 'L0 gate soundness' },
        { uri: 'ADR/Properties.lean', kind: 'LeanDeclaration', description: 'Property/concurrency tests' },
        { uri: 'scripts/check_adr_sorry.py', kind: 'SourceFile', description: 'Manifest-aware proof-debt gate' },
      ],
    },
    {
      id: 'ADR-0151',
      title: 'OSCAL and PrismPM Mapping and Traceability',
      status: 'Accepted',
      context: 'OSCAL provides a public grammar for compliance but alone permits silent exclusions. PrismPM provides the non-weakenable C-control baseline. Current scope is portal inventory at Modeled ceiling.',
      decision: 'Use OSCAL as filing cabinet, PrismPM as the lock. Overlay cannot exclude C-controls (C-10). Implemented/Assessed/Accepted/Certified forbidden on current inventory. 5-step traceability: Requirement → Party → Model → Subject → Evidence.',
      consequences: ['Fail-closed on weakening (F-01, F-07)', 'Visible POA&Ms for modeled-vs-deployed divergence', 'Accurate scope claims; Foundation is not one SSP', 'Certified-by-Prism and FedRAMP-ready retired', 'Advancing above Modeled requires recorded rung-change'],
      supersedes: null,
      links: [
        { uri: 'papers/OSCAL_PrismPM_Mapping_and_Traceability_v1.0.docx', kind: 'SourceFile', description: 'Source Document' },
        { uri: 'artifacts/adr/ADR-0123-OSCAL-PrismPM-Mapping.md', kind: 'SourceFile', description: 'OSCAL PrismPM Mapping ADR' },
        { uri: 'ADR/ADR_0151_OSCAL_PrismPM_Mapping.lean', kind: 'LeanDeclaration', description: 'Formal ADR definition and claim-ladder proofs' },
      ],
    },
    {
      id: 'ADR-0152',
      title: 'PIRTM and Foundry Kiln and Clay',
      status: 'Accepted',
      context: 'PIRTM is the dynamical substrate (prime-indexed tensors, contractive bounds). Foundry is the open bench. Year-one product is UCC, not PIRTM. Calling them already "uncheatable certified architecture" skips the claim ladder.',
      decision: 'Keep computational L0 (c < 1, ||G||1 < 1.0) off civic L0. Primes index primitives not members. Exact rationals at kernel boundary (ADR-001, N=1024). SIG_GOV_KILL stays WardMonitor. NODE_CAP = 12 is the halt.',
      consequences: ['Clean plane separation: computational vs civic L0', 'No vote weight from exponents', 'SIG_GOV_KILL reserved for WardMonitor', 'Float in SedonaRiskModel named as continuing defect', 'No Hall of Record until SS-001 split-ESI is built'],
      supersedes: null,
      links: [
        { uri: 'papers/PIRTM_and_Foundry_Kiln_and_Clay_v1.0.docx', kind: 'SourceFile', description: 'Source Document' },
        { uri: 'ADR/ADR_0152_PIRTM_Foundry_Kiln_Clay.lean', kind: 'LeanDeclaration', description: 'Formal ADR definition and plane-separation proofs' },
        { uri: 'Governance/ADR/accepted/ADR-0153-Phase_Mirror_Five_Step_Loop_an.md', kind: 'SpecificationDoc', description: 'Adjacent compilers ADR' },
      ],
    },
    {
      id: 'ADR-0153',
      title: 'Phase Mirror Five Step Loop and PWEH',
      status: 'Accepted',
      context: 'The five-step diagnostic loop extracts claims, maps cracks, produces levers, and asks one precision question. PWEH is a proposed receipt spine, not one coat with the Mirror.',
      decision: 'Keep five-step loop (Extract, Map, Rank, Produce, Precision Question) as diagnostic. Keep PWEH as proposed spine (PM-PWEH-001). SIG_GOV_KILL stays WardMonitor. BN254+Ed25519 labeled pre-quantum. Contractivity stays UCC.',
      consequences: ['Clean separation: Mirror (diagnostic) and PWEH (receipt) are distinct machines', 'No silent halts; SIG_GOV_KILL reserved for WardMonitor', 'BN254+Ed25519 labeled pre-quantum', 'Contractivity isolation: Mirror does not evaluate Lipschitz', 'UnsignedCrmfEnvelope remains specification draft'],
      supersedes: null,
      links: [
        { uri: 'papers/Phase_Mirror_Five_Step_Loop_and_PWEH_v1.0.docx', kind: 'SourceFile', description: 'Source Document' },
        { uri: 'ADR/ADR_0153_Five_Step_Loop_PWEH.lean', kind: 'LeanDeclaration', description: 'Formal ADR definition and loop invariant proofs' },
      ],
    },
    {
      id: 'ADR-0154',
      title: 'Phase Mirror Honesty Engine and Foundry Orchestration',
      status: 'Accepted',
      context: 'Phase Mirror is a build-time diagnostic that names dissonance and pins owners. It is not a runtime firewall, token minter, or halt mechanism. SIG_GOV_KILL stays WardMonitor. NODE_CAP = 12.',
      decision: 'Structural replacement of management: zero-boss orchestration with intent as inspectable artifact. L0/L1/L2 callable oracle tiers (100ns, 1ms, 100ms). Three-way metric card. Credits are not interest. person_id excluded from prime ledger.',
      consequences: ['Zero boss: intent decoupled from execution', 'No token politics: Phase Mirror does not mint/freeze tokens', 'Halt reservation: SIG_GOV_KILL/L0_HALT stay on their respective machines', 'Node cap integrity: NODE_CAP=12, Mirror does not raise to 27', 'Economic honesty: metric card columns do not average'],
      supersedes: null,
      links: [
        { uri: 'papers/Phase_Mirror_Honesty_Engine_and_Foundry_Orchestration_v1.0.docx', kind: 'SourceFile', description: 'Source Document' },
        { uri: 'ADR/ADR_0154_PHonesty_Orchestration.lean', kind: 'LeanDeclaration', description: 'Formal ADR definition and zero-boss proofs' },
      ],
    },
    {
      id: 'ADR-0155',
      title: 'PrismPM OSCAL Workflow Cryptographic Module',
      status: 'Accepted',
      context: 'PrismPM is the SDK and lifecycle compiler, not a GRC website or badge printer. Certified is off the lock bar (C-24). Portal inventory stays Modeled only. A crypto module is a second bounded system.',
      decision: 'Seven CLI verbs: model check, catalog pin, profile resolve, oscal export, chain show, ladder, mirror. FIPS catalogs are additive imports. prismpm export never emits Certified (F-16). Hosting provider unbound (C-11). person_id not in Hundian K.',
      consequences: ['Clean tool separation: PrismPM is the compiler, not a badge printer', 'Profile integrity: imports additive, silent deletion is F-01', 'Portal integrity: stays Modeled only until C-08/C-11 bindings', 'Economic honesty: Certified does not print from any prismpm verb', 'Node cap integrity: NODE_CAP=12, no raise to 27'],
      supersedes: null,
      links: [
        { uri: 'papers/PrismPM_OSCAL_Workflow_Cryptographic_Module_v1.0.docx', kind: 'SourceFile', description: 'Source Document' },
        { uri: 'ADR/ADR_0155_OSCAL_Workflow_Crypto_Module.lean', kind: 'LeanDeclaration', description: 'Formal ADR definition and workflow guardrail proofs' },
        { uri: 'Governance/ADR/accepted/ADR-0151-OSCAL_PrismPM_Mapping_and_Trac.md', kind: 'SpecificationDoc', description: 'Parent lock: PrismPM-BP-001, OSCAL-PM-001' },
      ],
    },
    {
      id: 'ADR-0156',
      title: 'PrismPM PIRTM Adjacent Compilers',
      status: 'Accepted',
      context: 'PrismPM (process law) and PIRTM (dynamical law) are adjacent, not fused. Both can say no, neither says yes for the other. Proof-to-Executable is a research paradigm.',
      decision: 'Keep PrismPM and PIRTM as distinct adjacent compilers. PrismPM owns F-01-F-18, PIRTM owns compile/link refuse. WardMonitor owns SIG_GOV_KILL. H2P is draft (H2P-draft). prismpm never prints Certified (F-16).',
      consequences: ['Jurisdictional integrity: four no names, one per owner', 'No false certainty: Proof-to-Executable is research paradigm', 'Envelope draft: H2P remains H2P-draft until ADR-bound', 'Open core: handwritten code ban is kiln aspiration, hundian keeps bench open', 'Portal stays Modeled only; prismpm never prints Certified'],
      supersedes: null,
      links: [
        { uri: 'papers/PrismPM_PIRTM_Adjacent_Compilers_v1.0.docx', kind: 'SourceFile', description: 'Source Document' },
        { uri: 'ADR/ADR_0156_Adjacent_Compilers.lean', kind: 'LeanDeclaration', description: 'Formal ADR definition and jurisdiction proofs' },
        { uri: 'Governance/ADR/accepted/ADR-0155-PrismPM_OSCAL_Workflow_Cryptog.md', kind: 'SpecificationDoc', description: 'Parent workflow' },
      ],
    },
    {
      id: 'ADR-0157',
      title: 'Ratify Board Resolution and Capital Authorization',
      status: 'Accepted',
      context: 'Members ratify, not a shadow board. USD 1,000,000 ceiling for Livermore parcel (resolves USD 750k/1M drift). Phase 2 barn excluded. Four doors only. Dual-control at USD 2,500.',
      decision: 'Member resolution packet (BR-CA-001). Single ceiling after drift resolved. Dual-control on every wire over USD 2,500, no closing exception. Title in association. Mandatory quarterly three-way card (dignity, outcome, solvency). Kill-switch: two consecutive fails pause draws.',
      consequences: ['Decentralized ratification: members vote after 14-day notice', 'Strict capital control: USD 2,500 dual-control, four-door funding, no exception', 'Asset protection: association title locks prevent equity extraction', 'Automated accountability: kill-switch halts on dignity/outcome failure'],
      supersedes: null,
      links: [
        { uri: 'papers/Ratify_Board_Resolution_and_Capital_Authorization_v1.0.docx', kind: 'SourceFile', description: 'Source Document' },
        { uri: 'ADR/ADR_0157_Ratify_Resolution_Capital.lean', kind: 'LeanDeclaration', description: 'Formal ADR definition and capital-control proofs' },
        { uri: 'Governance/ADR/accepted/ADR-0151-OSCAL_PrismPM_Mapping_and_Trac.md', kind: 'SpecificationDoc', description: 'Parent: OSCAL/PrismPM claim ladder' },
      ],
    },
  ],
};

export const ALL_FOUNDRY_ADRS: ADR[] = [
  ...FOUNDRY_ADR_SETS.core,
  ...FOUNDRY_ADR_SETS.governance,
];

export function countByStatus(adrs: ADR[], status: ADRStatus): number {
  return adrs.filter(a => a.status === status).length;
}

export function buildADRRegistry(adrs: ADR[]): ADRRegistry {
  const claims = adrs
    .filter(a => a.status === 'Accepted')
    .map(a => ({ owner: a.id, claim: `decision:${a.decision.substring(0, 80)}...` }));
  return { adrs, claims };
}

export const FOUNDRY_AUDIT_TRAIL: Array<{ ADR_ID: string; Action: string; Timestamp: string; Status: string; Author: string }> = [
  { ADR_ID: 'ADR-001', Action: 'Superseded', Timestamp: '2026-03-01T10:00:00Z', Status: 'Superseded', Author: 'PhaseMirror' },
  { ADR_ID: 'ADR-002', Action: 'Accepted', Timestamp: '2026-01-15T14:30:00Z', Status: 'Accepted', Author: 'Foundry Council' },
  { ADR_ID: 'ADR-003', Action: 'Accepted', Timestamp: '2026-02-01T09:00:00Z', Status: 'Accepted', Author: 'Foundry Council' },
  { ADR_ID: 'ADR-004', Action: 'Accepted', Timestamp: '2026-02-15T11:00:00Z', Status: 'Accepted', Author: 'P²C PETC Committee' },
  { ADR_ID: 'ADR-005', Action: 'Accepted', Timestamp: '2026-02-20T16:00:00Z', Status: 'Accepted', Author: 'P²C PETC Committee' },
  { ADR_ID: 'ADR-006', Action: 'Accepted', Timestamp: '2026-03-01T08:00:00Z', Status: 'Accepted', Author: 'P²C PETC Committee' },
  { ADR_ID: 'ADR-007', Action: 'Accepted', Timestamp: '2026-03-05T12:00:00Z', Status: 'Accepted', Author: 'Sharding Working Group' },
  { ADR_ID: 'ADR-008', Action: 'Accepted', Timestamp: '2026-03-10T15:00:00Z', Status: 'Accepted', Author: 'Multiplicity Team' },
  { ADR_ID: 'ADR-009', Action: 'Accepted', Timestamp: '2026-03-15T10:00:00Z', Status: 'Accepted', Author: 'SpectralGovernor' },
  { ADR_ID: 'ADR-010', Action: 'Accepted', Timestamp: '2026-03-20T14:00:00Z', Status: 'Accepted', Author: 'Foundry Council' },
  { ADR_ID: 'ADR-0013', Action: 'Accepted', Timestamp: '2026-04-01T09:00:00Z', Status: 'Accepted', Author: 'Civic Infrastructure Team' },
  { ADR_ID: 'ADR-0113', Action: 'Accepted', Timestamp: '2026-05-01T12:00:00Z', Status: 'Accepted', Author: 'UCC Integration Committee' },
  { ADR_ID: 'ADR-0151', Action: 'Accepted', Timestamp: '2026-09-17T12:00:00Z', Status: 'Accepted', Author: 'PhaseMirror Council' },
  { ADR_ID: 'ADR-0152', Action: 'Accepted', Timestamp: '2026-09-17T12:00:00Z', Status: 'Accepted', Author: 'PhaseMirror Council' },
  { ADR_ID: 'ADR-0153', Action: 'Accepted', Timestamp: '2026-09-18T12:00:00Z', Status: 'Accepted', Author: 'PhaseMirror Council' },
  { ADR_ID: 'ADR-0154', Action: 'Accepted', Timestamp: '2026-09-17T12:00:00Z', Status: 'Accepted', Author: 'PhaseMirror Council' },
  { ADR_ID: 'ADR-0155', Action: 'Accepted', Timestamp: '2026-09-18T12:00:00Z', Status: 'Accepted', Author: 'PhaseMirror Council' },
  { ADR_ID: 'ADR-0156', Action: 'Accepted', Timestamp: '2026-09-18T12:00:00Z', Status: 'Accepted', Author: 'PhaseMirror Council' },
  { ADR_ID: 'ADR-0157', Action: 'Accepted', Timestamp: '2026-09-17T12:00:00Z', Status: 'Accepted', Author: 'PhaseMirror Council' },
];
