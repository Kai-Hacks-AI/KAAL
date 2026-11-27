# C44 change

Finding from the Owner (27 Nov), relayed by the coordinator; the Owner and CPO ruled that a Test Case tests the criterion, never a snapshot count. All three snapshots in one Change, and no literal tarball list (coordinator, 27 Nov).

## What changes in `engineering/acceptance/embed.test.mjs`

1. **The count.** `ok: N Nodes admitted` is computed: N is the Definition files of the installed Core's `payload/core` plus the Nodes the Case registered itself. The rule: every Definition Core ships is admitted, each exactly once, and a registered Node adds one.
2. **The Engine's files.** The two literal arrays are replaced by the packaged `payload/` listing. The Engine is the payload.
3. **The tarball.** The literal list is replaced by the rule "the declared files, and nothing outside them": every entry lies under a path of `files` (or is `package.json`, `README.md`, `LICENSE`); no entry is a `!`-excluded one; every declared path and the three always-present files are in the tarball; the Kernel and the entry point are in it; and the payload in the tarball equals the payload installed.

## Decisions

1. **The PLAN carries the edited Case, as in C39.** The Case is the whole change; there is no DO. It changes what the scenario pins, not what the package must do.
2. **Not vacuous.** With the edit the Acceptance lane passes (46 tests, 8 scenarios). With one expected count changed by 7 the Case fails with "ok: 17 ... Input: ok: 10", so the check bites.
3. **Release safety kept.** A file outside the declared set, an excluded file, or a missing declared path fails the tarball Case, which is what the literal list protected.

## Not in this Change

The Cases of kaal-core itself, and any WIRE or ruleset change.
