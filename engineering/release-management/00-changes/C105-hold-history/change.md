# C105 change

## PLAN

1. Add the drafts in `interface.md` (I54, F77, A68 amended; F81, A72, CTL25, CTL26; the `promoting.json` source, the declaration for `stages.json`, the partner's judge) and the Cases T1270 to T1278, all RED.
2. Observe the expected RED and that each Case can pass with the drafts as the DO's files (`evidence.md`).
3. The PLAN changes no source, no ruleset, no declaration and no setting outside the drafts, and deletes nothing.

## Mechanism

- release/CTL25 is preventive and has release/I54. The requirement is a rule in the ruleset source, `{ "type": "non_fast_forward" }` (no parameters), after the required checks; the declaration in `stages.json` lists it in the Promoting stage, traced to release/CTL25, so `verify Stages` (which already compares rule types and settings and traces each rule to a control with an Intent) judges the source against it. Enforcement stays active and the bypass list empty, which the Case holds and the judge already enforces.
- release/CTL26 is detective and has release/I54: `judgeHeld({ rules })` over the list of rules in force, PASS when `non_fast_forward` is in it, FAIL when not (an empty list included), UNKNOWN when the input is not a list of rules or cannot be read. It reads no source, no Git and no network; the wiring hands it the rules.
- release/CTL22, its judge, its workflow source and its Cases are removed by the DO. Its elements I54, F77 and A68 are reworded for the preventive; their old equal-to-draft Cases are replaced by T1270 to T1272.
- The declared evidence of CTL25 is two fixture runs, two real observations (rule in force when loaded, and after the old rule is retired) and one provoked failure (a force-push refused on a scratch branch under an equivalent live ruleset, accepted without it); the provoked run needs the Owner to create that scratch ruleset. CTL26's evidence is the fixture runs, one real run and the fixture without the rule as its failure.

## Accept list (DO)

Existing Cases that fail once the DO makes the change, found by running the runner on a throwaway copy; none is skipped or disabled, each is amended to the new truth or retired, and each is named in the DO pull request:

- release/T481, T482, T483 (the promoting source and the six rulesets: rule list), T511 and T512 (the whole-structure judge Cases that count the Promoting rules), T1132 (the promoting source requires verify Triggers as a third check, which states the exact rule list).
- release/T1174, T1175, T1176: the old texts of I54, F77 and A68; replaced by T1270 to T1272.
- release/T1173, T1177 to T1180 (CTL22's Cases) go with CTL22.
- controls/T1095 asks a preventive control for at least two real runs; CTL25 declares two, so it stays green and is not on the list.

## Installation, timing and risks

- **Order, so that no moment is unprotected:** the DO reaches `main`; then the Owner loads the `promoting.json` source into the live `promoting` ruleset (the ruleset update procedure, his explicit go); then the rule is observed in force; then the Owner retires `non_fast_forward` of the old ruleset. Deleting a rule of the old ruleset is not claimed here.
- **Nothing is installed by this Change.** No workflow, no ruleset load, no setting.
- **The old rule and the new one overlap** for a while on purpose; both refuse the same pushes.
- **Dependency, named:** Hosting reading the rules in force for a branch (a later slice of CTL26).
