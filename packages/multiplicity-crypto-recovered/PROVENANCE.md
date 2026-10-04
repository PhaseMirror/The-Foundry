# multiplicity-crypto: recovered provenance for twelve unpublished commits

This directory is the provenance artifact for register entry `D-21` (Critical, open) in
`compliance/governance/DISSONANCE-REGISTER.json`, and for `ADR-0140`, which is
**`Proposed`**. It exists because twelve commits of governance and conformance work exist
on exactly one disk and on no remote, and because naming that risk in a sentence is not
the same as preserving it.

## What is here

| Path | What it is |
| --- | --- |
| `multiplicity-crypto-616f1f9c.bundle` | A git bundle carrying all twelve commits, 80K, verified with `git bundle verify` |
| `.bundle.sha256` | `3d813dba40251fce8e7fd6664efa8ca9c43ddb916b32b69267773c0579b878b1` |
| `docs/ADR-084…091` | The eight governance records the twelve commits add, extracted verbatim from `616f1f9c` |
| `probes/` | The seventeen `adr-*.sh` probe scripts and `run-all.sh`, extracted verbatim |
| `vectors/protocol.json` | The protocol conformance vector set, extracted verbatim |

Everything under `docs/`, `probes/` and `vectors/` was produced with
`git archive 616f1f9c … | tar -x`, so it is byte-identical to the committed content and
carries no edits.

## Why these twelve commits are at risk

`packages/multiplicity-crypto` is pinned at `616f1f9c2d746fa372df309b8108dbabe77f84db`.
That commit is unreachable from any ref at `https://github.com/PhaseMirror/multiplicity-crypto.git`,
and it cannot be fetched at all — the remote answers `fatal: remote error: upload-pack:
not our ref 616f1f9c2d746fa372df309b8108dbabe77f84db`. Upstream `main` is `3d49da5`, which
is the **merge base** of the pin rather than a successor, so the pin is twelve commits
*ahead* of the only ref the remote publishes.

Measured 2026-10-03, before this directory existed: the tip was held by `refs/heads/main`
in one local clone and by no remote ref anywhere. The twelve commits are ADR-084 through
ADR-091, a protocol conformance vector set with three-language executors, a PROVENANCE
register, and the round-3/round-4 hardening gates. Repointing the submodule to `3d49da5`
would have deleted all of it silently, which is why `ADR-0140` records the repoint as
forbidden **while it stays `Proposed`**. That status is not an oversight to tidy away: per
`ADR-0144` (itself `Proposed`), "`ADR-0140` stays `Proposed` because it cannot be executed
without push access to two upstream repositories … so status tracks execution rather than
intent." What is in force here is therefore not a ratified rule but a register entry graded
`Critical`/`open`. Treating the prohibition as settled because a sentence exists would be
the failure this repository keeps refusing to commit.

## How to recover from this bundle

The bundle is **thin**: it carries the twelve commits but not their ancestry, because a
self-contained bundle of this repository measures 367M and cannot be committed. Recovery
therefore takes two steps, and both were executed and verified on 2026-10-03:

```sh
# 1. the base comes from the remote, which does advertise it
git clone https://github.com/PhaseMirror/multiplicity-crypto.git
cd multiplicity-crypto

# 2. the twelve commits come from the bundle
git fetch ../multiplicity-crypto-recovered/multiplicity-crypto-616f1f9c.bundle \
    'refs/heads/main:refs/heads/recovered'
git checkout recovered
```

Verify with `git log --oneline 3d49da5..HEAD | wc -l`, which must print `12`, and
`git bundle verify` against the bundle, which must report it `okay`.

The two-step procedure is not a workaround for a broken bundle; it is the only shape that
fits an 80K artifact for a repository whose full history is 367M. The dependency on the
remote for the base is the same dependency the submodule pin already has, so recovery
needs no new trust.

## What is still outstanding

**The push has not happened.** `git push --dry-run origin refs/heads/main:refs/heads/recovery/adr-084-091`
on 2026-10-03 failed with `could not read Username for 'https://github.com'`: this
environment holds no push credentials for that repository. Until a maintainer with push
access publishes the twelve commits to any ref upstream, `616f1f9c` still grades `GONE`,
`D-21` stays `open` at severity Critical, and `packages/multiplicity-crypto` must not be
deleted, re-cloned, or garbage-collected.

What this directory changes so far is nothing about durability, and that is worth stating
plainly rather than letting the directory's existence imply otherwise. It was written to
`/home/citizen/Multiplicity/uor-foundry/packages/multiplicity-crypto-recovered` — the
**same repository, on the same disk** — and at the time of writing it is untracked. There
is no second clone, no second remote, and no second disk involved. A recovery copy beside
the only copy is not a recovery copy.

It becomes provenance the moment it is committed and pushed, because this repository's
remote (`PhaseMirror/The-Foundry`) is a different remote from the one that cannot serve
`616f1f9c` (`PhaseMirror/multiplicity-crypto`), and this environment holds push
credentials for the former but not the latter. Committing here is therefore sufficient
to move the twelve commits onto a second remote, and it is the only step in this document
that this environment can actually perform. Until it is committed, treat the twelve
commits as still existing in exactly one place.

## Deletion is not provenance

The 4.2G `target/` cache and 526M of duplicate LexLean trees removed alongside this work
were *not* a second `D-21`, and the reason is specific rather than reassuring: every byte
in them came from `PhaseMirror/LexLean` at `1c3e166`, which grades **ADVERTISED** — named by
`refs/heads/main` on the remote — so all of it is fetchable today. The distinction this
directory exists to make is the distinction between content whose commit a remote vouches
for and content whose commit no remote vouches for. `1c3e166` is the first kind. `616f1f9c`
was the second, and now has this directory as well.