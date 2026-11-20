# C105 change

## PLAN

1. Add the drafts in `interface.md` (I54, F77, A68 amended; F81, CTL25 `hold History`, CTL26 `verify History held`; the `promoting.json` source, the declaration for `stages.json`, the partner's judge) and the Cases T1270 to T1278, all RED.
2. Observe the expected RED and that each Case can pass with the drafts as the DO's files (`evidence.md`).
3. The PLAN changes no source, no ruleset, no declaration and no setting outside the drafts, and deletes nothing.

## Mechanism

- **control -> Intent: a control stays thin.** CTL25 and CTL26 say in a paragraph what they control and point to release/I54; the details live in the Intent and the Requirements and Architecture under it (release/F77 for holding the history, F81 for observing it, and A68, the one Architecture element for the ruleset of the Promoting station, which addresses both and, later, the Requirements of its other entries, with the declaration, the judge, the order of operation and the evidence plan). The judge of CTL26 takes a control id, so it serves every control realized as a rule.
- **A control is explained by what it controls.** release/CTL25 `hold History` is preventive and has release/I54: the history of `main` is never rewritten. Its realization, a rule of the ruleset, is the station's business: `stages.json` declares an entry for it in the Promoting stage, traced to release/CTL25, and the ruleset source `promoting.json` carries `{ "type": "non_fast_forward" }` (no parameters) after the required checks, so `verify Stages` (which already compares rule types and settings and traces each rule to a control with an Intent) judges the source against the declaration. Enforcement stays active and the bypass list empty, which the Case holds and the judge already enforces. Whether a name or a description says what is controlled is a judgement of the review, not a Case: no Case greps words.
- **Decomposition.** release/A72 `github` is the platform component, the parent in the decomposition of components; release/A68, the ruleset of the Promoting station, has `parent: release/A72`, the `parent` edge that the Architecture elements of release management already use (release/A15 under release/A14, and so on). Release engineers the component using the Hosting capability: reading the rules in force, for example, goes through Hosting (a later slice). Hosting being a capability, what it owns is a separate dialogue. No shared GitHub component existed: the `github` elements that exist are each the deployment target of a single control (A2, A15, A26, A30, A32, A37, A38, A39) and are not touched here. A72 addresses what its child addresses, as release/A14 addresses what release/A15 does.
- **One ruleset element.** The ruleset of a station is one Architecture element that addresses many Requirements, so every entry is tested with the same shape (the declared entry is in force, which `verify Stages` and the judge of CTL26 already do generically) and none gets an element of its own. The existing Architecture elements that address the same source (for instance release/A63 for release/F68) are not touched here and fold into A68 as their entries migrate.
- **The station owns its list.** The entries of the Promoting stage are rules the station holds and the detections it requires, each traced to the control it realizes. A detection does not name a station. Detective controls we build can be made preventive by CI; that preventive effect keeps its own row in the control table, named by what it controls. release/CTL5 and release/CTL20 (and likely release/CTL10) stay preventive controls and are renamed and re-explained in later slices.
- release/CTL26 `verify History held` is detective and has release/I54: `judgeHeld({ declared, live, control })` over the stage's declared entries, the rules in force and a control id. PASS when every entry declared for the control is in force with its declared settings (and, for a status-check entry, every declared check is among the checks in force), FAIL naming each entry that is not, UNKNOWN when either side is not a list of rules, the station declares nothing for the control or no control is given. Entries of other controls are not its business and a rule in force that is not declared is no finding (the old ruleset may hold more during the transition). It reads no source, no Git and no network; the wiring hands the lists. The same judge serves any control realized as a rule.
- release/CTL22, its judge, its workflow source and its Cases are removed by the DO. Its elements I54, F77 and A68 are reworded for the preventive control; their old equal-to-draft Cases are replaced by T1270 to T1272 (F77 moves to `F77-hold-history`, A68 to `A72-github/A68-promoting-ruleset`).
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
