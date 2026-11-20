# C105 change

## PLAN

1. Add the drafts in `interface.md` (I54, F77, A68 amended; F81, A72, CTL25 `hold History`, CTL26 `verify History held`; the `promoting.json` source, the declaration for `stages.json`, the partner's judge) and the Cases T1270 to T1278, all RED.
2. Observe the expected RED and that each Case can pass with the drafts as the DO's files (`evidence.md`).
3. The PLAN changes no source, no ruleset, no declaration and no setting outside the drafts, and deletes nothing.

## Mechanism

- **A control is explained by what it controls.** release/CTL25 `hold History` is preventive and has release/I54: the history of `main` is never rewritten. Its realization, a rule of the ruleset, is the station's business: `stages.json` declares an entry for it in the Promoting stage, traced to release/CTL25, and the ruleset source `promoting.json` carries `{ "type": "non_fast_forward" }` (no parameters) after the required checks, so `verify Stages` (which already compares rule types and settings and traces each rule to a control with an Intent) judges the source against the declaration. Enforcement stays active and the bypass list empty, which the Case holds and the judge already enforces. The titles and descriptions of the controls, and the Requirement release/F77, say what is controlled and no word of ruleset, workflow or script; T1273 and T1271 hold that.
- **The station owns its list.** The entries of the Promoting stage are rules the station holds and the detections it requires, each traced to the control it realizes. A detection does not name a station. Detective controls we build can be made preventive by CI; that preventive effect keeps its own row in the control table, named by what it controls. release/CTL5 and release/CTL20 (and likely release/CTL10) stay preventive controls and are renamed and re-explained in later slices.
- release/CTL26 `verify History held` is detective and has release/I54: `judgeHeld({ declared, live, control })` over the stage's declared entries, the rules in force and a control id. PASS when every entry declared for the control is in force with its declared settings (and, for a status-check entry, every declared check is among the checks in force), FAIL naming each entry that is not, UNKNOWN when either side is not a list of rules, the station declares nothing for the control or no control is given. Entries of other controls are not its business and a rule in force that is not declared is no finding (the old ruleset may hold more during the transition). It reads no source, no Git and no network; the wiring hands the lists. The same judge serves any control realized as a rule.
- release/CTL22, its judge, its workflow source and its Cases are removed by the DO. Its elements I54, F77 and A68 are reworded for the preventive control; their old equal-to-draft Cases are replaced by T1270 to T1272 (F77 and A68 move to `F77-hold-history` and `A68-hold-history`).
- The declared evidence of CTL25 is two fixture runs, two real observations (in force when loaded, and after the old rule is retired) and one provoked failure (a force-push refused on a scratch branch under an equivalent live ruleset, accepted without it); the provoked run needs the Owner to create that scratch ruleset. CTL26's evidence is the fixture runs, one real run and the fixture with the declared entry missing as its failure.
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
