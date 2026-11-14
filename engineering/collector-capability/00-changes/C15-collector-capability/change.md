# engineering/C15 change: collector capability check

Provisional ids: C15 and T268-T272 were not checked for global uniqueness over every remote branch.

## PLAN

1. Add a pure function `collectorCapability(ref, admittedNames)` returning PASS, FAIL or UNKNOWN for a branch `kaal/<capability>/<leaf>`. UNKNOWN never passes.
2. `admittedNames` is built from the tree at the default branch's tip, never from the pull request head: Core's `evaluate` admits the tree, Graph `typed()` lists the CASE Nodes of the four kinds, and a name maps to a segment by lowercasing and hyphenating spaces (reusing `engineering/inventory/attribute.mjs`).
3. The check is report-only. No ruleset, workflow install or hook is part of this Change; enforcement is the Owner's decision on a new ruleset beside the old ones.
4. No second registry and no new Core field. Which owners without a Node (`architecture`, `engineering`) are legitimate is the CPO decision in `assessment.md` (a, b or c); the Cases below do not decide it.

## Cases (all RED on main: the module does not exist)

- T268: kaal/release/x is PASS when a Node named Release is admitted.
- T269: kaal/retro/x is FAIL when no Node named Retro is admitted.
- T270: a main tree that cannot be read gives UNKNOWN.
- T271: a Node introduced only in the pull request head does not make its segment PASS.
- T272: a flat or `kaal/old/*` ref is reported as outside the form, not as a capability.
