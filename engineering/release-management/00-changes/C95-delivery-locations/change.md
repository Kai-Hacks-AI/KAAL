# C95 change

## PLAN

1. Add the drafts in `interface.md` (the Intent, the Requirement, the Architecture, the declaration, the reader, and the changed `final-step.mjs` and `wire-judge.mjs`) and the Cases T1159 to T1164, all RED, next to the elements they test.
2. Observe the expected RED, and that each Case can pass with the drafts as the DO's files (`evidence.md`).
3. The PLAN adds no source file, nothing under `.github` or `.githooks`, no variable and no setting.

## The model

Delivery architecture is named locations and things, and it is specific to a consumer. The solution architecture of a package declares what the package installs (the targets of its contract); where this repository allows delivery is KAAL's own declaration, kept in Engineering. Consumers read it; they do not carry copies.

## Slices

1. **This Change (release/C95).** The declaration, its one reader, and the two WIRE consumers: the merge-event classifier and the install judge.
2. **Pull Promotion's evidence rule** (`evidence.do` in `pull-promotion/declaration.json`) reads the declaration. Its owner decides how its path classes (packages, engineering) relate to delivery locations.
3. **Change Isolation** reads the declaration for what travels alone. Its Core paths are a rule about ownership, not only a list of locations, so this one needs its own PLAN.
4. Later: judge a package contract's targets against the declaration, so a package cannot install somewhere the consumer has not declared.

## For the CPO and the Owner

- **`.kaal` becomes wirable.** The Owner asked for it. It widens what a WIRE may install: a WIRE into `.kaal` is judged like one into `.github` (copy of a source on main, exact text), but Change Isolation's rule that Core travels alone is untouched and still applies to such a pull request. The Owner decided (19 Nov 2026): a WIRE may install into it provided no specific control says otherwise. The default is allowed, and any exclusion (for example Change Isolation's "Core travels alone") comes only from a dedicated control, never from this declaration. This PLAN declares the root, not the files in it.
- **Where the declaration lives.** In release management's architecture now (`A67`), because the two consumers are its own. The reader is the only code that knows the path, so moving the declaration to an Engineering-wide place later changes one constant.
- **Not in this Change, observed:** the PROMOTION route row of `envelope.mjs` lists `kaal/` and `hotfix/` heads, not `wire/`. No workflow runs the checker, so nothing blocks today, and #2016 (head `wire/...`) was never judged by it. Whether the row should list `wire/` belongs to whoever wires the checker into CI.
- `.agents` is named in a package contract but absent here. It is declared when Engineering deploys it, as one line of the declaration.
