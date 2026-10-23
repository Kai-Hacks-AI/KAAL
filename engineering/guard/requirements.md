# Guard: Requirements

## Functional

**G1 Check list.** A repository lists its checks in `guard.json`, under `checks`, keyed by a stable name. Each check gives a `command`, where it runs (`runs`: `local`, `ci` or both), and optionally the facts it needs (`facts`), a trusted checker file (`trusted`, G7) and named outcomes for further exit statuses (`outcomes`, G2).

```json
{
  "checks": {
    "unit": { "command": "node --test", "runs": ["local", "ci"] },
    "lineage": { "command": "node engineering/github/lineage.ts", "runs": ["ci"], "facts": ["base", "head"], "trusted": "engineering/github/lineage.ts", "outcomes": { "4": "held" } }
  }
}
```

**G2 Verdicts.** A check's exit status is its verdict: `0` pass, `1` fail, `2` cannot judge, `3` not applicable. Any other status is cannot judge, unless the check declares a named outcome for it. The only named outcome is `held`: shown as held with its evidence, never as a pass and never as a fail. Guard prints each verdict by its own name, one line per check, as `<verdict>: <check>: <evidence>`, and never collapses one verdict into another. A fail or cannot-judge line is followed by an indented `do: <next step>` line (N4).

**G3 One runner.** The same runner and the same list serve both the hook and CI.

**G4 Local hook.** `pre-push` runs the `local` checks. Fail and cannot judge block the push. `--no-verify` skips the hook once, and the hook says that CI decides.

**G5 CI gate.** Each `ci` check runs in a named CI job that the repository can make required.
- Fail and cannot judge fail the job.
- Not applicable lets the job succeed, reported as not applicable in a notice and in the step summary, never as a pass.
- Held lets the job succeed, with a warning carrying the hold's evidence.

**G6 Narrow adapters.** The hook and the workflow jobs pass facts and act only on verdicts.

**G7 Trusted checker.** A check can name a `trusted` file. The runner then runs that file as it stands on the target ref (`base`), never the candidate's version, so a candidate cannot certify itself.

**G8 Safe lifecycle.**
- The package provides `init`, `upgrade` and `remove`.
- Guard writes a file only where none exists. It records each file it writes, with its SHA-256, in `guard.json` under `managed`.
- `upgrade` replaces only managed files that are unmodified.
- `remove` deletes only managed files that are unmodified, and unsets `core.hooksPath` only if Guard set it and recorded that.
- A pre-existing hook, workflow or `core.hooksPath` is never overwritten. Guard reports it and prints the one line to add.
- A modified managed file is left in place and reported.
- An External delivery follows the same rule for the target's existing files.

**G9 Execution contract.** An adapter supplies facts to `kaal-guard run` as `--head`, `--base`, `--base-ref` and `--changed <file>`. A check runs as a command, from the repository root, with no stdin. It receives only these facts, as environment variables, when the adapter supplied them:
- `GUARD_HEAD`, the candidate commit;
- `GUARD_BASE` and `GUARD_BASE_REF`, the target commit and its name;
- `GUARD_CHANGED`, a file listing the changed paths, NUL-separated.

Guard does not tell a check where it is running. Equal facts, the same tree, the same command and the same tool versions give the same verdict. A local base from a stale fetch is a different fact, so the verdict may legitimately differ; the hook prints the base it used.

**G10 No silent gate.** Missing verification never satisfies a gate.
- A command that cannot start is cannot judge.
- A fact a check declares and does not receive is cannot judge.
- A check that is not in `guard.json` is cannot judge.
- A `ci` check that no workflow job runs fails Guard's own consistency check, `kaal-guard verify`, which runs in CI as the job `Guard`.

## Non-functional

- **N1** Linux, macOS and Windows. The hook is POSIX `sh`; the runner runs on Node LTS.
- **N2** Deterministic: no network, no clock dependence and no polling of GitHub.
- **N3** No state beyond the repository and `core.hooksPath`.
- **N4** Every fail or cannot-judge verdict says what to do next.
- **N5** An External delivery is a handful of readable files that the target can maintain on its own.
