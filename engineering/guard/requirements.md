# Guard: Requirements (what)

Each obligation names, in brackets, the Intent outcomes it serves. Architecture and the planned tests trace back to these identifiers.

## Functional (F)

**F1 Check list.** [I1] A repository lists its checks in `guard.json`, under `checks`, keyed by a stable name. Each check gives a `command`, where it runs (`runs`: `local`, `ci` or both), and optionally the facts it needs (`facts`), a trusted checker file (`trusted`, F7) and named outcomes for further exit statuses (`outcomes`, F2).

```json
{
  "checks": {
    "unit": { "command": "node --test", "runs": ["local", "ci"] },
    "lineage": { "command": "node engineering/github/lineage.ts", "runs": ["ci"], "facts": ["base", "head"], "trusted": "engineering/github/lineage.ts", "outcomes": { "4": "held" } }
  }
}
```

**F2 Verdicts.** [I2] A check's exit status is its verdict: `0` pass, `1` fail, `2` cannot judge, `3` not applicable. Any other status is cannot judge, unless the check declares a named outcome for it. The only named outcome is `held`: shown as held with its evidence, never as a pass and never as a fail. Guard prints each verdict by its own name, one line per check, as `<verdict>: <check>: <evidence>`, and never collapses one verdict into another. A fail or cannot-judge line is followed by an indented `do: <next step>` line (N4).

**F3 One runner.** [I2, I3] The same runner and the same list serve both the hook and CI.

**F4 Local hook.** [I2, I3] `pre-push` runs the `local` checks. Fail and cannot judge block the push. `--no-verify` skips the hook once, and the hook says that CI decides.

**F5 CI gate.** [I2, I3] Each `ci` check runs in a named CI job that the repository can make required.
- Fail and cannot judge fail the job.
- Not applicable lets the job succeed, reported as not applicable in a notice and in the step summary, never as a pass.
- Held lets the job succeed, with a warning carrying the hold's evidence.

**F6 Narrow adapters.** [I3] The hook and the workflow jobs pass facts and act only on verdicts.

**F7 Trusted checker.** [I1, I2] A check can name a `trusted` file or directory. The runner then runs it as it stands on the target ref (`base`), never the candidate's version, so a candidate cannot certify itself.
- Exactly the files under `trusted` are taken from the base. The checker still reads the candidate's tree, from the repository root, as its input, and runs on the interpreter found on `PATH`.
- So that nothing it loads comes from elsewhere, a trusted checker must be JavaScript or TypeScript modules whose every import is a Node built-in (`node:…`) or a literal relative path to another trusted file.
- Where that cannot be established (another file type, a package import, an import outside the trusted files, a specifier computed at run time, no word of the command naming the trusted path), the check is cannot judge.

**F8 Safe lifecycle.** [I5, I6]
- The package provides `init`, `upgrade` and `remove`.
- Guard writes a file only where none exists. It records each file it writes, with its SHA-256, in `guard.json` under `managed`.
- `upgrade` replaces only managed files that are unmodified.
- `remove` deletes only managed files that are unmodified, and unsets `core.hooksPath` only if Guard set it and recorded that.
- A pre-existing hook, workflow or `core.hooksPath` is never overwritten. Guard reports it and prints the one line to add.
- A modified managed file is left in place and reported.
- An External delivery follows the same rule for the target's existing files.

**F9 Execution contract.** [I2] A `command` is a program and its arguments, written as words separated by spaces, with double or single quotes grouping a word. It has no shell features: no pipes, redirection, variables or comments. The program is started directly. On Windows a `.cmd` or `.bat` program, such as npm, runs only under `cmd`, so each of its words is quoted, and a word holding a character `cmd` reads as syntax (`" & | < > ^ % !`) is cannot judge. An adapter supplies facts to `kaal-guard run` as `--head`, `--base`, `--base-ref` and `--changed <file>`. A check runs as a command, from the repository root, with no stdin. It receives only these facts, as environment variables, when the adapter supplied them:
- `GUARD_HEAD`, the candidate commit;
- `GUARD_BASE` and `GUARD_BASE_REF`, the target commit and its name;
- `GUARD_CHANGED`, a file listing the changed paths, NUL-separated.

Guard does not tell a check where it is running. Equal facts, the same tree, the same command and the same tool versions give the same verdict. A local base from a stale fetch is a different fact, so the verdict may legitimately differ; the hook prints the base it used.

**F10 No silent gate.** [I2, I4] Missing verification never satisfies a gate.
- A command that cannot start is cannot judge.
- A fact a check declares and does not receive is cannot judge.
- A check that is not in `guard.json` is cannot judge.
- A `ci` check that no workflow job names fails Guard's consistency check, `kaal-guard verify`, which runs in CI as the job `Guard`. `verify` reads the workflow files only: it shows that the CI configuration covers every `ci` check. It does not prove that GitHub ran a job, nor that branch protection requires it.

## Nonfunctional (N)

- **N1** [I4, I5] Linux, macOS and Windows. The hook is POSIX `sh`; the runner runs on Node LTS.
- **N2** [I2] Deterministic: no network, no clock dependence and no polling of GitHub.
- **N3** [I5] No state beyond the repository and `core.hooksPath`.
- **N4** [I2, I5] Every fail or cannot-judge verdict says what to do next.
- **N5** [I6] An External delivery is a handful of readable files that the target can maintain on its own, with no KAAL element in them.
- **N6** [I5] The Embed package depends on no other KAAL element, of any kind, and is published to npm as `kaal-guard`, first as `kaal-guard@0.0.1`.
- **N7** [I4] Adopting Guard in KAAL keeps every check identity, OS matrix entry and the coverage of KAAL's existing CI.
