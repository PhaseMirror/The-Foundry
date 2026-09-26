# Deployment / Testnet Plan

## Prerequisites

- Node.js >= 18
- Rust + Cargo
- Foundry (anvil, forge, cast)
- Docker (for NATS)
- Make

## 1. Start Local Anvil Node

```bash
anvil --port 8545 --chain-id 31337 --block-time 2 > anvil.log 2>&1 &
export ANVIL_PID=$!
```

## 2. Deploy Contracts

```bash
cd contracts
forge install --no-git
forge build
forge script script/Deploy.s.sol:DeployScript --rpc-url http://127.0.0.1:8545 --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 --broadcast
```

Record the deployed `AnchorRegistry` address for sidecar `.env`.

## 3. Start NATS

```bash
docker run -d -p 4222:4222 nats:latest -js
```

Verify:

```bash
nats server info
```

## 4. Configure Sidecar

```bash
cp sidecar/state-anchor/.env.example sidecar/state-anchor/.env
```

Edit `.env`:

```
BATCH_ANCHOR_BIN=target/release/batch_anchor
ANCHOR_REGISTRY_ADDRESS=<deployed_address>
RPC_URL=http://127.0.0.1:8545
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
NATS_URL=nats://127.0.0.1:4222
```

## 5. Build Rust Binary

```bash
cd batch_anchor
cargo build --release
cd ..
```

## 6. Install Sidecar Dependencies

```bash
cd sidecar/state-anchor
npm install
npm run build
cd ../..
```

## 7. Run Sidecar (Manual Trigger)

```bash
cd sidecar/state-anchor
npx ts-node index.ts
```

Expected output:

```
[INFO] Attestations batch_root: 0x...
[INFO] Submitting combined root 0x...
```

## 8. Schedule Daily Run

### Systemd Timer

Create `/etc/systemd/system/phase-mirror-anchor.timer`:

```ini
[Unit]
Description=Daily PhaseMirror anchor job

[Timer]
OnCalendar=daily
Persistent=true

[Install]
WantedBy=timers.target
```

Create `/etc/systemd/system/phase-mirror-anchor.service`:

```ini
[Unit]
Description=PhaseMirror daily anchor

[Service]
Type=oneshot
WorkingDirectory=/opt/phase-mirror
ExecStart=/usr/bin/node dist/sidecar/state-anchor/index.js
EnvironmentFile=/opt/phase-mirror/sidecar/state-anchor/.env
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now phase-mirror-anchor.timer
```

### Kubernetes CronJob

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: phase-mirror-anchor
spec:
  schedule: "0 0 * * *"
  jobTemplate:
    spec:
      template:
        spec:
          containers:
            - name: anchor
              image: phase-mirror:latest
              command: ["node", "dist/sidecar/state-anchor/index.js"]
              envFrom:
                - configMapRef:
                    name: phase-mirror-config
                - secretRef:
                    name: phase-mirror-secrets
          restartPolicy: OnFailure
```

## 9. Monitoring

### Grafana Panel

- **Metric**: `phase_mirror_anchor_last_success_timestamp`
- **Alert**: Fire if last success > 26 hours
- **Log query**: `Attestations batch_root: 0x*`

### Logs

```bash
journalctl -u phase-mirror-anchor.service -f
```

## 10. Verification Checklist

- [ ] `anvil` running on port 8545
- [ ] `AnchorRegistry` deployed
- [ ] NATS running on port 4222
- [ ] `batch_anchor` binary built
- [ ] Sidecar `.env` configured
- [ ] Manual run submits combined root
- [ ] `phase-mirror-anchor.timer` active
- [ ] Grafana panel shows recent submission
- [ ] No permission or timeout errors in logs

## Rollback

```bash
sudo systemctl disable --now phase-mirror-anchor.timer
```

Pending attestations remain in the sidecar accumulator and will be included in the next successful run.
