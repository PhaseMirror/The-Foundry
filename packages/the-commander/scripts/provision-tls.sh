#!/usr/bin/env bash
set -euo pipefail

# provision-tls.sh – Generate a self‑signed CA and server certificates for MCP
# Usage: ./provision-tls.sh <primary-domain> [subdomain1,subdomain2,...]
# Example: ./provision-tls.sh example.com api.example.com,admin.example.com

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <primary-domain> [subdomains(comma‑separated)]"
  exit 1
fi

PRIMARY_DOMAIN="$1"
SUBDOMAINS="${2:-}"

# Prepare SAN list
SAN="DNS:${PRIMARY_DOMAIN}"
if [[ -n "$SUBDOMAINS" ]]; then
  IFS=',' read -ra ADDR <<< "$SUBDOMAINS"
  for sd in "${ADDR[@]}"; do
    SAN=",${SAN},DNS:${sd}"
  done
fi
# Remove leading comma if any
SAN="${SAN#,}"

TLS_DIR="/etc/mcp/tls"
mkdir -p "$TLS_DIR"

# 1. Create a local CA if not present
CA_KEY="$TLS_DIR/ca.key"
CA_CERT="$TLS_DIR/ca.crt"
if [[ ! -f "$CA_KEY" || ! -f "$CA_CERT" ]]; then
  echo "Creating local CA..."
  openssl genrsa -out "$CA_KEY" 4096
  openssl req -x509 -new -nodes -key "$CA_KEY" -sha256 -days 3650 \
    -subj "/CN=PhaseMirror MCP CA" -out "$CA_CERT"
fi

# 2. Generate server key and CSR
SERVER_KEY="$TLS_DIR/server.key"
SERVER_CSR="$TLS_DIR/server.csr"
SERVER_CERT="$TLS_DIR/server.crt"

openssl genrsa -out "$SERVER_KEY" 4096
cat > "$TLS_DIR/server.cnf" <<EOF
[ req ]
default_bits = 4096
prompt = no
default_md = sha256
req_extensions = req_ext
distinguished_name = dn

[ dn ]
CN = $PRIMARY_DOMAIN

[ req_ext ]
subjectAltName = $SAN
EOF

openssl req -new -key "$SERVER_KEY" -out "$SERVER_CSR" -config "$TLS_DIR/server.cnf"

# 3. Sign the server certificate with the CA
openssl x509 -req -in "$SERVER_CSR" -CA "$CA_CERT" -CAkey "$CA_KEY" -CAcreateserial \
  -out "$SERVER_CERT" -days 825 -sha256 -extensions req_ext -extfile "$TLS_DIR/server.cnf"

# Cleanup CSR and config
rm -f "$SERVER_CSR" "$TLS_DIR/server.cnf"

echo "TLS certificates generated at $TLS_DIR"
