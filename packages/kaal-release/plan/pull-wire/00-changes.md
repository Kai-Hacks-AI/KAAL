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
