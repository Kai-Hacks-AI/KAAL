# C35 ACT: retrospective (4L)

Written by the agent that carried the Change.

## Liked

- The judge is small and reads only sources: one function over three facts (the stage declaration, the ruleset sources, the `.githooks` file list), so every Case runs it on fixtures and on the real files.
- Each branch ruleset requires exactly one check named after itself, so the effective checks of a head are readable straight from its rulesets, and C16 needed no change.

## Learned

- Three rounds of naming and scope (legacy controls, one check, the activity vocabulary) were each cheaper before any code: the Owner's rulings came as questions about what the check checks, and the answer was the structure itself.
- A check that is red on `main` cannot be green on any head, so judging `.githooks` in level 1 made a cycle with #1705. The Owner caught it; level 1 now judges only what exists before #1705 and Developing is judged by a later Change. Publishing is judged by the Promoting job because a tag ruleset cannot carry a check.
- A tag ruleset cannot be empty; the smallest rule (`update`) is what lets the stage exist.

## Lacked

- The workflow that reports these jobs is a separate `.github` step; until it lands nothing can require the checks.
- Levels 2 and 3 (live equals source) are not built; nothing verifies what the Owner installs.
- release/C18's `integration.json` and `promotion.json` on its collector now overlap with the renamed `integrating.json` and `promoting.json`; they must be reconciled after that collector is synchronized.

## Longed For

- The `.github` workflow alone, then the Owner installs `integrating` and `wiring`, #1705 lands, then the rest.

## Follow-ups

- A later Change adds the `.githooks` judgement (dispatcher, `old/`, `new/`) to the Wiring job, after #1705 has landed.
- `.github`: workflow `Engineering` with the five jobs.
- Level 2 (wired up in GitHub) and level 3 (Engineering = GitHub) as their own Changes.
- Controls migrate one at a time into these rulesets, analyze Vulnerabilities first; each with verification before the old enforcement retires.
