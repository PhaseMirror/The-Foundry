**PM-KXI-003 v1.0**

**Prime Materia License on KΞ Vault**

NOTICE and entry metadata. Not Accept. Not K2. Not a hide field.

| Field | Binding |
| :---- | :---- |
| Document | PM-KXI-003 v1.0 · Prime Materia License on KΞ Vault · 27 September 2026 |
| Status | Proposed. Drafter Accept refused. Two distinct cryptographic identities required. |
| Instrument named | Prime Materia Open Commons and Bound Works License v1.0 (shop short name: Prime Materia Commons License). Source observed: Citizen Gardens LICENSING-POLICY.md v1.1, April 2026\. |
| Parent | PM-KXI-001; PM-KXI-002; PM-K3-001; PM-TRUST-001; PM-DIGI-001 object A; L0-8; L0-F; L0-P; GV-501-001 |
| Does not bind | Operator Atlas as year-one civic registry; Certification Marks as receipt flags; 501(c)(3) present-tense recital; 049c Accept; Week 1; funds |
| Money / G | None. G=0. A license field is not a clock. |
| Live MAC | HMAC-SHA256 workshop K. Unchanged. License text is not K. |
| Harness | artifacts/kxi\_license.py |
| Second seat | VACANT. 09:22 refuse stands. |

# **0\. One sentence**

The Prime Materia License may label KΞ objects. It may not Accept them. A NOTICE is not a second hand.

# **1\. Claim, reflected without endorsement**

Inventor claim: integrate the Prime Materia Commons License into the KΞ Vault architecture so custody, publication, and reuse sit under one house instrument.

Operating incentive already seated: treat a license string as if it seated K2, opened export, or made PIRTM the vault. Intent is clean provenance. Incentive is substitution.

# **2\. Central tension**

Copyright hygiene versus two-person receipt law. The policy’s three layers (substrate / registry / marks) are not the vault’s three layers (data / control / tooling). Homophones across those six words do not join them.

Secondary tension: LICENSING-POLICY.md recites Multiplicity Foundation, Operator Atlas, and a 501(c)(3) money layer. GV-501-001 forbids present-tense 501(c)(3) until a determination letter exists. This paper maps objects. It does not grant the letter.

# **3\. Decision**

1\. Short name Prime Materia Commons License refers to Prime Materia Open Commons and Bound Works License v1.0 as described in LICENSING-POLICY.md v1.1. The policy is not itself the license text. Bytes of the license, when stored, take a cid like any other note.

2\. License is an attribute of an object. It is not a control-plane predicate. mayExportPreimage and isAccept do not read licenseId.

3\. Allowed on an Entry: licenseId (token), licenseCid (sha256 of stored license bytes), licenseLayer (substrate | bound\_work | tooling | docs | marks | third\_party | none).

4\. Forbidden: licenseId flipping accept; Certification Marks as accept flags; Operator Atlas OA-ID as K2; Bound Works Mark License as HMAC K; Part II public-domain pledge as a PIRTM join.

5\. Year-one civic map for KΞ objects follows §4. It does not import Operator Atlas, Certification Tiers, or AGI-OS Community/Pro gates.

6\. Storing the license text in k3-vault is allowed with acceptPath=none. Publishing that text on foundry-web is allowed only as a NOTICE citation, not as 049c bytes.

7\. A Maker’s own license on a third-party blob stays the Maker’s. The vault records it. The vault does not rewrite it.

# **4\. Object map onto the policy, civic-constrained**

| KΞ object | Policy row used | Year-one civic note |
| :---- | :---- | :---- |
| Constitutional math named in Part II (if later cited) | Part II ΛProof Pledge / public domain | Citation only. Not imported into KXiVault.lex.tex. L0-F holds. |
| k3-vault CLI \+ directory format | Tooling (Apache 2.0 in the policy table) | Implementation. Not Accept. Not a mark. |
| KXiVault.lex.tex \+ generated Lean | Open: tooling vs Bound Work. See §14. | Predicates are civic law text. License of the file is not the law. |
| AGENTS\_Prism\_Vault.md and this ADR | Documentation default CC BY-SA 4.0 in the policy table | Shop papers. Proposed. Not Accepted 049c. |
| 049c\_text\_v1.txt | Named instrument under ADR-049c. Not a license class. | acceptPath=049c. License field optional. Pin is still P1. |
| Occurrence notes / personal docs | Maker’s license or none | acceptPath=none. Export stays refused until pin+path rules. |
| foundry-web View flags | Publisher consume-only | May show licenseId. May not host HMAC K or preimages. |
| Citizen Gardens Verified / OEM Certified | Part VII marks | Refused as receipt flags. Marks are not accept. |
| Operator Atlas OA-ID | Part III registry | Unjoined year one. Do not require an OA-ID to add a blob. |

# **5\. Architecture slot**

Data plane: optional licenseCid pointing at blobs/\<sha256\> of the license bytes. Control plane: licenseId and licenseLayer are display metadata. Tooling: NOTICE file beside KXiVault.lex.tex when the producer module exists.

PrismPM does not grow a license adapter. Phase Mirror does not treat a missing NOTICE as stopLlmPath. PIRTM does not grow a license field on CRMF. Feedback still is not a rekey oracle.

# **6\. Predicates**

licenseDoesNotAccept(licenseId, accept) holds when accept is computed only from holder, distinctKeys, sameKeyboard, signs049c, personNamed.

marksAreNotReceipt(mark) is true for Verified and OEM Certified: those strings never set accept.

publicAssetOk remains: no private key, no unsigned Accept preimage, no HMAC K. A public-domain or CC license text may be a public asset.

atlasNotRequired(entry) is true: add and hash succeed with oaId \= null.

# **7\. What this paper does not do**

Does not publish the full license as civic law. Does not Accept 049c. Does not name K2. Does not open Week 1\. Does not move funds. Does not recite a determination letter. Does not seat Operator Atlas. Does not make Part II a PIRTM import. Does not choose tooling vs Bound Work for KXiVault.lex.tex.

# **8\. L0 collisions named**

L0-8: a license tier is not a vote. Credits still buy zero votes.

L0-P: two legal persons remain required to Accept. A NOTICE signed by K1 is one person.

L0-F: Operator Atlas, Certification Tiers, and AGI-OS Community/Pro gates stay off the year-one vault module.

L0-Q: MultiplicityFoundation/PIRTM as named in the policy header is not the seated civic PirtmAuthBoundary.

GV-501-001: 501(c)(3) language in the policy is a constraint claim, not a present-tense status on this paper.

# **9\. Sequence**

1\. Optional: add license text to k3-vault with acceptPath=none. Record cid.

2\. When E2 lands, put NOTICE next to KXiVault.lex.tex naming PM-KXI-003 and the policy cid if pinned later.

3\. Do not block E1–E3 on a license field.

4\. Pin of 049c remains P1 on PM-KXI-002. License metadata is not that pin.

# **10\. Levers**

| Owner | Lever | Metric | Horizon |
| :---- | :---- | :---- | :---- |
| Model author | licenseId is metadata only in any E2 draft | isAccept ignores licenseId | E2 |
| Vault steward | Optional store of license bytes, acceptPath=none | cid present, export still refused | 7 days |
| Architect | Pick tooling vs Bound Work for KXiVault.lex.tex | Written choice on this paper’s §14 or a dated refuse | 7 days |
| Publisher | View may show licenseId; no marks-as-accept | publicAssetOk true | E6 |
| K2 when seated | Does not sign a license NOTICE as if it were 049c | Domain remains PM-K2-ACCEPT-v1 | after P3 |

# **11\. Precision question**

Is src/Foundry/Storage/KXiVault.lex.tex tooling under Apache 2.0, or a Citizen Gardens Bound Work under the policy’s CC BY-NC-ND default?

Tooling maximizes reuse of the predicates as text. Bound Work \+ NC-ND blocks commercial productization of the module file itself and requires a Declaration of Formation the year-one vault does not implement.

Both are honest. This paper records the fork and does not pick. A pick is a later dated line. It is not Accept of 049c.

A license labels a cabinet. It does not sit in the second chair.

Status remains Proposed until two distinct cryptographic identities exist.

---

# **8\. Operational Extensions**

Adopted 27 September 2026 from `docs/Master KXi Vault ADR Blueprint.md` and bound to `PM-KXI-001` §8. This paper's §6 predicates are unchanged. The Blueprint proposed no license field, so nothing here is a narrowing of a control-plane gate; the work is placing license metadata correctly inside the operational layer the Blueprint specifies.

**Standing.** §6 is law. §8 says where license attributes sit in the new schemas and which proposed placements are refused. A license labels a cabinet. It does not become a second, weaker export door.

## **8\.1 License fields in the data plane**

`PM-KXI-001` §8.1.2 fixes the preimage schema. §3.3 permits `licenseId`, `licenseCid`, and `licenseLayer` on an Entry. Corrected placement:

```json
{
  "preimage_id": "<uuid>",
  "cid": "<sha256>",
  "domain_separator": "PM-K2-ACCEPT-v1",
  "canonical_name": "049c_text_v1.txt",
  "licenseId": null,
  "licenseCid": null,
  "licenseLayer": "none",
  "pinned": false,
  "export_eligible": false,
  "hmac_k": null,
  "signature_k1": null,
  "signature_k2": null
}
```

`licenseCid` points at `blobs/<sha256>` holding the license bytes, stored with `acceptPath = none` per §3.6. Three placement rules:

1\. **License fields are not in `binding`.** `binding` holds `adr`, `receipt_required`, `k2_seat_required`, and `architect_seat_required`. Those are gates. A license is an attribute. Mixing them invites a reader to treat a present `licenseId` as a satisfied `binding` term.

2\. **`licenseLayer` defaults to `none`,** not to `docs`. Defaulting a Maker's blob to a license class asserts a term the Maker did not choose. §3.7: a Maker's own license on a third-party blob stays the Maker's; the vault records it, the vault does not rewrite it. A default is a rewrite.

3\. **`licenseCid` is a content address like any other.** Storing the license text in `k3-vault` is allowed with `acceptPath = none`, and export of those bytes stays refused until pin plus the path rules. A license is not a secret and is not a preimage, so `publicAssetOk` does not refuse it — but that is a separate decision from export eligibility, which is computed by `mayExportPreimage` on the blob's own state.

## **8\.2 License fields in the control plane**

`licenseDoesNotAccept(licenseId, accept)` from §6 becomes structurally checkable, not merely asserted:

```
isAccept does not read licenseId, licenseCid, or licenseLayer.
```

The proof obligation is a non-dependence, and the honest form of it in a closed module is that the two predicates share no field:

```lean
def isAccept (v : VaultState) : Bool := ...   -- §10 form, no license term

theorem license_does_not_accept (a : Asset) (v : VaultState) :
    isAccept v = isAccept v := rfl
```

The reflexivity form is deliberate. A `rfl` theorem is the weakest true claim available and is the only form that survives an honest reading of "these two fields are unrelated": if a future edit adds a license term to `isAccept`, this theorem still compiles, because it says nothing. So `rfl` is **not** the right instrument here, and recording it as the guard would be the same defect as `PM-KXI-001` C-10 in a new costume. The real guard is not a theorem. It is:

- the field separation in §8.1, so no license term is in scope of the vault state, and
- a defect plant, `D006`, that injects `licenseId` into `isAccept` and must fail Stage 3.

A structural separation verified by a plant beats a tautology verified by `rfl`. Recorded rather than papered: the blueprint offered no license plant, and this paper adds one.

`marksAreNotReceipt(mark)` stays true for `Verified` and `OEM Certified` per §6. `atlasNotRequired(entry)` stays true: add and hash succeed with `oaId = null`, and no license field creates an Operator Atlas dependency.

## **8\.3 NOTICE in the producer tree**

`PM-KXI-005` §8 places `NOTICE` in the module tree, beside `KXiVault.lex.tex`, at epoch E2 per §9 step 2. It cites this paper and the `licenseCid` for the license bytes if those bytes are later pinned.

`NOTICE` is not a receipt. It is not a signature. It is not a seat. §7 stands: a license field is not a clock, and G stays 0.

## **8\.4 License fields on the publisher surface**

`foundry-web` may display `licenseId` and `licenseLayer` — display metadata on a flag row. It may not:

| Forbidden on the publisher | Why |
| :---- | :---- |
| Render `licenseCid` as a fetchable blob path | Turns metadata into a second store, §5 |
| Render Certification Marks as accept flags | §3.4, §6, L0-8 |
| Host license text as if it were `049c_text_v1` | §3.6 |
| Require an OA-ID to list an asset | §3.4, `atlasNotRequired` |
| Gate an asset on `licenseLayer` | A license is not a control-plane predicate, §3.2 |

That last row matters most. `licenseLayer` is display. If the publisher hides an asset because `licenseLayer` is `third_party`, the publisher has made a license class into an export gate — the substitution §2 names. A Maker's licensed blob is still hashable, storable, and displayable; the vault records the license, it does not enforce it.

## **8\.5 Blueprint items touching this paper**

| ID | Item | Verdict |
| :---- | :---- | :---- |
| A-23 | Preimage schema field set (`PM-KXI-001` A-03) | Corrected; license fields added at §8.1, placement rules 1–3 |
| A-24 | `manifest.json` `refused_assets` | Accepted. This is the honest place to record a refused license publication, `PM-KXI-005` §8.3, C-19 |
| A-25 | Publisher may display `licenseId` | Accepted, with §8.4's six prohibitions |
| A-26 | No license adapter in PrismPM | Confirmed. §5 stands |

- **C-21** A license field inside `binding` would sit among gate terms. Separated, §8.1 rule 1.
- **C-22** `licenseLayer` defaulting to `docs` asserts a Maker's license choice. Default is `none`, §8.1 rule 2.
- **C-23** Publisher gating visibility on `licenseLayer` promotes metadata to a control predicate. Forbidden, §8.4.
- **C-24** An `rfl` "non-dependence" theorem compiles whether or not license terms leak into `isAccept`. Replaced by a defect plant, `D006`, §8.2.

## **8\.6 Status of this paper after §8**

Unchanged. The §11 precision question is still unanswered: whether `src/Foundry/Storage/KXiVault.lex.tex` is Apache 2.0 tooling or a Citizen Gardens Bound Work is a choice for the Architect, and §8 does not make it. A `NOTICE` that names an undecided license is a defect; a `NOTICE` that names a decision nobody made is worse.

Nothing here Accepts `049c`. Nothing here names K2. Nothing here opens Week 1. Nothing here moves funds. G=0.

Status remains Proposed until two distinct cryptographic identities exist.