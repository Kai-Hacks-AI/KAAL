# C120 change

## PLAN

The order is the point: the judge first, into `main`, then the names (the DO of release/C106, which waits for this Change to be on `main`).

### Decisions (the PLAN's recommendations; the approval of this pull request is the go)

1. `stages.json` gains `ruleset` on Integrating, on each of its parts (Hotfixing, Wiring, Collecting), on Promoting and on Publishing, with the names the sources have today: `integrating`, `hotfixing`, `wiring`, `collecting`, `promoting`, `publishing`. Developing has no ruleset.
2. `judge.mjs` compares each source's `name` with the name its stage declares and holds no name in code. A stage that declares no name, or one that is not a string or is empty, is a finding that names the stage (fail closed). Everything else the judge decides is unchanged.
3. The release/C106 DO then changes the declared names to the numbered ones and renames the six sources in one pull request; the trusted judge by then compares with the declaration, so that pull request passes. C106's PLAN is otherwise as approved; its steps 2 (judge) moves here and step 1 (declaration) is done here at the present names.
4. Requirement `release/F82` (the draft in the C106 interface) is added by the C106 DO, where the numbered names are; this Change serves release/I27 (the stages are intact).

### Cases the DO adds (ids chosen free in the DO), in Given-When-Then

- **The declared name decides.** Given the real sources and declaration, the judge passes. Given a stage whose declared name is changed alone, it fails naming the ruleset and both names, for each of the six. Given the declared name and the source's name changed together, it passes: no name is held in code.
- **No name fails closed.** Given a stage that declares no name, an empty one, a number, null or a list, the judge fails and the finding names the ruleset, for each of the six.
- **Nothing else changes.** Given a departure in rules, refs, target or bypass, the same checks fail as before.

The Cases travel with the source in the DO (the phase judge that would excuse a RED Case at PLAN does not exist yet).

## Ids

Change `release/C120`. No new Intent, Architecture or control: release/I27, its Architecture and release/CTL1 stay as they are.

## DO

On the merged PLAN, into this collector, with the Cases:

1. `stages.json` and `judge.mjs` as in decisions 1 and 2, and the Cases above, plain `.test.mjs`, next to the judge in `05-src/stages/`.
2. The accept list: none expected (the sources keep their names); any Case that pinned the judge's literal names is amended in the DO.

## What this does not do

It renames nothing, installs nothing and touches no ruleset in force or `.github`. After its PROMOTION lands, the C106 DO is rebased on `main` by a SYNC and its pull request (#2222, closed meanwhile) is opened again.

## ACT

A 4L retrospective in the ACT before the promotion; one retro for the collector.
