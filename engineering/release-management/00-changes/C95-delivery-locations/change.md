# C95 change

## PLAN

1. Add the drafts in `interface.md` (the Intent, the Requirement, the Architecture, the declaration, the reader, and the changed `final-step.mjs` and `wire-judge.mjs`) and the Cases T1159 to T1164, all RED, next to the elements they test.
2. Observe the expected RED, and that each Case can pass with the drafts as the DO's files (`evidence.md`).
3. The PLAN adds no source file, nothing under `.github` or `.githooks`, no variable and no setting.

## The model

Solution architecture defines **what** is delivered; delivery architecture defines **how** it is delivered. Both are code, both live in Git, both are governed and versioned. They serve different outcomes (a functioning solution; a reliable delivery of it), and the line between them is responsibility and outcome, not technology, repository, directory or packaging format. The model must work unchanged in a repository that has no packages; in KAAL a package can be the solution unit, and its contract (`assets[].target`) is only an example of solution architecture stating what it installs.

Delivery locations are one concern of delivery architecture, not its definition. Installation, synchronization, activation and verification may also belong there. This Change takes the one concern that two WIRE consumers already disagree about: where this repository allows delivery is a declaration of the consumer (here KAAL), kept in Engineering. Consumers read it; they do not carry copies. The separation from Change Isolation and other controls stays: a control may forbid what the declaration allows.

## Slices

1. **This Change (release/C95).** The declaration, its one reader, and the two WIRE consumers: the merge-event classifier and the install judge.
2. **Pull Promotion's evidence rule** (`evidence.do` in `pull-promotion/declaration.json`) reads the declaration. Its owner decides how its path classes (packages, engineering) relate to delivery locations.
3. **Change Isolation** reads the declaration for what travels alone. Its Core paths are a rule about ownership, not only a list of locations, so this one needs its own PLAN.
4. Later: judge what the solution declares it installs (in KAAL, a package contract's targets) against the declaration, so a solution cannot install somewhere the consumer has not declared.
5. Later, as their own Changes if the Owner wants them: the other concerns of delivery architecture (installation, synchronization, activation, verification) anchored in the same place.

## For the CPO and the Owner

- **`.kaal` becomes wirable.** The Owner asked for it. It widens what a WIRE may install: a WIRE into `.kaal` is judged like one into `.github` (copy of a source on main, exact text), but Change Isolation's rule that Core travels alone is untouched and still applies to such a pull request. The Owner decided (19 Nov 2026): a WIRE may install into it provided no specific control says otherwise. The default is allowed, and any exclusion (for example Change Isolation's "Core travels alone") comes only from a dedicated control, never from this declaration. This PLAN declares the root, not the files in it.
- **Where the declaration lives.** In release management's architecture now (`A67`), because the two consumers are its own. The reader is the only code that knows the path, so moving the declaration to an Engineering-wide place later changes one constant.
- **Not in this Change, observed:** the PROMOTION route row of `envelope.mjs` lists `kaal/` and `hotfix/` heads, not `wire/`. No workflow runs the checker, so nothing blocks today, and #2016 (head `wire/...`) was never judged by it. Whether the row should list `wire/` belongs to whoever wires the checker into CI.
- `.agents` is named in a package contract but absent here. It is declared when Engineering deploys it, as one line of the declaration.
