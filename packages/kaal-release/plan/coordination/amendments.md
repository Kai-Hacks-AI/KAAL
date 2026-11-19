# analyze Flow: the exact amendments to #1350

**Status (12 Nov 2026):** #1350 landed already carrying edits 2, 4, 5, 6, 7, 8 and 9 in its own words. The remaining edits 1, 3 and 10, and the pointers that said the contract was still to come, are applied by the PLAN that merges this note. The table below is the original list and is kept for trace.

#1350 is approved at its exact head and waits on its normal route. This PLAN does not touch its files. When #1350 is in `kaal/release/plan`, one commit on this branch (the collector merged into the head first) applies exactly the edits below, so the repository never holds two contradictory statements. They are listed now so the CPO reviews them with this PLAN. All paths are under `packages/kaal-release/plan/release/`.

| # | File | Old | New |
| --- | --- | --- | --- |
| 1 | `00-changes.md`, route | `3. Acceptance on the packed artifact in a clean directory.` | `2a. The analyze Flow Script and its Cases (coordination/C1), once the package shape exists.` then `3. Acceptance on the packed artifact in a clean directory.` |
| 2 | `00-changes.md`, Open for the Owner 2 | `2. Skill-only 0.0.1 (default) or with a first Script.` | `2. Resolved by the Owner (12 Nov 2026): 0.0.1 ships a first Script, the analyze Flow Script (coordination/C1).` |
| 3 | `00-changes.md`, USE vs BUILD | after the `Version comparison script` row | add `\| analyze Flow script \| BUILD in 0.0.1 \| Listing the next release action must repeat exactly and needs no judgment; see coordination/C1. \|` |
| 4 | `requirements.md`, N3 | `ships no Script, and does not verify anyone's release.` | `ships one read-only Script (coordination/C1), and that neither verifies anyone's release.` |
| 5 | `testing.md`, T9 | `the README states Skill-level, no Script, no verification` | `the README states Skill-level guidance with one read-only Script, and no verification` |
| 6 | `intent.md`, I5 | `What must repeat exactly may become a Script later, and is not in 0.0.1.` | `What must repeat exactly is a Script; 0.0.1 has one, the analyze Flow Script (coordination/C1).` |
| 7 | `architecture.md`, Shape | `skills/kaal-release/references/npm.md  (F4)` | the same line, then `skills/kaal-release/scripts/analyze-flow.mjs  (coordination/C1)` |
| 8 | `architecture.md`, verification table | `none shipped; KAAL's release engine is a KAAL realization, not part of the product` | `one read-only Script, analyze-flow.mjs, which lists the next release actions and recommends only (coordination/C1); KAAL's release engine stays a KAAL realization, not part of the product` |
| 9 | `architecture.md`, paragraph after the table | `0.0.1 ships the non-deterministic element only. A deterministic element for the reusable product is a later Change with its own USE vs BUILD (see 00-changes.md); the Owner's default is Skill-only.` | `0.0.1 ships the non-deterministic element and one deterministic element, the analyze Flow Script (coordination/C1; Owner, 12 Nov 2026). Any further Script is a later Change with its own USE vs BUILD.` |
| 10 | `architecture.md`, BASS allocation | before the row `Verifying a published artifact` | add `\| Listing the next release actions \| Script (analyze-flow.mjs, coordination/C1) \|` |

Not changed: F5, N2, T5 and T8. Both already cover the Script, since T5 scans shipped files and N2 forbids a KAAL runtime dependency. The Script is shipped under `skills/`, which the package's `files` list includes, as `kaal-engineer-skill` ships its own `scripts/`.

## Revision of 12 Nov 2026 (CPO alignment on #1476)

The capability is a point-in-time view of where work is in the production chain, not a release-readiness evaluator. `requirements.md` is revised accordingly: the output is a board (stations, transports, pieces, queue, WIP, constraints, not observed), the next move is a production activity (PLAN, DO, CHECK, ACT, SYNCHRONIZE, PROMOTE) with a comment, waiting is an observed condition, and nothing is a verdict. F5, F11 and the output of F4 are replaced; F7 and the readiness and freshness-gate behaviours leave the contract; F18 is new. `testing.md` lists the revised Cases T28 to T32 (RED, run by hand), the Cases that stay and are re-pointed in the DO, and the Cases withdrawn. The Script in this DO still prints actions until the CPO re-reviews this contract; nothing is implemented against it yet. The supplier, its readers, the declaration's observation parts, the delivery provenance and the live-run evidence are retained. Shared host observations will be coordinated with the independently owned elements proposed in #1466 (E1 the observation contract, E2 the GitHub observer); Pull Promotion does not depend on this capability.

## Revision of 12 Nov 2026 (v1, CPO GO on #1476)

The contract and Cases are reduced to the landing-first Show WIP v1: one line per open piece (`#ref TYPE from → into DISPOSITION reason`), WORK, REVIEW, WAIT or UNKNOWN from observed facts, and a small explicit mapping to stations. `requirements.md` and `testing.md` are replaced; coordination/T1 to T32 are withdrawn (in the branch history) and coordination/T33 to T39 are the Cases. The queue, WIP limit, pairs, deliveries, holds, freshness and readiness rules, the activity vocabulary, E1/E2 and the earlier supplier are out of this delivery and deferred.
