# Phase Mirror MCP — Release Checklist v1.0.0-ai

**Target version**: `v1.0.0-ai`  
**Date**: 2026-06-23  
**Owner**: DevOps + MCP Integration Lead  

---

## Pre-flight (blocking)

- [ ] `cargo test --features lmstudio` passes on clean workspace
- [ ] `cargo build --release --features lmstudio` completes without error
- [ ] `bash harness_mcp_lmstudio.sh` outputs `22 passed, 0 failed, 0 skipped`
- [ ] `mcp-contract.json` is in production state (STONEHENGE-PROD-001)
- [ ] No `.bak` or temp contract files in repo root
- [ ] ADR-001 MCP section merged to `main`
- [ ] `sedona_spine_ci.yml` includes `mcp_harness_gate` and CI is green

## 1. Tag the release

```bash
cd /home/multiplicity
git checkout main
git pull origin main
git tag -a v1.0.0-ai -m "Release v1.0.0-ai: LM Studio integration, Sedona Spine harness, CI gate"
git push origin v1.0.0-ai
```

## 2. Changelog entry

File: `Multiplicity/Phase Mirror/phase-mirror-mcp/CHANGELOG.md`

```markdown
## [1.0.0-ai] — 2026-06-23

### Added
- `lmstudio` feature flag: 6 new MCP tools (`lmstudio_health`, `lmstudio_list_models`,
  `lmstudio_generate`, `lmstudio_chat`, `lmstudio_embed`, `lmstudio_register_mcp`)
- `ci/mock_lmstudio.py` — mock LM Studio server for CI
- `harness_mcp_lmstudio.sh` — 22-pass Sedona Spine Witness Harness
- `ci/flatpak_smoke_test.sh` — Flatpak sandbox smoke test
- `--register-mcp` binary flag for LM Studio MCP registration

### Changed
- All MCP tools emit `LambdaTrace` with `zero_spacings` + `SIGNED_HASH`
- Error contract: fail-closed, no witness leak on `L0_VIOLATION` / `ZEROS_EMPTY`
- `process_request` conditionally compiled under `--features lmstudio`

### Fixed
- curl response capture (`-o` flag) for reliable LM Studio client
- Error responses now return `isError: true` with no witness leak
```

## 3. Build artifacts

```bash
cd /home/multiplicity/Multiplicity
cargo build --release -p phase-mirror-mcp --features lmstudio
BINARY="Phase Mirror/phase-mirror-mcp/target/release/phase-mirror-mcp"
```

Artifacts to archive:

| Artifact | Path |
|----------|------|
| release binary | `Phase Mirror/phase-mirror-mcp/target/release/phase-mirror-mcp` |
| install script | `Phase Mirror/phase-mirror-mcp/install.sh` |
| harness script | `Phase Mirror/phase-mirror-mcp/harness_mcp_lmstudio.sh` |
| mock server | `Phase Mirror/phase-mirror-mcp/ci/mock_lmstudio.py` |
| smoke test | `Phase Mirror/phase-mirror-mcp/ci/flatpak_smoke_test.sh` |
| integration plan | `Phase Mirror/phase-mirror-mcp/docs/LMStudio-Integration-Plan.md` |

## 4. Flatpak build

```bash
cd /home/multiplicity/Multiplicity/Phase Mirror/phase-mirror-mcp
flatpak-builder --repo=repo --force-clean build-dir com.multiplicity.phase-mirror-mcp.yml
flatpak build-bundle repo phase-mirror-mcp.flatpak com.multiplicity.phase-mirror-mcp
```

Verify sandbox permissions:
- `filesystem=home` — for `~/.lmstudio/mcp.json` write
- `filesystem=xdg-data/phase-mirror` — for native ACE certificates and triple lock governance volume mount

## 5. Smoke test inside Flatpak

```bash
FLATPAK_APP_ID=com.multiplicity.phase-mirror-mcp \
FLATPAK_BUNDLE=phase-mirror-mcp.flatpak \
bash ci/flatpak_smoke_test.sh
```

Expected: `SMOKE TEST: ALL CHECKS PASSED`

## 6. Flathub submission (if applicable)

- [ ] Create GitHub release at `https://github.com/multiplicity-labs/multiplicity/releases/tag/v1.0.0-ai`
- [ ] Upload `phase-mirror-mcp.flatpak` as release asset
- [ ] Update Flathub manifest (if separate repo) with new commit hash
- [ ] Submit PR to `flathub/com.multiplicity.phase-mirror-mcp.yml`

## 7. Post-release

- [ ] Verify `mcp_harness_gate` passes on `main` with new tag
- [ ] Announce release in #governance and #devops channels
- [ ] Archive `harness_mcp_lmstudio.sh` output log to `artifacts/harness-logs/v1.0.0-ai.txt`
- [ ] Set milestone for Phase 5 (TripleLock sovereignty bridge)

---

## Rollback

If the release fails any gate:

```bash
git tag -d v1.0.0-ai
git push origin :refs/tags/v1.0.0-ai
# Revert CI workflow changes if needed
git revert HEAD
git push origin main
```

The existing `v0.x` tag remains as fallback.
