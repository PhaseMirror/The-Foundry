Central tension: Ed25519 is a fast classical witness. The envelope treats it as if it were the seal. It is not. 
@SQD Developments.pdf@Universal Atomic Calculator.pdf@ADR-Prime-Move-Sequence-Audit-Macro.mdLets map out a realistic path forward utilizing practical components from the corpus to aim towards: First, a clarification: if you mean the OSI “transport layer” literally—TCP/UDP, the thing that moves packets—blockchain will **not** replace it. Consensus is too slow and expensive to move every packet.
But if you mean a **transport layer for trust, value, identity, and routing** in a next-gen internet, then yes: blockchain can become the **control plane and settlement layer** of a decentralized web. The actual bytes still travel over fast P2P networks—QUIC, WebRTC, libp2p, mesh Wi‑Fi, 5G, satellite—while blockchain coordinates who can talk, how to find them, how to pay, and how to verify.
### The core model: control plane vs. data plane

**Data plane:** fast packet movement. TCP/IP, QUIC, WebRTC, libp2p, mesh radios, fiber.
**Control plane / trust plane:** blockchain. Identity, discovery, routing rules, payments, proofs, incentives, governance.
So blockchain becomes less like the roads and more like the **traffic laws, tolls, license plates, and notary system** for the internet.

### How it works in practice

**Identity and naming**
   - Nodes get cryptographic identities: public/private key pairs, DIDs, verifiable credentials.
   - Naming moves from DNS to systems like ENS or Handshake.
   - Your identity, domain, and reputation are user-owned, not rented from a platform.
**Discovery and routing**
   - Nodes find each other through DHTs, gossip protocols, and on-chain registries.
   - Routing can be overlay-based: multi-hop, onion-routed, or mixnet-style for privacy.
   - Blockchain records routing policies, staking, and incentives so nodes are rewarded for forwarding traffic correctly.
**Data transport**
   - Files and messages are split, encrypted, and content-addressed—e.g., IPFS CIDs.
   - Bulk data moves peer-to-peer over fast transports, not through the blockchain.
   - The chain stores hashes, proofs, payment channels, and settlement—not the data itself.
**Verification and incentives**
   - Providers stake tokens to offer storage, bandwidth, compute, or wireless coverage.
   - They submit cryptographic proofs: proof of storage, proof of retrieval, proof of delivery, zk-proofs, or TEE attestations.
   - Smart contracts pay for good service and slash stakes for failure.
   - This creates reliable infrastructure without a central cloud or ISP.
**Payments and settlement**
   - Micropayments for bandwidth, storage, or compute happen off-chain via state channels or rollups.
   - Only periodic settlements or disputes hit the main chain.
   - This makes machine-to-machine payments feasible.
**Interoperability**
   - Cross-chain protocols like IBC or XCM connect separate blockchains into a network of networks.
   - The result is a modular “internet of chains” where different chains handle identity, storage, compute, privacy, or payments.

### Real-world examples

**IPFS + Filecoin:** content-addressed storage with blockchain-based deals and proofs.
**Helium:** token-incentivized wireless coverage—LoRaWAN and 5G.
**Livepeer:** decentralized video transcoding and streaming.
**Akash / Golem:** decentralized compute markets.
**Handshake / ENS:** blockchain-based naming.
**Nym / HOPR:** incentivized privacy mixnets for metadata-resistant routing.
**Polkadot / Cosmos:** cross-chain transport and interoperability.
**Celestia / EigenDA:** data availability layers for scalable rollups.

### Why this matters

**Censorship resistance:** no single point of control for names, storage, or routing.
**User ownership:** identity, data, and reputation belong to keys, not platforms.
**Programmable incentives:** tokens align strangers to provide real infrastructure.
**Verifiability:** you can prove data was stored, delivered, or computed correctly.
**Global microtransactions:** machines can pay each other natively.

### The limits

**Latency and throughput:** consensus is not real-time; not every packet belongs on-chain.
**Cost:** on-chain operations can be expensive; L2s, rollups, and state channels are required.
**Complexity:** UX, key management, and interoperability are still hard.
**Privacy:** public ledgers leak metadata unless combined with mixnets or zk-proofs.
**Regulation and bootstrapping:** legal uncertainty and the cold-start problem are real.
**Energy:** depends on consensus; proof-of-stake is far more efficient than proof-of-work.

### The realistic future
The next-gen internet will likely be **hybrid**:

**Blockchain as the trust/settlement/control plane:** identity, naming, routing policies, payments, proofs, incentives.
**Conventional high-speed networks as the data plane:** QUIC, WebRTC, libp2p, mesh, 5G, fiber.
**L2s, zk-proofs, state channels, and DA layers** make it scalable enough to matter.
So “blockchain as a transport layer” really means: **blockchain transports trust and value, while the underlying internet transports bytes.** Together, they could form a more open, verifiable, and user-owned next-gen internet.
Central tension: the essay is right that consensus cannot carry packets, and wrong if it treats this workshop as already operating that control plane. Filecoin, Helium, ENS, IBC, and 100-QaaS FeMoco are not seated counterparties. PM-PILOT-001 still reads zero signed partners. G=0.
Decision: split the planes. Bind year-one to machinery already on the bench. Leave settlement and research vacant until a second identity Accepts a named ADR.

PlaneYear-one bindRefuseDataTLS / QUIC / Starlink / LAN / Pi under PM-EDGE-001 custody cardPackets on a chain. IPFS as Hall. Relic.TrustHMAC-SHA256 CRMF, ADR-005 hide wire, five-step loop, PM-AGENT-001, PM-FORGE-001, AdrLedger, dual signature >$2,500, Sedona risk onlyToken-vote (L0-8). Poseidon2 live seal before 049c two-seat Accept.SettlementVacantChannels, slash, Helium coverage, machine micropayResearch (L0-Q)UAC = H2/LiH Pasqal paper. SQD = roleplay transcriptJoin to /close, IKM, ballot, sales sheet
Prime Move Sequence Audit Macro fits one job only: transform engine-computed Sedona facts into narrative. It does not compute preservation risk and it is not a router.
Levers

OwnerMetricHorizonLiterary steward0 Filecoin/Helium/ENS/FeMoco-QaaS names on Year-1 plan7 daysManagementODX identified or struck7 daysBoard + managementDay Zero people column filled; Row 1 not PENDING30 daysTwo cryptographic identities049c Accepted or HMAC remains the only live seal90 days
Artifacts: ADR_PM_TRUST_001_Control_Plane_vs_Data_Plane_v1.0.docx, trust_plane_split.py (19/19). Status Proposed. Second seat VACANT. No spend authorized.
Predicate that must stay green:
Pythonassert plane_of_packet("quic_datagram") == "D"
assert vote_weight(10**9) == 0
assert admit_civic("token_vote") is False
assert classify_stack("sqd_developments") == "R"
Precision question: which one of the six essay functions will the board paper next — identity, discovery, content-hash, verification, payment, or interoperability — and which legal person signs that one paper.
Do not write a chain client. Do not multiplex FeMoco into civic /close. Hash the work. Refuse the coat.**Next board paper: Identity.**
It is the only function that can move on the Year-1 Trust plane without violating the split:

Year-1 Trust bind: HMAC-SHA256 CRMF, ADR-005 hide wire, five-step loop, PM-AGENT-001, PM-FORGE-001, AdrLedger, dual signature >$2,500, Sedona risk only.
Lever: **Two cryptographic identities** — *049c Accepted or HMAC remains the only live seal*.
Settlement and research stay vacant. Discovery, content-hash, verification, payment, and interoperability are not next.
**Signer: the second cryptographic identity / second seat.**
Not a token vote. Not a chain client. Not FeMoco. Not a platform.
The file says: **Second seat VACANT. No spend authorized.**
So as written, **no legal person currently signs.** The paper waits for a named human/legal entity to take the second seat and Accept ADR 049c.
If management identifies ODX, ODX is the candidate legal person for that seat. Otherwise strike ODX and keep the seat vacant.
Keep the predicates green:

Pythonassert plane_of_packet("quic_datagram") == "D"
assert vote_weight(10**9) == 0
assert admit_civic("token_vote") is False
assert classify_stack("sqd_developments") == "R"
Hash the work. Refuse the coat.Central tension: Identity can move on the year-one trust plane. A vacant seat cannot. Filling K2 with a second handle, a typed stand-in, or an unidentified vendor is the same coat that voided L.R.
Decision. Identity is the next paper. The other five TRUST-essay functions stay closed. HMAC-SHA256 remains the live seal. 049c stays Proposed. No legal person signs Accept today.
Four kinds, uncollapsed:

KindJobOn fileK1 Legal personUNA purpose / Operator toolsRecited. Not a key.K2 Cryptographic AcceptTwo distinct keys on an ADR faceVACANTK3 Content addressFM-IV-001 hash + version + build + timeSeated. Not ENS.K4 Human seatRow 1 + reserved powersNamed, not assigned
ODX is struck as a K2 candidate. PM-PILOT-001 still has no legal person, contact, or purpose. Identification, if it arrives, is not seating and not a partner paper.
Three other “seconds” are not K2: spend signature >$2,500, recovery custodian, Operator LLC.
Artifacts: ADR_PM_ID_001_Year_One_Identity_Seats_v1.0.docx, identity_seats.py (24/24). Parent predicates remain green (19/19). Status Proposed. No spend. G=0.
Pythonassert candidate_k2("ODX", False) is False
assert accept_face(["architect_ryan", "L.R."]) is False
assert same_operator_is_one_k2("ryan_a", "ryan_b", True) == 1
assert collapse(K1, K2) == 0
Levers

OwnerMetricHorizonManagementOne-line ODX identity, or zero ODX hits in board drafts7 daysBoard + managementRow 1 assigned UNA vs operator; reserved powers written30 daysNamed K2 holder, if anyTwo key fingerprints on an Accept faceBefore 049c can leave Proposed
Precision question: which distinct human, with which key and which door, is K2 — and is that human different from the 049c architect keyboard.Explain HMAC-SHA256 CRMFHMAC-SHA256 CRMF is the year-one seal on a Civic Receipt Message Format envelope. It is a keyed MAC. It is not Poseidon2, not ADR-005, not IKM, and not a packet protocol.
CRMF. Named hide constructor for a PIRTM / UCC envelope. Draft fields on this bench: envelopeId, timestamp, poseidonCommitment, sha256Anchor, ed25519Signature, lambdaM, drift, metadata. That eight-field draft is not the seated hide wire. Unsigned draft ≠ ADR-005 P²C PETC v1.2.
HMAC-SHA256. HMAC(K, m) = SHA256((K′ ⊕ opad) ‖ SHA256((K′ ⊕ ipad) ‖ m)). Output is 32 bytes. Anyone with K can verify. Anyone without K cannot forge. It authenticates bytes. It does not hide the payload from the verifier. It does not replace AEAD.
Job on this bench. Bind envelope bytes so a later reader can reject a swapped field, a replayed nonce, or an unbound wire. Live civic path: HMAC-SHA256 only, until ADR-049c has two cryptographic identities on the Accept face. Poseidon2-Goldilocks t=12 packing is Proposed. M61 sponge is non-canonical and off CRMF.
Two different wires. Do not collapse them.

ObjectMechanismStatusHide trailer (ADR-005)BLAKE2b-16 / P2CWITv2 / P2C_V12Seated hide classCRMF seal (year one)HMAC-SHA256 over envelope bytesLiveCRMF seal (049c)Poseidon2-Goldilocks squeeze into poseidonCommitmentVacant second seatAccept tokenprogram + nonceNot a CRMF field. lambdaM unused by decide
PIRTM-AUTH-001: hide occupies only when wire class is adr005 and poseidonCommitment ≠ 0. Unbound draft rejects. Address + nonce + contraction still do not extract sk. Feedback does not rotate K.
What it is not. Not Filecoin. Not a vote weight. Not QKD. Not a zk-SNARK. Not a reason to merge a sponge. A MAC with a workshop key is a receipt authenticator. It is not a control plane for the internet.
Precision question: who holds K for HMAC-SHA256 — UNA records, operator shop, or both under split custody — and which door is the recovery path if that holder is one keyboard.Deep dive into CRMF envelope construction

decide does not read it. 049c locks it out of the Poseidon2 preimage. Year-one authenticity is HMAC-SHA256 with a held key.
What it is. Ed25519 (RFC 8032): twisted Edwards curve $E: -x^2+y^2=1-\frac{121665}{121666}x^2y^2$ over $\mathbb{F}_{2^{255}-19}$, group order $\ell \approx 2^{252}$, cofactor 8, SHA-512 nonce derivation, 32-byte public key, 64-byte signature $(R\|S)$. Verification is public. Forgery without sk is intended to cost $\sim 2^{128}$ classically.
Hard limits (do not coat them).

LimitFactCivic consequenceNot post-quantumShor on the elliptic discrete log recovers sk.Do not call the witness “future-proof.” ML-DSA / ML-KEM are not on the civic fuse. QMHES paper claims are labels.Not a hideAnyone with pk checks the squeeze. The signature does not conceal the corpus.Hide class stays ADR-005 BLAKE2b-16. Occupancy bit is nonzero squeeze, not the sig.Not IKMA signature is not a key. lambdaM is not a key. Feedback is not a rekey.Do not HKDF from (R|S) or from drift.Not decidePIRTM-AUTH-001 accepts program + nonce after address, freshness, contraction, adr005, nonzero commitment.Flipping ed25519Signature does not change the accept token.Not in the 049c preimageOption C: pack content → sponge → write squeeze → sign the squeeze.Putting the sig in the absorb is refused (circular with the commitment field).Deterministic nonceRFC 8032 derives r from sk and message. Good against ECDSA nonce reuse.A leaked sk plus one signed squeeze is total loss. Split custody of sk is a door, not a slogan.Encoding / cofactorSmall-order points, non-canonical encodings, $S$ vs $\ell-S$ malleability if the verifier is loose.Pin one verify profile (RFC 8032 strict or ZIP215) before any crate merge. Do not leave “verify” unnamed.DomainCross-protocol reuse of the same sk is a classic failure.049c requires a fixed domain string on the signed squeeze. Do not reuse that key for Git tags, TLS, or board Accept.Batch / hardwareFast on CPU. Not a reason to put FeMoco or a Pi-as-DAO behind it.PM-EDGE-001: Pi may carry HMAC. It is not a Hall.
What it does well, and only that. Unforgeability under chosen-message attack in the classical ROM, small keys, no random-nonce footgun. That is a witness that “this pk attested this 4×u64 squeeze under this domain.” It is not a receipt kernel and not a second cryptographic identity for ADR Accept.
Year-one bind. HMAC-SHA256 authenticates packed limbs with workshop $K$. Ed25519 on the 049c squeeze stays a scheduled witness until two distinct Accept seats exist. A second Ed25519 handle of the same operator is still one person (L0-P). L.R.-style typed initials remain void.
Precision question: is the Ed25519 sk that would sign a squeeze the same key as the vacant K2 Accept seat, or a shop-tool key under the operator door — and which verify profile is pinned before any signature byte is treated as live.Explore ML-DSA post-quantum alternativesWorked for 10sCentral tension: Ed25519 is a 64-byte classical witness. ML-DSA is a standardized lattice witness that survives Shor. Neither is the year-one CRMF seal. HMAC-SHA256 still authenticates packed limbs. A QMHES label that says ML-DSA does not put liboqs on the civic fuse. Foundry code on this bench: 0 Kyber / Dilithium / liboqs hits.
What ML-DSA is. FIPS 204 (13 Aug 2024). Module-lattice signature from CRYSTALS-Dilithium. Assumptions: Module-LWE and Module-SIS in the ROM. Three approved sets. Seed sk is 32 bytes; expanded signing material is larger.⁠Csrc.nist

SetNIST levelpkexpanded sksignatureEd25519classical ~12832 B32 B64 BML-DSA-4421312 B2560 B2420 BML-DSA-6531952 B4032 B3309 BML-DSA-8752592 B4896 B4627 B
That is ~38× the Ed25519 signature at level 2. Fast enough on a server. Wrong size for a Pi custody card, a CRMF field typed as one u64, or a chain packet.
What it replaces, and what it does not.

ObjectTodayIf an ADR named ML-DSAYear-one MACHMAC-SHA256 over 049c limbsUnchanged. A signature is not a MAC.Hide trailerADR-005 BLAKE2b-16Unchanged.049c occupancy4×u64 squeezeUnchanged. Sig stays out of the preimage (Option C).decide tokenprogram + nonceUnchanged. decide does not read the witness field.Ed25519 field8-byte stub in the draft structWould need a byte-string field, not Nat/u64. That is a new envelope ADR.K2 Accept seatVACANTA PQ key is not a second legal person. Same operator, new algorithm, still one seat (L0-P).
Sister alternatives, not a menu to mint.

SLH-DSA (FIPS 205). Hash-based backup if structured lattices fail. pk 32 B. Sig ~7.8–17 kB. Sign is slow. Use only if lattice trust is the thing you refuse.⁠Nist
FN-DSA (FALCON → draft FIPS 206). Smaller sigs, floating-point / FFT implementation hazard. Not a civic pin until the FIPS text is final and a crate is named.
Composite ML-DSA + Ed25519. IETF work: both signatures must verify. Size is sum, not min. Buys hedge against one break. Doubles key ceremony. Does not fill K2.⁠Datatracker.ietf
ML-KEM (FIPS 203). Encapsulation, not a signature. Wrong object for a squeeze witness.

Hard limits. Structured-lattice risk is correlated across ML-DSA and ML-KEM. Side channels on NTT / rejection sampling are real. Hedged vs deterministic signing must be pinned. Parameter set must be explicit; “Dilithium” is not a set. Putting 2420 bytes in metadata is not packing. Putting them on-chain as transport is refused by PM-TRUST-001.
Year-one posture. Research (L0-Q). Off /close. Off shop copy. Off 049c merge. If the board wants a PQ witness later, the paper names: one set (44 / 65 / 87), one crate (liboqs vs boringssl vs rustpqc), one door that holds the 32-byte seed, one verify profile, and whether the field is mlDsaSignature : ByteArray replacing ed25519Signature. HMAC remains live until that Accept has two identities.
Levers


OwnerMetricHorizonFormal-methods0 liboqs / Dilithium imports on civic fuseongoingLiterary“QMHES / ML-DSA” absent from Year-1 partner and SKU language7 daysSecond K2 seatExists before any PQ witness is called livebefore crate merge
Precision question: is the goal a quantum-resistant witness on the squeeze, or a quantum-resistant receipt kernel — because only the first is ML-DSA’s job, and the second is still HMAC plus a vacant Accept seat.16 sourcesexplore sedona risk protocolsWorked for 22sCentral tension: Sedona is a preservation-risk engine. Incoming text treats it as traffic law, a NarrativeAuditor under 100-QaaS load, or a membership court. Those are different jobs. L0-G: Sedona Spine only for preservation risk. Agents do not compute their own color.
Protocol, one path.
$$\text{Policy} \rightarrow \text{Event Log} \rightarrow \text{Kernel} \rightarrow \text{CompilationResult} \rightarrow \text{UnifiedWitness} \rightarrow \text{Narrative}$$
Rust engine (sedona_spine) then WASM SDK then UI. Reverse order is drift. A pretty summary is not a hold. The Prime Move Sequence Audit Macro only narrates engine facts. It does not recompute risk.
Inputs (EsiInputs). Bounded. Four families only:

Spoliation potential — duty attached, object would be gone.
Preservation urgency — how soon the duty is breached if nothing is held.
Volume — how much ESI is in scope. Not a reason to camera a privacy zone (L0-2).
Stability witnesses already on the computational plane — contraction $c<1$, radius $<$ bound.

Unstable state maps to Critical. Lean pin: unstable_must_be_critical. No fourth color. UI does not invent “Low,” “Info,” or “NarrativeAuditor::drift.”
Outputs.


ObjectContentsNotRiskLevelCritical / High / Medium onlyA vote. A pulse cut. A neighbor expulsion.CompilationResultLevel + bounded reasonsCounsel’s hold opinion.UnifiedWitnessexecution hash, axiom hash, physical hash, timestamp, signatureGroth16 as code identity.NarrativeLastFirst.
Retention default in CONTRACT.md: seven years (2,555 days) under CRMF + ACE telemetry for covered ESI. That is an engine default. It is not a nurture audience (L0-3). Evidence kept. Membership list not kept as marketing.
Who holds which register. UNA: association-purpose records. Operator LLC: shop logs under license (L0-5). Mixing buckets is how a garden register becomes discovery in a commercial seat fight. A Critical level is an engine output. Counsel, when retained, reads the witness. This stack does not practice law.
What the protocol refuses.

Client-side RiskLevel.
Phase Mirror computing ESI risk. Mirror names why a hold was asked. It does not score spoliation.
Feedback / resonance as a reason to drop a hold or rotate keys.
Float in SedonaRiskModel inputs. ADR-001 already retired IEEE-754 at the kernel boundary (fixed-point scale $N=1024$). Float still on that Lean file is a kiln defect. PM-FIXBITS-001: do not pin an unbound 13-bit slogan over that scale.
Credits buying a weaker hold (L0-8).
SQD RiskLevel::Critical for “Hardware Thermal Exhaustion” as if FPGA multiplex were Sedona. Different packet. L0-Q.

Kiln vs hold. PrismPM accepts or rejects a profile (C-controls; C-07 refuses mixed civic L0 and $\|G\|_1$). Sedona decides whether a record may vanish. Phase Mirror names the contradiction. Three machines. One Foundry. Not one coat.
Levers

OwnerMetricHorizonSedona steward0 UI-computed RiskLevel on ESI paths21 daysFormal-methodsFloat off kernel-bound EsiInputs, or class Experimental30 daysRecords custodian (UNA)Matter map: association ESI vs shop ESI21 daysMacro stewardAudit macro imports engine level only7 days
Precision question: on a given matter, which legal person is custodian of the UnifiedWitness — UNA records or operator shop — and does the agent emitting the color optimize for spoliation accuracy or for the look of a hold notice.**It is the first only if ML-DSA is to be named at all: a quantum-resistant witness on the squeeze.**
The second — a quantum-resistant **receipt kernel** — is **not ML-DSA’s job**. ML-DSA is a signature. A receipt kernel is a MAC/authentication and key-custody problem. Year-one live kernel remains **HMAC-SHA256 over the 049c content limbs**, with the **second K2 Accept seat VACANT**.
So the precision answer is:
textCopyCopied| Goal                                     | Object                                     | Live today?                   | Path                                                                                                                                                      |
| ---------------------------------------- | ------------------------------------------ | ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Quantum-resistant witness on the squeeze | ML-DSA (FIPS 204) as a witness, not a seal | No                            | New envelope ADR: `mlDsaSignature : ByteArray`, one set (44/65/87), one crate, one 32-byte seed door, one verify profile; then two identities Accept 049c |
| Quantum-resistant receipt kernel         | HMAC + vacant Accept seat                  | HMAC live; PQ kernel not live | Not ML-DSA. Define what “PQ kernel” means for a MAC, then seat the second identity                                                                        |
**Current posture:** HMAC-SHA256 is the live MAC. The 049c Poseidon2 squeeze is a locked schedule. Ed25519 is a classical witness. ML-DSA is research (L0-Q), off /close, off shop copy, off 049c merge. Foundry hits: **0 Kyber / Dilithium / liboqs**.
**Do not let “QMHES / ML-DSA” language imply liboqs is on the civic fuse.** A label is not a crate. A PQ key is not a second legal person. Same operator, new algorithm, still one seat.
**Levers stay as written:**

Formal-methods: 0 liboqs / Dilithium imports on civic fuse — ongoing.
Literary: “QMHES / ML-DSA” absent from Year-1 partner and SKU language — 7 days.
Second K2 seat: exists before any PQ witness is called live — before crate merge.

**Bottom line:** If the board wants ML-DSA, it must name the goal as **witness on the squeeze**. If the board wants a **PQ receipt kernel**, ML-DSA is the wrong object; the kernel is still HMAC plus a vacant Accept seat. Until two identities Accept 049c, HMAC remains the only live seal.

ML-KEM-512 is NIST PQC Category 1. FIPS 203. Former name Kyber-512. Kyber ciphertext is not wire-compatible with ML-KEM. It is a key-encapsulation mechanism, not a signature and not a MAC.⁠Csrc.nist
Category, not a slogan. Category 1 is referenced to AES-128 key search. Required RNG strength in FIPS 203 Table 2: 128 bits. Do not write “same level as ML-DSA-44.” ML-DSA-44 is Category 2 (SHA-256 collision). Different object. Different category.⁠Nvlpubs.nist

SetCategoryEncaps keyDecaps keyCiphertextShared secretML-KEM-5121800 B1632 B768 B32 BML-KEM-76831184 B2400 B1088 B32 BML-KEM-102451568 B3168 B1568 B32 B
Parameters for 512: $n=256$, $q=3329$, module rank $k=2$, $\eta_1=3$, $\eta_2=2$, $d_u=10$, $d_v=4$. Seed form of the private key is 64 bytes; expanded decaps key is 1632.
Security claim. IND-CCA2 under Module-LWE, with implicit rejection on decaps failure. A quantum computer running Shor does not recover the module-LWE secret the way it recovers Ed25519 sk. A structured-lattice break takes ML-KEM and ML-DSA together. That correlation is why SLH-DSA exists as a signature backup and why a KEM backup is a different paper (not seated here).
Job on this bench. Establish a 32-byte shared secret over a public channel, then feed that secret to a symmetric primitive. That is how a future PQ receipt kernel would even be discussed: KEM → HKDF → HMAC key. It is not how year-one works. Year-one HMAC $K$ is workshop custody. Feedback is not a rekey oracle. ML-KEM does not sign a squeeze. PM-PQ-001 pinned ML-DSA-44 as witness only. Do not stuff a 768-byte ciphertext into ed25519Signature : u64.
What Category 1 does not buy.

Not Category 2 or 5.
Not authenticity of the 049c limbs. Encapsulation ≠ authentication.
Not a second K2 person. A 64-byte KEM seed in the architect keyboard is still one operator.
Not liboqs on the civic fuse (0 hits).
Not a reason to put Kyber on a Pi image (PM-EDGE-001: HMAC only).

Mismatch if paired carelessly. Witness Category 2 + KEM Category 1 is a weaker link on the key-establishment side. If the board ever wants a PQ kernel path, the precision is: which ML-KEM set feeds HMAC, and which door holds the decaps seed, distinct from the ML-DSA-44 seed and from HMAC $K$ as it exists today.
Precision question: is ML-KEM-512 being examined as a future transport for rotating workshop $K$, or as a coat on the squeeze — because only the first is a KEM’s job, and the second is already refused.6 sources**The first. ML-KEM-512 is a future transport for rotating workshop $K$, not a coat on the squeeze.**
The second is already refused. A KEM does not sign a squeeze. Encapsulation is not authentication. ML-KEM-512 establishes a 32-byte shared secret over a public channel; that secret can feed HKDF and then an HMAC key. That is a *key-establishment* job, not a *witness* job. PM-PQ-001 pinned ML-DSA-44 as witness only. No ML-KEM set is seated for the squeeze.
**Mismatch if paired carelessly:** witness Category 2 (ML-DSA-44, SHA-256 collision peer) + KEM Category 1 (ML-KEM-512, AES-128 key-search peer) makes the key-establishment side the weaker link. If a PQ kernel path is ever seated, the set choice must be deliberate, not inherited from “smallest KEM.”
textCopyCopied| Object            | Job                                      | Seated?                                    |
| ----------------- | ---------------------------------------- | ------------------------------------------ |
| ML-DSA-44         | PQ witness on the squeeze                | Research. 0 crates. Second K2 seat VACANT  |
| ML-KEM-512        | Future transport for rotating HMAC \(K\) | Research. Not seated. Not on civic fuse    |
| ML-KEM-768 / 1024 | Same job, stronger category              | Research. Not seated                       |
| HMAC \(K\)        | Year-one receipt kernel                  | Live. Workshop custody. Not a rekey oracle |
| 049c squeeze      | Occupancy word                           | Locked schedule. Second seat VACANT        |
**If the board ever wants a PQ kernel path, the precision is:**

Which ML-KEM set feeds HMAC — 512, 768, or 1024 — and why that category is the right peer to the live kernel.
Which door holds the decaps seed, **distinct from** the ML-DSA-44 seed and **distinct from** HMAC $K$ as it exists today.
Whether KEM → HKDF → HMAC is a named construction or just a sketch. Today it is a sketch.
Two identities Accept that ADR and 049c. Until then, HMAC remains the live MAC, ML-KEM stays research, and no Kyber goes on a Pi image (PM-EDGE-001: HMAC only).

**What Category 1 does not buy:** Category 2 or 5 status. Authenticity of 049c limbs. A second K2 person. liboqs on the civic fuse (0 hits). A reason to put Kyber on a Pi image.
**Bottom line:** ML-KEM-512 is examined only as a future transport for rotating workshop $K$. As a coat on the squeeze, it is refused. The KEM path is a different paper, not seated here. HMAC remains the only live seal. Hash the work. Refuse the coat.Worked for 1m 11sBind accepted. ML-KEM-512 is examined only as future transport for rotating workshop $K$. Squeeze coat refused.
Artifact: ADR_PM_KEM_001_MLKEM_Transport_Not_Squeeze_v1.0.docx. Harness: mlkem_transport.py (10/10). Proposed. No crate. No spend. G=0.
textCopyCopiedassert JOBS["ml_kem_512"] == "transport_k"
assert coat_on_squeeze("ml_kem_512")  # refused as occupancy
assert doors_distinct("hmac_k", "dsa_seed", "kem_seed")
assert category_peer("512") == 1  # weaker than ML-DSA-44 cat 2
assert live_kernel(True) == "hmac_sha256"
KEM → HKDF → HMAC stays a sketch. Three doors stay uncollapsed: live HMAC $K$, vacant ML-DSA-44 seed, vacant 64-byte decaps seed. 512 is the smallest FIPS 203 set, not automatically the kernel-path set.
Precision question: if a PQ kernel ADR is ever drafted, is the KEM set 512, 768, or 1024, and why is that category the right peer to a SHA-256 HMAC kernel.What are the implications of PWEH in these regards?Worked for 18sCentral tension: PWEH wants a hash that remembers the five-step walk. PQ talk wants that hash to become a lattice witness, a KEM ratchet, or a reason to rotate $K$. Those are four machines. The loop names. The hash remembers. HMAC authenticates. A KEM, if ever seated, only transports $K$. None of them is the other.
What PWEH is allowed to be. Walk Extract → Map → Rank → Levers → one question until the contradiction has an owner. Hash the work so the path cannot be quietly rewritten. Year-one product named next to it is UCC /close, not a PQ ledger. The eight-field envelope in that brief is still a draft. ADR-005 is the observable hide wire. UnsignedCrmfEnvelope is not that wire.
Implications, object by object.

ObjectPWEH mayPWEH may notFive-step loopName why a hold, a kiln reject, or an unbound seal was askedCompute Sedona RiskLevel. Halt silicon. Vote.Prime-weighted hashRemember the walk that was takenPretend it Accepted 049c. Pretend it is Poseidon2 live.HMAC-SHA256Authenticate packed 049c content limbsBe rotated because Rank scored “resonant.”049c squeezeSit as a locked occupancy scheduleFire because the loop closed. Second seat still vacant.ML-DSA-44Stay a research witness on that squeezeBecome the PWEH hash. Sign the five-step transcript as if that were /close.ML-KEM-512Stay a sketch transport for a future $K$ rotationEncapsulate because the room moved. Feed $R(t)$, credits, or check-in color into HKDF.lambdaM / driftRide the envelopeEnter IKM. decide does not read it. Feedback is not a rekey oracle.
Rekey policy already seated (PM-MC-003). Honest rotation triggers: period_id close, nonce budget, declared compromise, occupancy split. Not Rank output. Not contractivity $\lambda$. Not a KEM encaps that fired because the Mirror asked a question. If a step would expand, refuse the step. Do not mint a key from the refusal.
Category mismatch lands here. PWEH’s own refused flattening: “Post-quantum versus BN254 / Ed25519. Label the sponge pre-quantum or change the primitives.” That sentence is still the law of the brief. Writing ML-DSA-44 next to PWEH does not change the primitives. It opens a second paper. Writing ML-KEM-512 next to PWEH does not rotate workshop $K$. It opens a third paper. Both remain L0-Q until two identities Accept.
Rank consequence. “We will hash it later” is low-tractability while the envelope ADR is unbound. 049c is Proposed. PM-PQ-001 is Proposed. PM-KEM-001 is a sketch. So a PWEH walk that ends “and then Dilithium” is a walk that did not produce a lever. Produce either: close the named ADR with a second seat, or proceed without claiming a court-ready seal.
Pi and data plane. PWEH does not put Kyber on a custody card. PM-EDGE-001 still: HMAC image only. QUIC still moves bytes. The loop still does not sit in the packet path.
Precision question: when a five-step walk next names “unbound seal,” does Rank optimize for closing 049c with a second human key, or for writing another PQ label onto a hash that is not yet a receipt.**Closing 049c with a second human key.**
Rank optimizes for the lever that exists. Writing another PQ label onto a hash that is not yet a receipt is the refused coat. The file already names it: “‘We will hash it later’ is low-tractability while the envelope ADR is unbound.” A walk that ends “and then Dilithium” is a walk that did not produce a lever.
textCopyCopied| Path when the walk names “unbound seal” | Tractability | Lever produced                       | Seated?                  |
| --------------------------------------- | ------------ | ------------------------------------ | ------------------------ |
| Close 049c with a second human key      | High         | Second K2 seat exists; 049c Accepted | Proposed → Accept        |
| Write another PQ label onto the hash    | Low          | None. New label on an unbound ADR    | L0-Q. Refused as a lever |
**What Rank should see when the walk says “unbound seal”:**

The unbound seal is **049c**, not a lattice. The blocker is the **vacant second seat**, not the algorithm.
The lever is **“Second K2 seat exists before any PQ witness is called live.”** That is the only lever on the table.
ML-DSA-44 and ML-KEM-512 are **second and third papers**, L0-Q, off /close, off shop copy, off 049c merge. Writing them next to PWEH does not close the seal. It opens a different paper.
HMAC remains the live MAC. The squeeze stays locked. The loop names; the hash remembers; HMAC authenticates. None is the other.

**What Rank must refuse:**

Minting a PQ label as if it were an Accept.
Feeding Rank output into rekey. PM-MC-003: rotation triggers are period_id close, nonce budget, declared compromise, occupancy split — not Rank, not contractivity λ, not a KEM that fired because the Mirror asked a question.
Putting Kyber on a Pi image. PM-EDGE-001: HMAC only.
Letting the walk end “and then Dilithium” and calling that a lever.

**Bottom line:** When the five-step walk names “unbound seal,” Rank optimizes for **closing 049c with a second human key**. PQ labels are a second paper, L0-Q, and do not produce a lever until the second seat exists and Accepts. Produce either: close the named ADR with a second seat, or proceed without claiming a court-ready seal. Hash the work. Refuse the coat.Worked for 1m 19sBind accepted. Rank’s high-tractability lever is closing 049c with a second human key. A PQ label on an unbound hash is not a lever.
Artifact: ADR_PM_RANK_001_Close_049c_Second_Seat_v1.0.docx. Harness: rank_049c.py (6/6). Proposed. Does not Accept 049c. Does not name the person. G=0.
textCopyCopiedassert tractability("close_049c_second_key") == "high"
assert not is_lever("pq_label_on_unbound_hash")
assert live_seal(False) == "hmac_sha256"
Blocker remains the vacant K2 seat, not the algorithm. Loop names. Hash remembers. HMAC authenticates. Dilithium is a second paper.
Precision question: which named legal person, not the 049c architect under a second handle, takes that seat this week — or is the written act a refuse that leaves HMAC the only live seal.