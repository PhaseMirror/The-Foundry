#!/usr/bin/env bash
set -euo pipefail

BITCOIN_CLI="bitcoin-cli -regtest"
WALLET_ANCHOR="anchor"
WALLET_FUNDER="funder"

# === Replace these three ===
I_XONLY="aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"        # 32-byte hex
ADMIN_XONLY="bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"   # 32-byte hex
ANCHOR_ROOT_HEX="cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc"  # 32-byte hex

# Amounts
ANCHOR_SATS=400   # slightly above P2TR dust on regtest policy
FEEADDR_SATS=5_000_000

# 0) Ensure two wallets
$BITCOIN_CLI -named createwallet wallet_name="$WALLET_FUNDER" descriptors=true 2>/dev/null || true
$BITCOIN_CLI -named createwallet wallet_name="$WALLET_ANCHOR" descriptors=true disable_private_keys=true 2>/dev/null || true

# 1) Mine funds into funder
ADDR_FUND=$($BITCOIN_CLI -rpcwallet="$WALLET_FUNDER" getnewaddress "" bech32m)
$BITCOIN_CLI generatetoaddress 101 "$ADDR_FUND" >/dev/null

# 2) Build the Taproot descriptor string (without checksum)
DESC_NOCHK="tr($I_XONLY,{sha256($ANCHOR_ROOT_HEX),and_v(v:older(6),pk($ADMIN_XONLY))})"

# 3) Let Core compute the checksum
DESC=$($BITCOIN_CLI getdescriptorinfo "$DESC_NOCHK" | jq -r .descriptor)

# 4) Import descriptor as active into the anchor wallet
$BITCOIN_CLI -rpcwallet="$WALLET_ANCHOR" importdescriptors \
"[{\"desc\":\"$DESC\",\"timestamp\":\"now\",\"active\":true}]"

# 5) Derive the address (P2TR with committed leaf)
ADDR_ANCHOR=$($BITCOIN_CLI deriveaddresses "$DESC" | jq -r '.[0]')
echo "Anchor P2TR address: $ADDR_ANCHOR"

# 6) Fund the anchor output with near-dust, RBF enabled
TXID=$($BITCOIN_CLI -rpcwallet="$WALLET_FUNDER" sendtoaddress "$ADDR_ANCHOR" "$(bc -l <<< "$ANCHOR_SATS/1e8")" "" "" true true null "unset" null)
echo "Funding txid: $TXID"

# 7) Mine it
$BITCOIN_CLI generatetoaddress 1 "$ADDR_FUND" >/dev/null

# 8) Produce a 'soft reveal' bundle (AnchorProof parts known now)
SPK=$($BITCOIN_CLI decodescript "$($BITCOIN_CLI getaddressinfo "$ADDR_ANCHOR" | jq -r .scriptPubKey)" | jq -r .p2tr)
echo "AnchorProof (soft reveal inputs you will ship alongside batch metadata):"
echo "  txid: $TXID"
VOUT=$($BITCOIN_CLI gettransaction "$TXID" | jq '.decoded.vout | to_entries[] | select(.value.scriptPubKey.addresses[0]=="'"$ADDR_ANCHOR"'") | .key')
echo "  vout: ${VOUT:-0}"
echo "  scriptPubKey(bech32m): $SPK"
echo "  leafScriptHex (commit leaf): $(printf '0a20%s88a9' "$ANCHOR_ROOT_HEX")"
echo "  controlBlock: (compute off-chain; see Node snippet in docs)"
