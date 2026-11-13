# Pull Promotion wiring: the engineering Cases log scoped ids in CI (Change A to B)

This is `pull/C6`, a PLAN Change. It ships no code. It carries out the Owner's decision (wire CI) after the CPO's HOLD on the `kaal/release/plan` promotion: the advisory report finds no scoped execution for the engineering Cases at the head.

## A: the present

CI's `Engineering` check runs `npm run test:engineering`, a fixed list of `node --test` files. The Case files under `engineering/*/00-changes/*/T<n>.test.mjs` are not in it, so no job log holds `✔ <scope>/T<n>` for them. Pull Promotion reads only such lines, so every collector that expects those Cases does not qualify.

## B: the target

One test file, `engineering/cases/cases.test.mjs`, is part of `test:engineering`. It discovers every `T<n>.test.mjs` under `engineering/*/00-changes/*/` and registers one `node:test` test per Case, named `<id> (<tests>): <title>`. The job log then holds `✔ <id>` or `✖ <id>` per Case and the gatherer reads it unchanged. See [requirements.md](requirements.md) and [testing.md](testing.md).

## Not in this Change

No ruleset, required-check or hook change. No change to the gatherer, the declaration or the Script. No retirement of any control. The `plan/<change>/` Cases (bare ids). No change to how Cases are written. A Case that fails or cannot run in CI is reported, never skipped or quarantined.

## Order

PLAN (this), then DO (the test file and the `test:engineering` entry), then the collector's ACT, then SYNC and PROMOTION. Collector: `kaal/release/wire-pull`, from `main`.

## ACT: retrospective (4L)

Written by the agent that carried the Change.

### Liked

- T34 failed for the right reason before any code existed (the Cases file was absent) and went green with one small file plus one script entry. The wiring stayed inside the existing `Engineering` check: no new job, required check or ruleset.
- The CPO's correction to T34 (a RED Case is execution evidence, not missing evidence) made the Case stronger: it now proves that a failing Case is logged as `✖`, read as a failure and fails the file, so qualification stays blocked by a RED Case.
- Running the real log output through the real gatherer gave integration evidence that does not depend on the collectors being merged: 82 successes and a RED fixture read as a failure.

### Learned

- Wiring CI to run existing Cases is also an audit of them. Within minutes it exposed nine Hotfix Cases that had been landed ahead of their template and never ran. The right fix was ownership and activation timing (a Case becomes active with the thing it checks), not suppression.
- My first runner found only the Cases under `00-changes/`, 31 of 91. The declaration already defined the true shape, so the runner should have been written from the declaration instead of from the first folder I looked at. The coordinator's cross-check from the HOTFIX thread caught it.
- A PLAN's Case must be runnable on the collector it is merged into. T34 imported code from a collector that had not been promoted, so it was approved but could not run. That was found only when the DO started.
- A child `node --test` process inside a test inherits `NODE_TEST_CONTEXT` and then reports to its parent instead of printing log lines. It must be removed from the environment.

### Lacked

- A check that a PLAN's RED Case can run on the collector it targets. It would have caught the T34 dependency at the PLAN.
- A single list of where engineering Cases live. The declaration holds it for the report, but nothing derives the CI runner from it, so the two can drift apart again.
- A Hotfix-free baseline: until the HOTFIX delivery lands, nine Cases are recorded in `case-transfer.md` and are absent from CI.

### Longed For

- Deriving the runner's discovery from the declaration's Case patterns, so the report's expectation and CI's execution are one definition.
- The HOTFIX delivery restoring the nine Cases green in the same pull request as the template, which closes the transfer.
- The same wiring for the `packages/*/test` Cases that the declaration also expects, which this Change did not cover.
