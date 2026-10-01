**PM-KXI-005 v1.0**

**KΞ Vault production integration**

Software only. Flags may ship unpinned. Accept is not this roadmap.

| Field | Binding |
| :---- | :---- |
| Document | PM-KXI-005 v1.0 · Production integration · 27 September 2026 |
| Status | Proposed. Drafter Accept refused. Two distinct cryptographic identities required. |
| Supersedes for software | PM-KXI-002 Track A and Track C. Person acts stay on 002 and are not integration gates. |
| Parent | PM-KXI-001; PM-KXI-003; PM-KXI-004; PM-K3-001; PM-K3C-001; PM-DIGI-001 object A; uor-foundry SPEC; foundry-web SPEC; LexLean SPEC |
| In | k3-vault; KXiVault.lex.tex; LexLean; PrismPM SDK; optional View of flags; foundry-web exact consume |
| Out | R4; PIRTM-as-vault; Phase Mirror-as-runtime; Poseidon2 live; ML-KEM/ML-DSA; Kappa replica; wrappers; Operator Atlas; Accept; Week 1; funds |
| Exit | just vv green on KXiVault in prismpm.lock image. View shows cid/pinned/accept flags only. foundry-web binds exact producer digest. publicAssetOk true. |
| Not an exit | pinned=true. accept=true. K2 named. PIRTM hide. G flip. |
| Money / G | None. G=0. Production integration is not Day Zero. |
| Companion tex | artifacts/ADR\_PM\_KXI\_005\_Production\_Integration.tex |

# **0\. One sentence**

Ship the cabinet and the compiled refuse predicates. Do not ship a second person, a hide constructor, or a research router.

# **1\. Central tension**

Stated intent: production-grade integration. Operating incentive: pull PIRTM, Phase Mirror, and a person seat into the critical path so the module looks complete.

Production here means replayable producer artifacts and a View that tells the truth about vacancy. It does not mean Accept.

# **2\. Decision**

1\. Integration scope is four software objects: k3-vault, KXiVault.lex.tex, PrismPM pinned SDK, foundry-web consume.

2\. LexLean is the compiler of the module. It is not a product feature.

3\. PIRTM and Phase Mirror stay adjacent. They are not integration steps and not imports.

4\. R4 stays off this paper per PM-KXI-004.

5\. Person acts (pin, architect door, K2, Accept) are not gates on this roadmap. A View that shows pinned=false and accept=false is an allowed production state.

6\. License is NOTICE plus optional metadata per PM-KXI-003. It does not flip accept.

7\. G remains 0 after a green just vv.

# **3\. Components that ship**

| Object | Need | Pass metric |
| :---- | :---- | :---- |
| k3-vault/ | Local files \+ CLI. Already on this bench. | Directory copies. No hidden store. |
| KXiVault.lex.tex | Predicates: mayExportPreimage, isAccept, publicAssetOk, adapter\_is\_person=false, r4\_in\_kxi\_project=false. | lexlean check/build. Axioms empty or exact. |
| LexLean | Lower .lex.tex. No handwritten application Lean. | Generated Lean only. |
| PrismPM | just vv in prismpm.lock image. Adapters are tools. | vv green. No new adapter named license or hide. |
| KXiVaultView.lex.tex | Optional. Flags only. | Cannot export, store keys, or flip accept. |
| foundry-web | Exact producer digest. Pages under /foundry-web/. | Zero semantic diffs. No blobs. |
| NOTICE | Optional citation of PM-KXI-003. | Not a receipt. |

# **4\. Components that do not ship on this roadmap**

PIRTM decide. CRMF hide field. PhaseMirrorAgent.run. uor-r4-router. Poseidon2 live seal. ML-KEM transport. Electron/Snap/PWA-as-vault. Kappa replica of 049c bytes. Operator Atlas OA-ID. Certification marks as accept flags.

# **5\. Epochs**

| E | Act | Exit |
| :---- | :---- | :---- |
| I0 | This paper \+ parent locks. Done on this bench as Proposed. | Documents exist. |
| I1 | Register capability ID KXiVault on uor-foundry. Failing test. Do not implement first. | ID present. Test red. |
| I2 | Author src/Foundry/Storage/KXiVault.lex.tex. ASCII tokens. Import Identity, Authority, ObjectSpace only. | lexlean check clean. |
| I3 | Plant export-without-pin. Restore. just model-write. just vv in SDK image. | VERIFICATION record. vv green. |
| I4 | One import line in Foundry.lex.tex. No secret requested effects. | Import only. Draft-preview still not a clock. |
| I5 | Optional KXiVaultView.lex.tex. Flags: cid, pinned, pinAdr, key count, accept, licenseId. | View cannot mutate accept. |
| I6 | Authorized producer stage. foundry-web consumes exact tree digest. | publicAssetOk. No Pages blobs. |

# **6\. File scaffold**

Custody, already live on this bench.

k3-vault/vault.json

k3-vault/blobs/\<sha256\>

k3-vault/preimages/

k3-vault/receipts/

k3-vault/pins/

k3-vault/bin/k3

Producer, not yet on uor-foundry.

src/Foundry/Storage/KXiVault.lex.tex

src/Foundry/UI/KXiVaultView.lex.tex

src/Foundry.lex.tex                  \# one import after I3

NOTICE                               \# optional

tests/                               \# I1 failing scenario

prismpm.lock

lexlean.lock

Publisher.

UOR-Foundation/foundry-web           \# consume only

Forbidden paths on this roadmap.

src/Foundry/Storage/KXiVault.lean    \# handwritten

any import of uor-r4-router

any PIRTM hide field on the module

foundry-web static 049c\_text\_v1.txt

# **7\. First module skeleton**

Module Foundry.Storage.KXiVault. Glossary bool@1.1.0 and nat@1.1.0. Import Identity, Authority, ObjectSpace. Title Boolean. Public theorems noaxioms. Decide mayExportPreimage false unless acceptPath=049c and pinned and pinAdr present. Decide isAccept false when holder is vault, sameKeyboard, keys\<2, or person unnamed. Decide publicAssetOk false if private key or preimage or HMAC K present. Decide r4\_in\_kxi\_project false. Reuse DigestMismatch and MissingBlob. Do not import Finance, Learning, Brand, AIInference, Veilid, Holospaces, PIRTM, or Phase Mirror.

# **8\. Stop conditions**

Stop if a PR adds sorry, mathlib, handwritten application Lean, a secret requested effect, a foundry-web source patch, an R4 import, a PIRTM field, or treats two adapter calls as two persons.

Do not stop I6 because pinned is false.

# **9\. What this paper does not do**

Does not name K2. Does not pin 049c. Does not Accept. Does not open Week 1\. Does not move funds. Does not implement hide. Does not run Phase Mirror inside the vault. Does not put the module on uor-foundry by existing.

# **10\. Levers**

| Owner | Lever | Metric | Horizon |
| :---- | :---- | :---- | :---- |
| Model author | I1 register \+ failing test | ID present, test red | 7 days |
| Model author | I2 KXiVault.lex.tex | lexlean check clean | 7 days |
| Producer steward | I3 planted defect \+ just vv | vv green in SDK image | 7 days |
| Publisher | I6 exact consume | Zero foundry-web semantic diffs | after I3 |

# **11\. Precision question**

Is I6 allowed while pinned=false and accept=false? This paper answers yes. That is the production-honest View. Waiting for P1 would smuggle the person track back into software integration.

Production means the refuse is compiled and published. It does not mean the second chair is filled.

Status remains Proposed until two distinct cryptographic identities exist.

---

# **8\. Operational Extensions**

Adopted 27 September 2026 from `docs/Master KXi Vault ADR Blueprint.md` and bound to `PM-KXI-001` §8 and `PM-KXI-003` §8. This paper is the live production-integration ADR; the file was renamed from `ADR_PM_KXI_004_...` so that filename, declared ID, and the Blueprint's binding all agree on `PM-KXI-005`. See `PM-KXI-002` §W1 for the collision that forced this.

**Standing.** §2 decision, §3 ship list, §4 non-ship list, §5 epochs, §8 stop conditions are unchanged. §8 supplies the operational detail the Blueprint specifies. Nothing in §8 makes a person act into an integration gate — §2.5 and §11 still hold, and a View showing `pinned = false, accept = false` remains a correct exit.

**Numbering gaps.** `PM-KXI-004` is cited in the parent chain above and is absent from this corpus. `PM-KXI-006` is bound by the Blueprint's `prismpm.lock` proposal and is absent. Neither is invented. See `PM-KXI-002` §W3 and `PM-KXI-001` C-20.

## **8\.1 Extended module and test tree**

```
uor-foundry/
├── src/
│   ├── Foundry.lex.tex                        # parent index
│   └── Foundry/
│       ├── Storage/
│       │   ├── KXiVault.lex.tex               # §10 predicates
│       │   ├── KXiVaultReceipt.lex.tex        # receipt state machine
│       │   └── KXiVaultPin.lex.tex            # pin attestation
│       ├── UI/
│       │   ├── KXiVaultView.lex.tex           # read-only projection
│       │   └── KXiVaultFlags.lex.tex          # flag aggregation
│       └── Invariants/
│           ├── LayerUncollapse.lex.tex        # cross-layer isolation
│           └── TwoPersonLaw.lex.tex           # receipt law
├── tests/
│   ├── scenarios/
│   │   ├── S001_store_and_pin.lex.tex
│   │   ├── S002_receipt_two_person.lex.tex
│   │   ├── S003_refuse_single_keyboard.lex.tex
│   │   └── S004_export_gate.lex.tex
│   └── defect_plants/
│       ├── D001_flip_may_export.lex.tex
│       ├── D002_flip_is_accept.lex.tex
│       ├── D003_leak_secret_to_public.lex.tex
│       ├── D004_data_plane_accept.lex.tex
│       ├── D005_skip_receipt_transition.lex.tex
│       ├── D006_license_into_is_accept.lex.tex
│       └── D007_integrity_chain_count_only.lex.tex
├── NOTICE
├── CONFORMANCE.md
├── lexlean.lock
└── prismpm.lock
```

`src/Foundry/Invariants/`, `tests/scenarios/`, and `tests/defect_plants/` do not exist on the bench. Created at I2 and I3. Scenario and plant modules are `.lex.tex` like all producer law; there is no handwritten application Lean, per `PM-KXI-001` §12.

`D006` and `D007` are additions beyond the Blueprint. `D006` comes from `PM-KXI-003` §8.2. `D007` guards `PM-KXI-001` C-07: a chain that verifies only by count equality passes while its contents are edited. Both are recorded as extensions, not substitutions; the Blueprint's five plants are all retained under corrected names.

## **8\.2 Verification stages**

Four stages, merge gate on all-pass. Adopted from Blueprint §3.1–3.2 with C-18 applied.

| Stage | Command | Pass condition | Stop condition |
| :---- | :---- | :---- | :---- |
| 1. Scaffold | `prismpm scaffold check` | all paths match §8.1 | unknown path; missing required file |
| 2. LexLean | `lexlean check && lexlean build` | zero errors, zero warnings, zero `sorry`, zero mathlib, axiom set empty or exactly declared | any `sorry`, any mathlib import, any undeclared axiom |
| 3. Defect plant | `prismpm defect run <plant_id>` | plant is **detected**, gate goes red | plant **passes** — a verification gap, and the more serious failure |
| 4. Container | `just vv` in the `prismpm.lock` image digest | all tests green | any failure; timeout; image digest mismatch |

**C-18 applied.** Stage 4 is `just vv` *in the pinned image*. An unpinned local `just vv` is a developer run, not evidence, and the matrix must record the image digest alongside the result. A matrix row reading `{container: PASS}` with no digest is not a pass.

**Stage 3 is the stage that can fail silently.** A plant that passes is reported as failure, because a passing plant means the gate is not actually testing the property it claims. The failure modes are asymmetric and the pipeline is designed so that the quiet one is the loud one.

A plant must be *restored* after running. A planted defect left in the tree is a different defect, and `git`-free benches make that easy to miss. Restoration is a Stage 3 exit condition.

## **8\.3 Publisher surface**

```
UOR-Foundation/foundry-web/
├── pages/
│   ├── index.html              # landing, flags only
│   ├── vault-status.html       # read-only vault state
│   └── adr/
│       ├── PM-KXI-001.html
│       ├── PM-KXI-003.html
│       └── PM-KXI-005.html
├── static/
│   ├── css/
│   ├── js/vault-flags.js       # fetches flags, no mutations
│   └── assets/<asset_id>       # public assets only
├── manifest.json
└── conformance.json
```

`foundry-web` consumes a verified producer revision. No second build, no patched HTML, no second implementation. A passing HTTPS 200 is not Accept (§8 above).

| Allowed | Forbidden |
| :---- | :---- |
| display `cid`, `pinned`, `pinAdr`, `accept`, `keyCount` | display preimage contents |
| display `licenseId`, `licenseLayer` | publish `049c_text_v1.txt` |
| consume producer digest | author product semantics |
| render ADR markdown | publish HMAC K |
| static asset serving | any mutation endpoint |
| — | gate visibility on `licenseLayer` (`PM-KXI-003` C-23) |

### **8\.3\.1 Manifest, corrected**

The Blueprint's per-asset `public_ok` boolean is **self-asserted by the publisher** — the party the predicate exists to constrain. A publisher that can write `public_ok: true` has the gate it was refused. C-19.

```json
{
  "manifest_version": "1.0",
  "producer_digest": "sha256:<hash>",
  "generated_utc": "<ISO8601>",
  "assets": [
    {
      "path": "/static/css/main.css",
      "cid": "<sha256>",
      "public_ok": true,
      "public_ok_source": "producer:publicAssetOk"
    }
  ],
  "refused_assets": [
    {
      "path": "/static/preimages/049c_text_v1.txt",
      "reason": "preimage_export_refused",
      "predicate": "publicAssetOk",
      "refused_by": "producer"
    }
  ],
  "conformance": {
    "publicAssetOk": true,
    "no_secrets": true,
    "no_preimages": true
  }
}
```

Rules:

1\. `public_ok` is **producer-computed** from `publicAssetOk`. `public_ok_source` names the origin, and the publisher's conformance check rejects any asset whose source is not the producer.
2\. `refused_assets` is **not optional**. A manifest with assets and an empty `refused_assets` on a bench where a preimage exists is a publisher defect. The refusal is the evidence that the gate ran.
3\. `refused_assets` is a positive record. "We did not publish the preimage" and "we never had a preimage" are different claims and must not share an empty array.
4\. `conformance` is a digest attestation over the producer revision, not a publisher self-report.

`conformance.json` is a separate artifact from `manifest.json` because the two answer different questions: the manifest says what is published, the conformance digest says which producer revision produced it. Merging them would let a publisher assert conformance for a tree it did not build.

## **8\.4 `prismpm.lock` — additive v3 proposal**

The live lock on this bench:

```json
{
  "schema": "prismpm/sdk-lock/2",
  "sdk_image": "ghcr.io/uor-foundation/prismpm-sdk-candidate@sha256:60226bc7...0ce21",
  "sdk_version": "0.3.0",
  "standards_lock": "sha256:4396feba...00b34426",
  "platforms": [ ... ]
}
```

The Blueprint proposes `"lock_version": "2.0"` with `lexlean`, `container`, `verification`, and `bindings` blocks. **The rename is refused. C-17.** `schema` is the key the SDK reads; renaming it to `lock_version` would make the pinned SDK unable to read its own lock, and the failure would surface as an unlocked environment rather than as a schema error. A stricter gate that silently disables the tool enforcing it is worse than no gate.

Additive proposal, preserving every existing key:

```json
{
  "schema": "prismpm/sdk-lock/3",
  "sdk_image": "ghcr.io/uor-foundation/prismpm-sdk-candidate@sha256:60226bc7...0ce21",
  "sdk_version": "0.3.0",
  "standards_lock": "sha256:4396feba...00b34426",
  "platforms": [ ... ],
  "lexlean": {
    "version": "<semver>",
    "lock_cid": "<sha256>",
    "axioms": [],
    "sorry_count": 0,
    "mathlib_imports": []
  },
  "container": {
    "image": "<same digest as sdk_image>",
    "just_version": "<semver>"
  },
  "verification": {
    "stages": ["scaffold", "lexlean", "defect", "container"],
    "conformance_matrix_cid": "<sha256>",
    "last_full_pass_utc": "<ISO8601>"
  },
  "bindings": {
    "adr": ["PM-KXI-001", "PM-KXI-003", "PM-KXI-005"],
    "module_ids": ["KXiVault"],
    "layers": ["data", "control", "tooling", "publish"]
  }
}
```

Changes from the Blueprint:

| Change | Reason |
| :---- | :---- |
| `schema` retained; value `prismpm/sdk-lock/3` | C-17. Additive, consumer-readable |
| `container.image` is the same digest as `sdk_image` | Two image fields can disagree. One digest. |
| `container.digest` dropped as a separate field | It duplicated `image`; a disagreement is a lock defect |
| `bindings.adr` drops `PM-KXI-006` | C-20. No such document. A lock must not attest to a phantom ADR |
| `axioms`, `sorry_count`, `mathlib_imports` retained | L0-L evidence belongs in the lock, not only in prose |

`sorry_count: 0` in a lock is a *claim*. Stage 2 is what checks it. A lock asserting zero `sorry` on a tree that has one is a false attestation, which is why the lock records the count and the matrix records the verification, separately.

## **8\.5 Defect plant registry**

The Blueprint defines `D001`/`D002` twice with different targets: §2.1 as `flip_mayExport` and `collapse_layers`, §3.4 as `mayExportPreimage` and `isAccept`. Same IDs, different plants. C-14. Renumbered so each ID has one target.

| ID | Target | Mutation | Must be detected by | Stage |
| :---- | :---- | :---- | :---- | :---- |
| D001 | `mayExportPreimage` | set `pinned` term to `true` unconditionally | export permitted while `pinned = false` | 3 |
| D002 | `isAccept` | drop the `!sameKeyboard` conjunct | accept permitted with `sameKeyboard = true` | 3 |
| D003 | `publicAssetOk` | set `hasHmacK` term to `false` | publish permitted with HMAC K present | 3 |
| D004 | `layerUncollapsed` | make `.accept _` return `true` | data-plane accept no longer refused | 3 |
| D005 | `ReceiptState.transition` | allow `.created, .verify => some .verified` | `verified` reachable with zero signatures | 3 |
| D006 | `isAccept` | add a `licenseId` conjunct | license metadata becomes an accept gate | 3 |
| D007 | `audit/integrity.json` | verify by `op_count` equality only | edited log verifies green | 3 |

D002 is the plant that matters most. It is the direct test of `PM-KXI-001` C-01: if the two-person law were ever narrowed to the Blueprint's `k1_seated && k2_seated && signature_count >= 2`, D002 would be the only thing in the pipeline that noticed, and it would notice by going red. A pipeline whose most important plant targets a law this corpus was written to protect is the correct shape.

D005 is corrected from the Blueprint's target. The Blueprint aimed D005 at `transition` generically; the specific mutation above is the one that breaks the §8.2.4 invariant `verified_requires_signed_both`, and a plant must assert a specific counterexample rather than "something in here is wrong".

D007 is a data-plane plant but runs in Stage 3, because the check is a test and the thing tested is the vault's own audit logic. Stage 4 would also catch it; Stage 3 catches it earlier and names it.

## **8\.6 Roadmap, re-scoped to observed state**

The Blueprint's four weekly phases assume a green `lexlean` at the end of week 1. The bench has no KXiVault module at all (`PM-KXI-001` §8.7), so the phases are re-ordered by dependency rather than by calendar.

| Phase | Act | Gate | Weeks |
| :---- | :---- | :---- | :---- |
| P0 | Correct this corpus: ADR collision, §8 extensions, C-01…C-24 ledger | docs exist; no two files claim one ID | done, 27 Sep 2026 |
| P1 | Register capability ID `KXiVault`; write S001–S004 red | ID present; tests red | 1 |
| P2 | Author `KXiVault.lex.tex` with §10 predicates, §8.2.3 draft | `lexlean check` clean; zero `sorry`; axioms empty | 1–2 |
| P3 | Author `KXiVaultReceipt.lex.tex`; close transition invariants | theorem closure | 2 |
| P4 | Author `Invariants/`; plant D001–D007; all detected | Stage 3 green | 2–3 |
| P5 | `just vv` in the pinned digest; `prismpm/sdk-lock/3` | Stage 4 green with digest recorded | 3 |
| P6 | One import line in `Foundry.lex.tex` | import only; draft-preview still not a clock | 3–4 |
| P7 | `KXiVaultView.lex.tex`, optional | view cannot mutate `accept` | 4 |
| P8 | `foundry-web` consumes exact digest; manifest with `refused_assets` | `publicAssetOk`; no Pages blobs | 4–5 |

P1 writes failing tests before the module exists, per §5 epoch I1. The Blueprint's Phase 1 proposes predicate stubs; a stub that returns a placeholder is a predicate that has not been decided, and a plant run against it measures the stub. Red tests first.

P6 and P7 remain after the person track, and P8 may complete with `pinned = false` and `accept = false`. §11 answers yes to that, and §8 changes nothing about it.

## **8\.7 Metrics and thresholds**

| Metric | Target | Warning | Critical | Source |
| :---- | :---- | :---- | :---- | :---- |
| LexLean `sorry` count | 0 | >0 | >0 | Stage 2 |
| Mathlib imports | 0 | >0 | >0 | Stage 2 |
| Undeclared axioms | 0 | >0 | >0 | Stage 2 |
| Defect detection rate | 100% | <100% | <80% | Stage 3 |
| Container pass rate | 100% | <100% | <90% | Stage 4 |
| Cross-layer violations | 0 | >0 | >0 | Stage 4 |
| Public asset violations | 0 | >0 | >0 | `publicAssetOk` |
| `refused_assets` non-empty when a preimage exists | 100% | <100% | <100% | manifest |
| Plants restored after run | 100% | <100% | <100% | Stage 3 |
| Container digest recorded | 100% | — | <100% | matrix |

Two rows are additions, both guarding quiet failures:

- **`refused_assets` non-empty.** A publisher that publishes nothing and has nothing to refuse reports a clean manifest. The refusal record is what distinguishes a gate that ran from a gate that was never invoked.
- **Plants restored.** An unrestored plant leaves the tree red for the next person, or — worse — green, if the plant was the thing being fixed.

"Cross-layer violations: 0" is measured by the D004 plant and by `no_cross_layer_mutation`, not by inspection. An inspection-based count is a claim; a plant is a check.

## **8\.8 Conformance matrix output**

```json
{
  "generated_utc": "<ISO8601>",
  "overall": "PASS",
  "sdk_image": "ghcr.io/uor-foundation/prismpm-sdk-candidate@sha256:60226bc7...0ce21",
  "stages": {
    "scaffold": { "status": "PASS", "details": {} },
    "lexlean": { "status": "PASS", "sorry": 0, "axioms": [], "mathlib_imports": [] },
    "defect": { "status": "PASS", "plants": ["D001","D002","D003","D004","D005","D006","D007"] },
    "container": { "status": "PASS", "tests": "0/0", "image_digest": "sha256:60226bc7..." }
  },
  "bindings": {
    "adrs": ["PM-KXI-001", "PM-KXI-003", "PM-KXI-005"],
    "module": "KXiVault"
  }
}
```

`sdk_image` is at the top level and repeated in Stage 4. Stage 4 without a digest is not evidence — C-18. `"tests": "0/0"` is the honest value on this bench: no KXiVault scenario tests exist, so a container run today is green over zero relevant assertions, and printing `47/47` from a parent suite would be a false attestation against a gate the Blueprint itself demands be trustworthy.

## **8\.9 What this paper still does not do**

Does not name K2. Does not seat the Architect door. Does not pin `049c`. Does not Accept. Does not open Week 1. Does not move funds. Does not implement hide. Does not run Phase Mirror inside the vault. Does not put the module on `uor-foundry` by existing — the only `KXiVault.lex.tex` on this bench is a 48-line LaTeX documentation skeleton, and a documentation skeleton is not a module.

Does not make a person act an integration gate. Does not accept a stage result without a digest. Does not treat a tautology as an invariant, a signature count as a key count, a count match as a chain, or a self-asserted boolean as a predicate.

Status remains Proposed until two distinct cryptographic identities exist.