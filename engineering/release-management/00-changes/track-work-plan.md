# track Work (PLAN)

Change: release-management/C7

PLAN, nothing is built. It adds `track Work`, a read-only report beside the release controls that answers "what do I work on next" for the CTO and the CPO from one script. The Cases are written inside this PLAN, carried unwired (`04-test/track-work.red.mjs`, T38 to T43); the DO wires them. The mnemonics are `TRACK.md` (Target Releases Are Common Knowledge) and `WORK.md` (Where Ownership Routes Knowledge), as KAAL Definitions.

## Intent

Where the release stands is common knowledge, read the same way by both roles, not carried in a handover (Owner, 10 November: "one simple script which allows us to know what to work next, so the CTO and CPO ask the same script and get their answer as they need it").

- **Work** is a Change's commits at a station, opened or not: a pull request, a branch with no pull request, or a deployment request.
- **The stations** are the ones of the lifecycle, read from each pull request's base: `12-collectors` (a base `kaal/*`), `11-main` (base `main`), `10-npmjs` (publication). Each has in, stock and out.
- **Each piece of Work is in one state:**
  1. **about to close**, CPO work: reviewable, with no approval at the current head.
  2. **in stock**, CTO work: it cannot be reviewed yet (CI red or pending, behind its base, an unresolved conversation, or a failed envelope).
  3. **about to open**, CTO work: a collector ahead of `main` with no promotion pull request, a pushed branch with no pull request, or `main` ahead of the last tag with no Release.
- Approved at the head with auto-merge on is nobody's: it waits in the queue.

## How it fits the release controls

It is not a control. It judges nothing, authorizes nothing and changes no check, ruleset or gate. It reads the facts the controls hold and the verdicts they gave (checks, review threads, approvals at a head, auto-merge, the Envelope), and sorts them. Hooks give feedback, CI gives evidence, the gate and ruleset authorize; `track Work` tells who acts next, so the controls are the only place a rule lives (one place, used against other places). A rule it needs that no control states, it reports as a gap and does not invent. It sits in `release-management/05-src/track-work/`, a peer component with no `uses` edge to a control's source.

## Requirements

- **W1. One line per piece of Work:** station, the pull request or branch, the C id, the full head SHA, the state, and what it waits on.
- **W2. The state is derived** from the facts above by one rule, so two readers cannot disagree. A new push moves the Work back to in stock, because the approval no longer matches the head.
- **W3. `--role cto|cpo` is required;** cto lists about to open and in stock, cpo lists about to close. A call without a role is refused with usage. The pure sorting returns every kind to its caller (the three kinds are the report's model) but is not a role-facing report.
- **W4. The envelope is a verdict read, never a rule copied.** The report reads the verdict of the Envelope control (its check run) as a fact: `fail` puts the Work in stock; no verdict is `unknown`, shown as "envelope unknown (provisional)", which neither puts the Work in stock nor counts as a pass. The component holds no checker of the title or commit form, so it makes no independent or authoritative claim of compliance; the commit form has no control yet and is `unknown` until its check exists.
- **W5. The judgment is a pure function of data the caller gathers;** gathering is a thin step (one GraphQL call through `gh`, plus branch and tag facts), mapped by a pure function. It writes nothing.
- **W6. At `10-npmjs`** the deployment request to the protected `npm` environment plays the role of the pull request.

## Use or build

Use `gh` and its GraphQL for the facts; build only the sorting. No dependency is added.

## Cases (T38 to T43, unwired)

T38 in stock: red or pending CI, behind, unresolved conversation. T39 the envelope is the control's verdict, unknown is provisional. T40 about to close. T41 queued, auto-merge off, a new push. T42 about to open: a branch with no pull request, a collector ahead of `main`, `main` ahead of the last tag. T43 `--role` filtering, a call without a role refused, and the GraphQL mapping.

## Sequence

1. This PLAN (`release-management/C7 PLAN`) with the two Definitions and T38 to T43.
2. DO (`release-management/C7 DO`) after the PLAN is approved: the component, the Cases moved next to it and wired into `test:engineering`.

## Open for the Owner and CPO

- Whether it later moves into the release Skill (`kaal-release`, a separate PLAN); the component is plain and moves as it is.
- Any approval at the head counts as the CPO's; Work beyond the first 100 pull requests is not read.
- The `10-npmjs` deployment request needs a source the DO may read; if none is readable without a token the report says so for that station.

## Not in this Change

Wiring it into a workflow or hook; comments on pull requests; any change to a check, ruleset or gate.
