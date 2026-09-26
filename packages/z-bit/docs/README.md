# Bitcoin Taproot Anchor Implementation

This directory contains the implementation of the Bitcoin Taproot anchor system for Lambda-Proof, including descriptor-friendly commitment leaves that are compatible with Bitcoin Core v26+.

## Overview

The Taproot anchor system allows Lambda-Proof to commit batches of receipts to Bitcoin using Taproot's flexible script tree capabilities. This implementation uses:

- **Miniscript-compatible Taproot descriptors** for Bitcoin Core v26+ support
- **Soft reveal mechanism** to prove commitment without spending
- **Two-leaf tree structure**: commitment leaf + refund leaf
- **Regtest-ready scripts** for local testing

## Directory Structure

```
bitcoin/
├── schemas/              # JSON Schema definitions (Draft 2020-12)
│   ├── receipt.schema.json
│   ├── batchheader.schema.json
│   └── anchorproof.schema.json
├── scripts/              # Automation scripts
│   ├── anchor_regtest.sh             # Regtest PSBT creation
│   └── compute-control-block.js      # Control block computation
└── docs/                 # Documentation
    └── README.md         # This file
```

## 1. Taproot Descriptors

### 1.1 Anchor UTXO Descriptor

The anchor UTXO uses a two-leaf Taproot tree:
- **Commitment leaf**: `sha256(ANCHOR_ROOT_HEX)` - proves batch commitment
- **Refund leaf**: `and_v(v:older(6),pk(ADMIN_XONLY))` - allows admin recovery after 6 blocks

**Descriptor format:**
```
tr(I_XONLY,{sha256(ANCHOR_ROOT_HEX),and_v(v:older(6),pk(ADMIN_XONLY))})
```

**Parameters:**
- `I_XONLY`: 32-byte x-only pubkey of aggregator hot key (hex)
- `ADMIN_XONLY`: 32-byte x-only pubkey of admin key (hex)
- `ANCHOR_ROOT_HEX`: 32-byte anchor_root (hex, no 0x prefix)

**Notes:**
- Import a new descriptor for each batch because `ANCHOR_ROOT_HEX` changes per batch
- This format is valid Miniscript-in-Taproot; Bitcoin Core v26+ can track and sign
- Core computes the checksum automatically via `getdescriptorinfo`

### 1.2 Treasury/Vault Example (Optional)

For hot/cold wallet configurations with escrow:

```
tr(HOT_XONLY,andor(pk(HOT_XONLY),and_v(v:older(144),pk(COLD_XONLY)),pk(ESCROW_XONLY)))
```

This provides:
- Immediate hot key spending via key-path
- Cold key access after 144-block timelock
- Break-glass escrow option

## 2. Regtest PSBT Script

The `anchor_regtest.sh` script automates the creation of Taproot anchor outputs on Bitcoin regtest.

### Prerequisites

- Bitcoin Core (regtest mode)
- `bitcoin-cli` in PATH
- `jq` for JSON parsing
- `bc` for arithmetic

### Usage

```bash
# 1. Edit the script to set your keys
export I_XONLY="your_internal_key_hex"
export ADMIN_XONLY="your_admin_key_hex"
export ANCHOR_ROOT_HEX="your_anchor_root_hex"

# 2. Run the script
bash bitcoin/scripts/anchor_regtest.sh
```

### What It Does

1. Creates/loads two wallets: `funder` and `anchor`
2. Mines 101 blocks to fund the funder wallet
3. Builds the Taproot descriptor with checksum
4. Imports the descriptor into the anchor wallet
5. Derives the P2TR address
6. Funds the anchor output with 400 sats (above dust threshold)
7. Mines the transaction
8. Outputs the AnchorProof components for soft reveal

### Output Example

```
Anchor P2TR address: bcrt1p...
Funding txid: abc123...
AnchorProof (soft reveal inputs you will ship alongside batch metadata):
  txid: abc123...
  vout: 0
  scriptPubKey(bech32m): bcrt1p...
  leafScriptHex (commit leaf): 0a20cccc...88a9
  controlBlock: (compute off-chain; see Node snippet)
```

## 3. Control Block Computation

The `compute-control-block.js` script generates the control block for the commitment leaf.

### Prerequisites

```bash
npm install tapscript
```

### Usage

```bash
# Set environment variables
export I_XONLY="aaaa..."
export ADMIN_XONLY="bbbb..."
export ANCHOR_ROOT_HEX="cccc..."

# Run the script
node bitcoin/scripts/compute-control-block.js
```

### Output

```json
{
  "controlBlock": "c0aaaa...",
  "outputKey": "tweaked_key_hex"
}
```

The control block is required for:
- Soft reveal proof verification
- Spending via the commitment leaf (if needed)

### How It Works

1. Creates leaf A: `OP_SHA256 <H> OP_EQUAL` (commitment)
2. Creates leaf B: `OP_CHECKSEQUENCEVERIFY 6 OP_DROP <ADMIN> OP_CHECKSIG` (refund)
3. Builds a balanced two-leaf tree
4. Computes the control block for leaf A
5. Outputs the tweaked output key for verification

## 4. JSON Schemas

All schemas follow JSON Schema Draft 2020-12 specification.

### 4.1 Receipt Schema

**File:** `schemas/receipt.schema.json`

A receipt represents a user's proof of computation with anchor reference.

**Required fields:**
- `version`: Integer (must be 1)
- `user_pub`: Hex string (66 or 64 chars) - user's public key
- `state_root`: Hex string (64 chars) - state commitment
- `timestamp`: Integer ≥ 0 - Unix timestamp
- `policy_id`: Hex string (64 chars) - policy identifier
- `anchor_txref`: String - Bitcoin transaction reference
- `sig_alg`: String - signature algorithm (currently "ML-DSA")
- `sig`: Hex string - signature bytes
- `sig_pub`: Hex string - public key for signature verification

**Optional fields:**
- `meta`: Object with string key-value pairs

### 4.2 BatchHeader Schema

**File:** `schemas/batchheader.schema.json`

Batch header contains metadata for a batch of receipts.

**Required fields:**
- `version`: Integer (must be 1)
- `network_id`: Integer (0=mainnet, 1=testnet, 2=signet, 3=regtest)
- `epoch`: Integer ≥ 0 - floor(unix_time / (T*60))
- `policy_id`: Hex string (64 chars)
- `aggregator_xonly`: Hex string (64 chars) - aggregator's x-only pubkey

### 4.3 AnchorProof Schema

**File:** `schemas/anchorproof.schema.json`

Soft reveal bundle for proving commitment without spending.

**Required fields:**
- `txid`: Hex string (64 chars) - transaction ID
- `vout`: Integer ≥ 0 - output index
- `scriptPubKey`: String - P2TR address (bech32m)
- `leafScriptHex`: Hex string - commitment leaf script bytes
- `controlBlock`: Hex string - Taproot control block

## 5. Hashing Algorithms

The anchor system uses tagged SHA-256 hashes for domain separation.

### Receipt Hash

```
H_r = SHA256(tag("LP/REC/v1") || CBOR(Receipt_without_sig))
```

Where `tag(x)` is the BIP-340 tagged hash:
```
tag(x) = SHA256(SHA256(x))
```

### Merkle Root

```
merkle_root = Merkle(H_r[0..n])
```

Standard binary Merkle tree with SHA-256.

### Batch Header Hash

```
batch_header_hash = TaggedHash("LP/BATCH/v1", encode(BatchHeader))
```

### Anchor Root

```
anchor_root = TaggedHash("LP/ANCHOR/v1", merkle_root || batch_header_hash)
```

This `anchor_root` is the 32-byte value committed in the Taproot commitment leaf.

### Security

- All hashes are 256-bit (32 bytes)
- Tagged hashes prevent cross-protocol attacks
- ≥256-bit security target maintained

## 6. Epoching Defaults

Default parameters for regtest:

- **Epoch period (T)**: 10 minutes
- **Epoch calculation**: `epoch = floor(unix_time / 600)`
- **Min batch size**: 100 receipts
- **Max latency**: 60 minutes
- **Finality depth (d)**: 1 block on regtest

### Triggering Anchor Creation

An anchor is triggered when:
- Batch contains ≥ 100 receipts (min_batch), OR
- Time since first receipt ≥ 60 minutes (max_latency)

Mark as confirmed at depth d=1 on regtest.

## 7. Soft Reveal

The soft reveal mechanism allows proving the commitment without spending the UTXO.

### Components

1. **Transaction reference**: txid + vout
2. **Leaf script**: `OP_SHA256 <ANCHOR_ROOT> OP_EQUAL`
3. **Control block**: Proves leaf is part of the Taproot tree

### Verification Process

1. Observer receives AnchorProof bundle
2. Recomputes leaf hash from `leafScriptHex`
3. Uses control block to compute tweaked key
4. Verifies tweaked key matches the output key from transaction
5. Confirms transaction is confirmed on-chain

### Benefits

- No on-chain cost (UTXO remains unspent)
- Can be verified by any observer with the proof bundle
- Standard Taproot verification (BIP-341)
- Compatible with light clients

## 8. Bitcoin Core Compatibility

### Miniscript Support

Bitcoin Core v26+ supports Miniscript in Taproot leaves:
- Can parse and track `sha256(H)` expressions
- Can generate PSBTs for spending
- Can sign via descriptor wallets

### Limitations

Core does NOT support:
- Arbitrary raw scripts in `tr()` descriptors
- Pure `rawtr()` with custom scripts
- Control block export for arbitrary trees (must compute off-chain)

### Workaround

The `sha256(H)` commitment leaf uses standard Miniscript, allowing Core to:
- Import the descriptor
- Track the UTXO
- Sign spend transactions

For soft reveal, compute the control block off-chain using the Node.js script.

## 9. References

### Bitcoin Documentation

- [Bitcoin Optech: Descriptors](https://bitcoinops.org/en/topics/output-script-descriptors/)
- [Bitcoin Optech: Taproot](https://bitcoinops.org/en/topics/taproot/)
- [Bitcoin Core: Miniscript](https://bitcoin.sipa.be/miniscript/)

### Stack Exchange

- [Control block computation](https://bitcoin.stackexchange.com/questions/tagged/taproot)
- [Descriptor compatibility](https://bitcoin.stackexchange.com/questions/tagged/descriptors)

### BIPs

- [BIP-340: Schnorr Signatures](https://github.com/bitcoin/bips/blob/master/bip-0340.mediawiki)
- [BIP-341: Taproot](https://github.com/bitcoin/bips/blob/master/bip-0341.mediawiki)
- [BIP-342: Tapscript](https://github.com/bitcoin/bips/blob/master/bip-0342.mediawiki)
- [BIP-386: tr() Descriptors](https://github.com/bitcoin/bips/blob/master/bip-0386.mediawiki)

## 10. Testing

### Local Testing

1. Start Bitcoin Core in regtest mode:
```bash
bitcoind -regtest -daemon
```

2. Run the anchor script:
```bash
bash bitcoin/scripts/anchor_regtest.sh
```

3. Compute control block:
```bash
export I_XONLY="..."
export ADMIN_XONLY="..."
export ANCHOR_ROOT_HEX="..."
node bitcoin/scripts/compute-control-block.js
```

4. Verify the output matches expected format

### Schema Validation

Validate JSON against schemas using any JSON Schema validator:

```bash
npm install -g ajv-cli
ajv validate -s bitcoin/schemas/receipt.schema.json -d your-receipt.json
```

### Integration Testing

1. Generate a batch of receipts
2. Compute merkle root and batch header hash
3. Compute anchor root
4. Create anchor UTXO with the script
5. Export AnchorProof bundle
6. Verify soft reveal from bundle

## 11. Security Considerations

### Key Management

- Store `I_XONLY` (internal key) securely - controls key-path spending
- Store `ADMIN_XONLY` offline - emergency recovery only
- Rotate keys periodically per security policy

### Dust Limits

- Anchor output uses 400 sats (above P2TR dust threshold on regtest)
- Mainnet: consider higher amounts for fee buffer
- Test dust limits on target network before production

### Timelock Safety

- 6-block refund timelock (≈1 hour) is conservative for testing
- Mainnet: consider longer timelocks (144 blocks = 1 day)
- Balance security vs capital efficiency

### Soft Reveal Privacy

- Revealing the leaf script exposes the anchor_root
- Do NOT reveal until batch is finalized
- Consider timing of soft reveal vs finality requirements

## 12. Troubleshooting

### Common Issues

**"Descriptor checksum mismatch"**
- Use `getdescriptorinfo` to compute correct checksum
- Don't manually add checksums

**"Cannot import descriptor"**
- Ensure Bitcoin Core v26 or later
- Check Miniscript syntax is valid
- Verify keys are 32-byte x-only pubkeys (64 hex chars)

**"Transaction below dust threshold"**
- Increase `ANCHOR_SATS` in script
- Check network dust limits

**"Control block verification failed"**
- Ensure leaf script matches exactly
- Verify tree construction matches descriptor
- Check internal key is correct

### Debug Mode

Add `-debug=rpc` to bitcoind startup for verbose RPC logging.

## 13. Production Checklist

Before deploying to mainnet:

- [ ] Generate production keys securely (HSM or offline signing)
- [ ] Test descriptor import on mainnet Bitcoin Core
- [ ] Verify control block computation matches Core's expectations
- [ ] Test soft reveal verification independently
- [ ] Set appropriate timelock values for mainnet
- [ ] Calculate appropriate anchor UTXO amounts
- [ ] Implement key rotation policy
- [ ] Set up monitoring for anchor confirmations
- [ ] Document disaster recovery procedures
- [ ] Test RBF (Replace-By-Fee) handling if used
- [ ] Verify mainnet dust limits
- [ ] Test with production epoch parameters

## 14. License

UNLICENSED - See repository root LICENSE.txt
