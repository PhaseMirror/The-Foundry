# ADR-070: Pedersen H Construction Gate

- Status: **Proposed**
- Owner: multiplicity-crypto package maintainer + governance steward
- Topic: which H, on which tree, before the label "Pedersen" is earned
- Scope: cryptographic construction and labeling discipline; not a legal instrument

Foundry HEAD for this record: `cfca034cbc86c79fbeca647a95719cbe764c564e`
(ri1 Constraint/RefCell land). This record is a study note; it holds no
blinding-base claim and writes no bytes to origin.

## Definitions

`[v]G` is scalar multiplication. Pedersen commitment is

```
C = vG + rH,  dlog_G H unknown
```

A study note listing three candidate H paths is not an H. No two-base map
exists in `multiplicity-crypto` on this HEAD. No `pedersen.rs` may be shipped
in `multiplicity-crypto` until one surviving construction exists on one tree.

## Forest state (verified from tree)

| Site | What runs | Verdict |
|---|---|---|
| `packages/rust/multiplicity-crypto/rust/src/commitment.rs` | HMAC-SHA256 keyed by `PM-COMMIT-p{prime}` over `msg ‖ rand`; optional Poseidon2 squeeze. `Cargo.toml`: no `ark-bn254`. | Not a two-base map. Label formerly claimed Pedersen in `README.md`; corrected this session. No H. |
| `packages/rust/multiplicity-crypto/ts/src/commitment.ts` | Same HMAC-SHA256/SHA-256-fallback mechanism; WASM ABI name `compute_pedersen_commitment` is a legacy stub that is never reached on any build that runs. | Label corrected this session. |
| `crates/multiplicity-crypto` | Duplicate tree, reduced source (`lib.rs`, `transcript.rs` only). README carried the same false Pedersen label; corrected this session. | Second tree; must not become the canonical H home. |
| `Foundations/Projects/PERSONALIZED_MEDICINE/rust/src/pedersen.rs` | Two-base map `C = rG + vH_new`, `H_new` from try-and-increment DST `pedersen-H-v1`. | Real map, wrong house. Not `ark_bn254::hash_to_curve`, not the product module. |

Three sites, zero surviving authorities. The precision item below resolves it.

## Central tension

The word Pedersen versus the bytes that run. The module calls itself Pedersen;
the bytes are HMAC-SHA256 and Poseidon2. A HMAC tag is a keyed hash, not
`C = vG + rH`. Do not test the HMAC as Pedersen and do not label it Pedersen.

## Allowed H paths (single site, one of two)

1. **Hash-to-curve.** H produced by a frozen map on the canonical path: the
   map name, the DST, and the produced G1 bytes all live on that path and are
   recorded in this record's successor once compiled. Personalized Medicine's
   try-and-increment is not the product module's map and does not freeze here.
2. **Ceremony transcript.** Transcript bytes and the compressed H live on the
   same path, with SHA-256 of the transcript written in the constructing ADR.

## Refused path

`H = 2G` is refused. `dlog_G H = 2` is public. Then

```
C = vG + rH = (v + 2r)G
```

so openings `(v, r)` and `(v', r')` both verify iff `v + 2r = v' + 2r'`. In a
field of odd characteristic, `2` is invertible, so the committer opens to any
`v'` by

```
r' = r + 2^{-1}(v - v')
```

That is not hiding and not binding against the committer; it is a single-base
commitment relabeled in new coordinates.

## Equivocation harness (kept as the gate test)

```python
def equivocate_if_h_is_two_g(v, r, v_prime, inv2=None):
    """If H=2G, any v' is an opening. inv2 = 2^{-1} in the scalar field.
    Illustrative integer form; the field form below is the gate criterion."""
    if inv2 is None:
        raise ValueError("scalar-field inverse of 2 is required")
    r_prime = (r + inv2 * (v - v_prime))
    return (v + 2 * r) == (v_prime + 2 * r_prime)

assert equivocate_if_h_is_two_g(7, 3, 99, inv2=1) is False  # integers, 2 not inverted

def opening_equivocates_mod_p(v, r, v_prime, p):
    """Gate criterion: equality holds in F_p, p odd. inv2 = (p + 1)//2."""
    inv2 = (p + 1) // 2
    r_prime = (r + inv2 * (v - v_prime)) % p
    return ((v + 2 * r) % p) == ((v_prime + 2 * r_prime) % p)

for p in (7, 11, 21888242871839275222246405745257275088548364400416034343698204186575808495617):
    assert all(opening_equivocates_mod_p(7, 3, vp, p) for vp in range(10))
```

For H = 2G in a field of odd characteristic, the committer opens to any `v'`;

## Decision

1. Do not implement `pedersen.rs` in `multiplicity-crypto` yet.
2. Do not ship `H = 2G`.
3. Do not call the current `multiplicity-crypto` commitment Pedersen. The
   label corrections in `README.md` (both trees) and `ts/src/commitment.ts`
   land this HEAD.
4. Choose one tree. Canonical path: `packages/rust/multiplicity-crypto`
   (full source lives there; `crates/multiplicity-crypto` is a thin
   duplicate and is not the H home).
5. Personalized Medicine's map either points at the canonical path or is
   renamed so it is not presented as the product module's Pedersen. It is a
   third row until a frozen H exists on the canonical path.

## Precision answer

The next artifact is a **single-site H spec** (frozen DST and produced G1
bytes, or ceremony transcript SHA and produced G1 bytes) under
`packages/rust/multiplicity-crypto` — not a `pedersen.rs` that multiplies one
generator and files it as Pedersen. The G1 bytes column is **pending**, not
claimed; this record commits to no concrete point until a real construction
compiles and runs on the canonical path.

## Levers

| Owner | Lever | Metric | Horizon | Status |
|---|---|---|---|---|
| Package maintainer | Label match | README (both trees) and `commitment.ts` name HMAC/Poseidon2, not Pedersen | 7 days | Corrected on this tree |
| Same | Dual tree | one canonical path: `packages/rust/multiplicity-crypto` | 30 days | Path chosen; no code moved |
| Same + governance steward | H spec | DST + G1 bytes, or transcript SHA + G1 bytes, on the canonical path | no calendar | Open; bytes pending |
| Governance steward | Anti-2G | zero commits that set `H = [2]G` | immediate | Enforced by this gate |
| Governance steward | Gate test | `equivocate_if_h_is_two_g` lives next to the construction | 30 days | Harness recorded |

## Open items

- `templateArxiv.tex` still labels the module "Pedersen" with a
  "wrong curve (secp256k1)" placeholder caveat; it is a paper draft, self-marked
  Placeholder, and is out of scope for the label lever. Re-reviewed at H-spec
  promotion.
- The `compute_pedersen_commitment` WASM ABI name survives only as a stub; it
  must be renamed or removed when the H spec lands.