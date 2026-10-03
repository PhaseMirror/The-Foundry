# LexLean Phase Mirror records (recovered from an unadvertised commit)

These five records are the Phase Mirror plan ADRs authored for the LexLean claim
plane. They are kept here, under their own namespace, because of two facts about
where they came from and what they would otherwise collide with.

## Provenance

Recovered verbatim from `PhaseMirror/LexLean` commit
`b54cd15b9d2894f9bcf851f14f179f112d428e35` at path `docs/`, which was the working
tree of the retired `packages/LexLean` gitlink. No file content was edited.

That commit is not reachable from any ref the upstream repository advertises:
upstream publishes only `refs/heads/main`, which was force-advanced to
`1c3e166581347f6d8c66e7ff12e2e7bdaff9b454`, and
`git merge-base --is-ancestor b54cd15 origin/main` fails. A full clone of
upstream does not contain `b54cd15`. The object was still fetchable by SHA at the
time of recovery, so the content remains retrievable from upstream today — but
only on the remote's object-retention schedule, not on anything a ref vouches
for. `1c3e166` has no `docs/` directory at all, so repointing the submodule to
`1c3e166` removes the only pin under which these five records were reachable.

## Why this namespace and not `docs/adr/proposed/`

The `ADR-PML-NNN` numbers in this series are **already used by different
documents** in `docs/adr/proposed/`. Read directly, `proposed/ADR-PML-058.md` is
a control-surfaces tension, `-059` concerns ADR-scaffold theorems, `-060` moc
theorems, `-061` bindu-rta, `-062` zmos — none of them the LexLean documents
here. The same duplicate numbering exists across `docs/adr/`, `docs/adr/proposed/`
and `docs/adr/completed/`. Copying these files into `proposed/` under the same
numbers would add a fourth collision to a series that already resolves an ID to
three different files, so they are namespaced here instead, under their
unambiguous slugged filenames.

That numbering collision is itself unrecorded dissonance. It is not resolved by
this note and is tracked separately.

## What is *not* preserved here

`b54cd15` also carried two files that `1c3e166` does not:
`examples/uor-atlas/provenance.toml` and `xtask/src/atlas_prov.rs`. They are
LexLean's own Atlas-provenance implementation rather than governance records for
this monorepo, so they are not duplicated into The-Foundry. They remain
recoverable from the same unadvertised `b54cd15` object and nothing else, which
is a real but bounded exposure: the recovery route is one `git fetch <url>
b54cd15…` away from disappearing entirely.

## Relationship to ADR-0139

`docs/adr/proposed/ADR-0139.md` removed the `packages/LexLean` gitlink and
repointed `packages/lexlean` to `1c3e166`. Preserving these five files before
that removal is what keeps the removal from orphaning governance records; the
ADR's removal justification is corrected in the same change to say so.