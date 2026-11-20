# Concluding ACT: kaal/release/wire-pull

The qualification retrospective for the whole collected work, written by the agent that carried the collector. The collector carries one Change, `pull/C6`, so that its PLAN, DO and Change retrospective are the history of how it went.

### Liked

- The wiring is small and stays inside the existing `Engineering` check. It makes every engineering Case log `✔` or `✖` under its scoped id, which is exactly what Pull Promotion reads, with no change to the gatherer, the declaration or the Script.
- A RED Case stays visible: it logs as a failure and fails the file. That is the property the CPO asked T34 to prove.
- The collector stayed independent of `kaal/release/plan`: T34 is self-contained and the real gatherer is covered by recorded integration evidence.

### Learned

- Running the Cases in CI exposed nine Hotfix Cases that had landed ahead of their template. Cases should become active with what they verify.
- The runner has to be written from the declaration's Case shape, not from the first folder that holds Cases. My first version found 31 of 91.
- A PLAN's RED Case has to run on the collector it targets.

### Lacked

- Any derivation of the CI runner's discovery from the declaration, so the two are separate definitions that can drift.
- Wiring for the `packages/*/test` Cases that the declaration also expects.
- The nine Hotfix Cases in CI, until the HOTFIX delivery restores them with the template (`case-transfer.md`).

### Longed For

- One definition of where Cases live, shared by the report and the CI runner.
- The HOTFIX delivery restoring the nine Cases green together with the template.
- A live qualification run once the collector is on `main` and `kaal/release/plan` is synced, to show the scoped executions at the exact head.
