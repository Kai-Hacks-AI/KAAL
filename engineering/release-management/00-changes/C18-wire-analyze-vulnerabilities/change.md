# C18 change

## PLAN

1. Add C18 with its Cases T82 (G22, the declaration) and T83 (G23, a merge group reports), moved unchanged from release/C5, where they were first written.
2. The Cases are RED on `main`: no workflow and no declaration are there. They stay RED until the wiring is on `main`.
3. The PLAN installs nothing and changes nothing of release/C5.

## DO

1. The two workflows `release-analyze-vulnerabilities-integration.yml` and `release-analyze-vulnerabilities-promotion.yml` travel alone in the `.github` collector `kaal/release/wire-analyze-vulnerabilities` and reach `main` first, because Change Isolation keeps `.github` apart from engineering. They report harmlessly until the declaration lands, and no ruleset requires them.
2. The Guard declaration `.kaal/config/guard/Analyze-Vulnerabilities.md` travels in this collector, `kaal/release/wire-analyze-vulnerabilities-engineering`, and reaches `main` second, because a `runs: [ci]` declaration without its workflow job fails `kaal-guard verify`. The DO is the Cases renamed from `T<n>.red.mjs` to `T<n>.test.mjs` once the workflows are on `main` and this collector is synchronized.
3. The first `analyze Vulnerabilities (Promotion)` result on a merge group is observed at the promotion of the workflows, and recorded as acceptance A4 of release/C5.

## ACT

1. A 4L retrospective of the Change, from the viewpoint of the agent that carried it, in `act.md`. It lands in the collector before the promotion.

## Not in this Change

Ruleset changes, required checks, the retirement of `dependency-review.yml`, the interpreter and the adapter, and any other control.

## Dependencies

release/C5 comes first. This Change wires what it delivers, unchanged.
