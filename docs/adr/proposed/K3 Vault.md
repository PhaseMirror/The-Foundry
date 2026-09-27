**K3 vault: artifact spec, v0.1.** Local notes vault on device you control. Content-address layer. Not K2. Not an Accept. Not a login box.

## What the vault is

A local-first store of documents whose **content** is committed by hash. Each entry is a `(docBytes, cid, timestamp, label)` tuple. The vault does not sign. It does not hold a civic seat. It holds bytes and their content addresses so the walk can be remembered and not quietly rewritten.

| Layer | What it is | Where it lives |
|---|---|---|
| K3 vault | Content address of document bytes | Local device. No key custody. |
| K2 seat | Signing keypair held by a named other person | Second device, second person |
| HMAC \(K\) | Workshop custody. Live MAC over 049c limbs | Year-1 Trust-plane keyholder |
| 049c squeeze | Locked schedule. Occupancy word | Proposed. Second seat vacant |

The vault is **step 1** of the governance-compatible start. It is not step 4. It cannot Accept 049c.

## What the vault may do

| Action | Allowed | Notes |
|---|---|---|
| Hash a document | Yes | FM-IV-001 / K3. Address changes if document changes. |
| Store the hash and the doc | Yes | Local. No PII in `metadata`. No `person_id` in \(K\). |
| Display the hash | Yes | As a content commitment of a document, not a dossier. |
| Export the hash for a second person to sign | Yes | The second person signs **the same digest**. |
| Prove the document is unchanged | Yes | Recompute; compare. That is the whole proof. |
| Refuse to store foreign passwords | Yes | Do not put foreign credentials in this stack. |

## What the vault may not do

| Refusal | Reason |
|---|---|
| Accept 049c | Self-Accept. Same operator, new hash, one person. |
| Serve as a login secret | Knowledge of a reproducible string is not authentication. HMAC needs a key that is not the message. |
| Hash age/gender/location as identity | PII commitment, not a civic seat. L0-3: `person_id` stays out of \(K\) and the public seal. |
| Put Kyber or Dilithium on first button | PM-EDGE-001: HMAC image only. PQ is L0-Q. |
| Rotate workshop \(K\) because a doc changed | PM-MC-003: rotation triggers are `period_id` close, nonce budget, declared compromise, occupancy split. Not a vault event. |
| Feed vault output into IKM or `decide` | `lambdaM` / drift ride the envelope. `decide` does not read them. Feedback is not a rekey oracle. |

## How the vault connects to Accept without collapsing into it

1. **Vault hashes the 049c text.** Produces digest \(d\).
2. **Vault exports \(d\)** — not the whole dossier, just the digest and the named document.
3. **Named other person signs \(d\)** with their K2 key on their own device. Second device, second person, second key.
4. **Two signatures on one digest.** Architect key + second key. That is Accept. A QR of your birthday is not.
5. **Vault records the Accept** as a receipt entry: digest \(d\), two public keys, timestamp. The vault does not hold either secret.

The vault is the **memory** of the walk. The second hand is the **Accept**. Neither is the other.

## Scoring under A (refuse-a-bind)

| Ticket | Compiles? | Second identity can refuse? | In scope? |
|---|---|---|---|
| Vault hashes a doc | Yes | N/A — no bind | Yes, K3 |
| Vault exports digest for signature | Yes | Yes — second person can refuse to sign | Yes |
| Vault self-signs the digest | Yes | No — same keyboard | **Refused** |
| Vault accepts 049c alone | Yes | No — one person | **Refused** |
| Vault stores foreign passwords | Yes | No — wrong object | **Refused** |
| Vault feeds Rank output into rekey | Yes | No — not a trigger | **Refused** |

A job that cannot be refused by a second cryptographic identity is out of scope even if it compiles. The vault compiles. The Accept does not, until the second hand exists.

## What the vault does not do

- Does not name K2. PM-K2-001 line stays non-vacant only when a legal person signs.
- Does not Accept 049c. 049c stays Proposed.
- Does not evidence any Day Zero row. ev(c)=1 still needed for authority, scope, public facts, capacity, custody, pilot.
- Does not open Week 1.
- Does not move funds. G=0.
- Does not put Poseidon2 live. Zero live-seal sites.
- Does not turn A into permission to ship surfaces. A is a lock, not a ship order.

## Levers

| Owner | Lever | Metric | Horizon |
|---|---|---|---|
| You / K1 | Vault exists; hashes a named doc; exports digest | One local vault, one digest, zero foreign passwords | 7 days |
| Inventor + named other | Legal name of the person who can refuse | PM-K2-001 line non-vacant. Not L.R. Not architect-phone. | 7 days |
| Device steward | One local keypair for the vault's own display identity | Separate from K2 seat and from HMAC \(K\) | 7 days |
| Civic fuse steward | HMAC-only CRMF | Zero Poseidon2 live-seal sites | Until K2 Accepts 049c |

## Precision question

Does the vault's first artifact hash **the 049c text** as the named document for a future Accept, or does it hash **a personal note** that has no Accept path — because only the first produces a digest the second hand can sign, and the second produces a diary line that expires when you walk across the room.