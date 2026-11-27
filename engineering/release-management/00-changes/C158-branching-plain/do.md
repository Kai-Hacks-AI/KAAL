# C158 do

Builds the source of the check 2 replacement on the controls adapter. The installed workflows are unchanged: the source waits for its own WIRE on the Owner's go. Nothing is required, no flag is set and no ruleset is touched.

## What was built

- `05-src/lineage/judge-freshness.mjs` (release/CTL37), `judge-synchronization.mjs` (release/CTL38) and `judge-auto-merge.mjs` (release/CTL39): each runs one verdict of `engineering/github/lineage.ts` (`promotionFreshness`, `synchronization`, `autoMerge`) through `runControl` in detective mode. The answer is `{kind, verdict, findings, message, record}`; `kind` is pass, fail, not-applicable or unknown. Run as a command, each reads its facts with `readFreshness`, `readSync` or `readExpected` and `effectiveMethod`, prints its verdict, its findings and one `kaal-control <record>` line when the run is known.
- `05-src/lineage/lib/answer.mjs`: the check the adapter runs, the answer and the command line they share. It judges nothing.
- `05-src/wiring/workflows/branching-plain.yml`: three jobs, one per verdict, on plain `pull_request`. Each supplies the facts the old workflow did (head, base, default branch, head ref, auto-merge method, the base rules for the default branch) and runs its entry, not `kaal-guard`.
- `04-controls/CTL37-verify-freshness`, `CTL38-verify-synchronization`, `CTL39-verify-auto-merge-method`: the control records, each with Intent release/I50.
- Cases T1577, T1578, T1583, T1584 and T1589 are renamed from `.red.mjs` to `.test.mjs`.

## Departures from the PLAN, recorded

1. **The three job names are quoted.** `Branching: freshness (plain pull_request)` holds `: `, which a plain YAML scalar cannot. T1577 now expects the quoted form. The names are the PLAN's, unchanged.
2. **No delivery map row is written.** The rows are written at the WIRE of the file, with its own go.
3. **A pull request into the default branch has no synchronization to judge, and the reverse.** Each entry says "does not apply" for the other, as the old workflow did. With auto-merge off the method is not judged until it is enabled.
4. **The record has no mode, applied or flag field yet.** Those arrive with controls/C158; the entries take them when the adapter on `main` carries them.

## Reads outside the check

The check is pure over facts. The Git reads and the rules file stay outside it. Facts that cannot be read make the check throw, so the answer is UNKNOWN (exit 2), never a pass.
