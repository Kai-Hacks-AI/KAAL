# C18 change

## PLAN

1. Add C18 with its Cases T82 (G22, the declaration) and T83 (G23, a merge group reports), moved unchanged from release/C5, where they were first written.
2. The Cases are RED on `main`: no workflow and no declaration are there. They stay RED until the wiring is on `main`.
3. The PLAN installs nothing and changes nothing of release/C5.

## DO

1. The two workflows `release-analyze-vulnerabilities-integration.yml` and `release-analyze-vulnerabilities-promotion.yml` travel alone in the `.github` collector `kaal/release/wire-analyze-vulnerabilities` and reach `main` first, because Change Isolation keeps `.github` apart from engineering. They report harmlessly until the declaration lands, and no ruleset requires them.
2. The Guard declaration `.kaal/config/guard/Analyze-Vulnerabilities.md` travels in this collector, `kaal/release/wire-analyze-vulnerabilities-engineering`, and reaches `main` second, because a `runs: [ci]` declaration without its workflow job fails `kaal-guard verify`. The DO is the Cases renamed from `T<n>.red.mjs` to `T<n>.test.mjs` once the workflows are on `main` and this collector is synchronized.
3. The first `analyze Vulnerabilities (Promotion)` result on a merge group is observed at the promotion of the workflows, and recorded as acceptance A4 of release/C5.

## Amendment: source before install, a new ruleset beside the old

Kai's direction of 14 November: templates and wiring are owned by Engineering, kept on `main`, and installed afterwards; everything testable is tested outside the danger zone (`.github`, `.githooks`, live rulesets) first; several controls sit next to each other; new controls are wired onto new rulesets, not added to the existing ones. The existing rulesets 24952357 and 24951062 are renamed with the prefix `old`, drain, and are dropped later. This amendment supersedes S4 of release/C5 `transition.md` and `ruleset-needs.json` for this control.

1. Add F20 (wiring-source-before-install), A44 (wiring-source), A45 (wiring-install) and the gap G59, with the Cases T202 (workflow sources), T203 (ruleset sources), T204 (installed equals source) and T205 (the source area holds many controls, named by control and target). The layout is `05-src/wiring/workflows/<control>-<target>.yml` and `05-src/wiring/rulesets/<target>.json`, whose required contexts are an array that many controls contribute to.
2. T202, T203 and T205 judge the sources on `main`, so they turn green before anything is installed. T204 is red until the install. Each judgment is shown on fixtures of known shape in the Case itself.
3. The new ruleset requires only contexts that a source workflow reports for pull requests and for the merge group, and it does not require the branch to be up to date. The Integration workflow therefore gains a `merge_group` trigger in its source.
4. Order of the DO: the sources and the Cases T202, T203 and T205 in this collector; then the install of the workflows, equal to their sources, alone in `kaal/release/wire-analyze-vulnerabilities` (the workflow DO #1510 is brought equal to its source, which adds the merge group to Integration); then the Guard declaration (T82); then the first merge-group result is observed (A4 of release/C5); the new rulesets are applied from their sources only on the Owner's go.
5. Naming of the area and the collectors is proposed here and confirmed by the CPO on this PR.

## ACT

1. A 4L retrospective of the Change, from the viewpoint of the agent that carried it, in `act.md`. It lands in the collector before the promotion.

## Not in this Change

Ruleset changes, required checks, the retirement of `dependency-review.yml`, the interpreter and the adapter, and any other control.

## Dependencies

release/C5 comes first. This Change wires what it delivers, unchanged.
