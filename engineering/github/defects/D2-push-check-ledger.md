# engineering/D2: the pre-push check ignores the target's transition ledger

Owner: Engineering (the branching and Change Isolation tooling). Instance owned by the context that raised it. Raised by Codex (P2) on SYNC #1001, in code already on `main`. Triaged by Engineering on 3 November 2026: real.

## Record

Plain data, in the shape of the Defect record definition under review in #991 (`id`, `context`, `expected`, `observed`, `where`, `status`, `tests`; the definition is not yet on `main`, so this record is checked by eye, not by `check`).

```json
{
  "id": "engineering/D2",
  "context": "engineering (branching and Change Isolation tooling)",
  "expected": "The pre-push check passes the target's transition ledger to the Change Isolation checker, exactly as CI does, so it admits a change the ledger admits.",
  "observed": "The pre-push check runs the checker with no ledger and refuses a ledger-admitted change that CI admits.",
  "where": "engineering/github/push-check.sh@b6a32f4 (the two checker calls in the Change Isolation judgment)",
  "status": "answered",
  "tests": ["engineering/T83"]
}
```

`tests` names only the RED Case. Its three controls have identities of their own (engineering/T87, T88, T89) and are not Cases that expose the Defect.

## Location

`engineering/github/push-check.sh`, the two places it runs the Change Isolation checker with no ledger:

```
run "Change Isolation" "$tmp/check.mjs" <"$tmp/paths"       # an ordinary change
run "Change Isolation" "$tmp/check.mjs" <"$tmp/resolved"    # a synchronization's explicit resolutions
```

The CI adapter, `engineering/github/change-isolation.sh`, reads `engineering/change-isolation/transitions.json` from the target's tip and runs `check.mjs --ledger <file> --git <base> <head>`. The pre-push check, which says its verdicts are "the hook's own, unchanged", never does. The file is the same blob on `main` and on `kaal/engineering` (b6a32f4).

## Observed

A change that the target's transition ledger admits (for example the flat-packages move, or the planned Hosting 0.0.1 transition) is admitted in CI and refused by the pre-push hook:

```
Change Isolation: core travels alone: other/y.txt is not Core or its supporting files
```

The hook is stricter than CI. It fails closed, so it cannot admit anything CI refuses.

## Expected

The pre-push check passes the target's ledger exactly as CI does, so it judges a pushed change the way CI will.

## Cases, version and confirming Run

| Identity | Role | File |
| --- | --- | --- |
| engineering/T83 | the RED Case: the pre-push check admits a change the target's ledger admits | [push-check-ledger.red.mjs](push-check-ledger.red.mjs) |
| engineering/T87 | control: the checker admits the fixture's change with the target's ledger | same file |
| engineering/T88 | control: the checker refuses the same change without a ledger | same file |
| engineering/T89 | control, the rejected side of the agreement with CI: a change the ledger does not admit is refused by the checker and by the pre-push check | same file |

**Case version:** the Git blob id of `push-check-ledger.red.mjs`, `97275c175605b3eae47511eb24c8fe9a5106880a`.

**Confirming Run** (one Run observed all four Cases; Node v22.23.4, Linux; subject `engineering/github/push-check.sh` blob `b6a32f4bf0dff5d01b7e98efcfc3917396f55d6a` with `engineering/change-isolation/check.mjs` blob `aa62ca67e605897649f4d2647a7ad803afd41b9f`):

```
ok 1 - engineering/T87 control: the checker admits the fixture's change with the target's ledger
ok 2 - engineering/T88 control: the checker refuses the same change without a ledger
ok 3 - engineering/T89 control: a change the ledger does not admit is refused by the checker and by the pre-push check
not ok 4 - engineering/T83 RED (engineering/D2): the pre-push check admits a change the target's ledger admits
  error: the pre-push check refused a ledger-admitted change:
    Change Isolation: core travels alone: other/y.txt is not Core or its supporting files
```

T83 is `failed` on an assertion after its three controls passed, so the fixture is a real ledger-admitted change and the failure is the hook. The Case builds a scratch repo whose target holds a ledger entry for one exact multi-owner change, and runs the real `push-check.sh` with the facts the hook supplies.

**Agreement with CI on both sides:** T83 is the admitted side (the hook must admit what the ledger admits) and T89 is the rejected side (the hook must still refuse what the ledger does not admit, as CI does). T89 passes today and must keep passing after the correction, so a fix that admits everything does not answer D2. Checked on a local, uncommitted edit of `push-check.sh` that passes the target's ledger as CI does, then restored: all 4 pass.

**Answered** only by a later Run in which engineering/T83 passes at this same Case version (blob `97275c17...`), as its latest observation. A different Case version needs its own confirming RED against the old `push-check.sh` before it can answer D2; an edited Case alone answers nothing.

**Answering Run** (the correction, Change `engineering/D2-push-check-ledger-fix`; Node v22.23.4, Linux): the Case file is unchanged, blob `97275c175605b3eae47511eb24c8fe9a5106880a`, and all four Cases pass: T87, T88, T89 and T83. `push-check.sh` now reads the target's `transitions.json` from `$base` and passes `--ledger <file> --git <base> <head>` for an ordinary change, as `change-isolation.sh` does; a target without a ledger is judged as before. A synchronization's explicit resolutions stay judged without a ledger, as in CI. T89 still passes, so the correction does not admit everything.

**How it is run:** by hand, `node --test engineering/github/defects/push-check-ledger.red.mjs`. No suite, lane or script names it, so required CI does not run it, deliberately, until the open question of how a Defect Case lives in `main` without hiding regression (raised on #991) is settled. Until then Engineering runs it before each Engineering promotion or publication and records the Run here. The Case reads the real `push-check.sh`, `check.mjs` and `lineage.ts` from the working tree, so a missing or renamed file fails it loudly instead of passing.

**Applicability:** Linux and macOS with git, node and a POSIX sh. Inapplicable on Windows, because `push-check.sh` is a POSIX shell script that the pre-push hook runs under sh. On Windows the file prints that and exits 3, the repository's does-not-apply status. It does not skip a leaf and it does not pass one.

## Bounds

Not a blocker for Hosting 0.0.1. CI is the authority and admits the change; a developer pushing a ledger-admitted change locally is told to stop by the hook and can only proceed with `--no-verify`. No merge or promotion is blocked by it, and no ledger-admitted change is wrongly admitted.

## Correction plan (a separate Change)

1. Read the target's `engineering/change-isolation/transitions.json` from `$base` and pass `--ledger <file> --git <base> <head>` for an ordinary change, as `change-isolation.sh` does; a target without a ledger is judged as before.
2. `push-check.sh` is under `engineering/`, not `.github`, so the correction travels through `kaal/engineering` to `main` in the usual way.
3. **Answered when** engineering/T83 passes, with engineering/T89 still passing, at the same Case version as its confirming Run, as its latest observation (see above). A synchronization's explicit resolutions are judged by the checker without a ledger in CI as well, so only the ordinary-change path needs the ledger.
4. This record changes no script, test or package. It authorizes no promotion or publication.
