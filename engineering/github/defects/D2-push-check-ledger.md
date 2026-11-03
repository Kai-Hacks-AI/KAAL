# engineering/D2: the pre-push check ignores the target's transition ledger

Owner: Engineering (the branching and Change Isolation tooling). Instance owned by the context that raised it. Status: **established, RED**. Traces to one Test Case: [engineering/T83](push-check-ledger.red.mjs).

Raised by Codex (P2) on SYNC #1001, in code already on `main`. Triaged by Engineering on 3 November 2026: real.

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

## Evidence

[engineering/T83](push-check-ledger.red.mjs) builds a scratch repo whose target branch holds a ledger entry for one exact multi-owner change, and a head that is exactly that change, then runs `push-check.sh` with the facts the hook supplies. Its run on this branch:

- control, the checker admits the change with the target's ledger: pass;
- control, the checker refuses the same change without a ledger (Core travels alone): pass;
- **the pre-push check admits a change the target's ledger admits: fail**, `Change Isolation: core travels alone: other/y.txt is not Core or its supporting files`, exit 1.

The controls show the fixture is a real ledger-admitted change, so the failure is the hook. Run it with `node --test engineering/github/defects/push-check-ledger.red.mjs`. No suite, lane or script names the file, so required CI does not run it.

## Bounds

Not a blocker for Hosting 0.0.1. CI is the authority and admits the change; a developer pushing a ledger-admitted change locally is told to stop by the hook and can only proceed with `--no-verify`. No merge or promotion is blocked by it, and no ledger-admitted change is wrongly admitted.

## Correction plan (a separate Change)

1. Read the target's `engineering/change-isolation/transitions.json` from `$base` and pass `--ledger <file> --git <base> <head>` for an ordinary change, as `change-isolation.sh` does; a target without a ledger is judged as before.
2. `push-check.sh` is under `engineering/`, not `.github`, so the correction travels through `kaal/engineering` to `main` in the usual way.
3. **Answered when** engineering/T83 turns GREEN, unchanged. A synchronization's explicit resolutions are judged by the checker without a ledger in CI as well, so only the ordinary-change path needs the ledger; T83 does not change for that.
4. This record changes no script, test or package. It authorizes no promotion or publication.
