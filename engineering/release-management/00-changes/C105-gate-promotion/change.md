# C105 change

## PLAN

1. Add the drafts in `interface.md` (I54, F77, A68 amended; F81, A72, CTL25 `gate Promotion`, CTL26 `verify Promotion gate`; the `promoting.json` source, the declaration for `stages.json`, the partner's judge) and the Cases T1270 to T1278, all RED.
2. Observe the expected RED and that each Case can pass with the drafts as the DO's files (`evidence.md`).
3. The PLAN changes no source, no ruleset, no declaration and no setting outside the drafts, and deletes nothing.

## Mechanism

- release/CTL25 `gate Promotion` is preventive and has release/I54 for now. The real prevention is the CI of the station: the ruleset requires the checks the detections report and holds the rules the station declares. The requirement of this slice is a rule in the ruleset source, `{ "type": "non_fast_forward" }` (no parameters), after the required checks; the declaration in `stages.json` lists it in the Promoting stage, traced to release/CTL25, so `verify Stages` (which already compares rule types and settings and traces each rule to a control with an Intent) judges the source against it. Enforcement stays active and the bypass list empty, which the Case holds and the judge already enforces.
- **The station owns its list.** The required rules and checks are the stage's declaration in `stages.json`; the detections (CTL2, CTL19, the sync checks, and the rest) stay detective and do not name a station. The table of the controls does not have to show what a control gates; the station declaration says it.
- release/CTL26 `verify Promotion gate` is detective and has release/I54: `judgeGate({ declared, live })` over the stage's declared rules and the rules in force, PASS when every declared rule is in force with its declared settings and every declared required check is among the checks in force, FAIL naming each missing rule, check or setting, UNKNOWN when either side is not a list of rules or the station declares nothing. A rule in force that is not declared is no finding (the old ruleset may hold more during the transition). It reads no source, no Git and no network; the wiring hands the lists. The first slice therefore also watches the three required checks, not only `non_fast_forward`.
- release/CTL22, its judge, its workflow source and its Cases are removed by the DO. Its elements I54, F77 and A68 are reworded for the gate; their old equal-to-draft Cases are replaced by T1270 to T1272 (F77 and A68 move to `F77-gate-promotion-history` and `A68-gate-promotion-history`).
- The declared evidence of CTL25 is two fixture runs, two real observations (declared rules in force when loaded, and after the old rule is retired) and one provoked failure (a force-push refused on a scratch branch under an equivalent live ruleset, accepted without it); the provoked run needs the Owner to create that scratch ruleset. CTL26's evidence is the fixture runs, one real run and the fixture with a declared rule missing as its failure.
- **How GitHub lists the rules of several rulesets** (one entry per ruleset, or merged) is observed in the real run of CTL26; the judge unions the checks of the rules of a type and needs one rule of that type with the declared settings, so either shape passes.

## Accept list (DO)

Existing Cases that fail once the DO makes the change, found by running the runner on a throwaway copy; none is skipped or disabled, each is amended to the new truth or retired, and each is named in the DO pull request:

- release/T481, T482, T483 (the promoting source and the six rulesets: rule list), T511 and T512 (the whole-structure judge Cases that count the Promoting rules), T1132 (the promoting source requires verify Triggers as a third check, which states the exact rule list): each amended to the new truth, the rule list now including `non_fast_forward`.
- release/T1174, T1175, T1176: the old texts of I54, F77 and A68; replaced by T1270 to T1272.
- release/T1173, T1177 to T1180 (CTL22's Cases) go with CTL22.
- controls/T1095 asks a preventive control for at least two real runs; CTL25 declares two, so it stays green and is not on the list.

## Installation, timing and risks

- **Order, so that no moment is unprotected:** the DO reaches `main`; then the Owner loads the `promoting.json` source into the live `promoting` ruleset (the ruleset update procedure, his explicit go); then the rule is observed in force; then the Owner retires `non_fast_forward` of the old ruleset. Deleting a rule of the old ruleset is not claimed here.
- **Nothing is installed by this Change.** No workflow, no ruleset load, no setting.
- **The old rule and the new one overlap** for a while on purpose; both refuse the same pushes.
- **Dependency, named:** Hosting reading the rules in force for a branch (a later slice of CTL26).
