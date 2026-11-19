# C95 act

A 4L retrospective of the Change, from the viewpoint of the agent that carried it.

## Liked

The Owner's model made the slice small: delivery architecture is named locations, specific to a consumer, and what a package installs is a different statement. That left one declaration, one reader and two consumers, and a Case set that could say exactly when a consumer was still carrying a list of its own (T1163, which reads the consumers' source). Injecting the reader (`read`) made the fail-closed rule testable without breaking anything: a broken declaration and an added or removed location are both one function argument in a Case. The CPO's review of the wording, solution-neutral and anchored in the wider delivery architecture, improved the Intent more than any code change did.

## Learned

Four places each carried a list of locations and no two agreed, so the first fact was that the classifier I wrote for C93 had hard-coded the very thing the Owner had just said must not be hard-coded. Two smaller facts: ids have to be checked against the drafts of open PLANs as well as against `main` (C94's PLAN had claimed F71 and A66; I moved to F72 and A67 before review), and a Case that sorts strings must sort both sides (T1159 was RED for a reason that was not the one planned until the throwaway copy showed it). Also traced while here: the envelope checker's PROMOTION route row lists no `wire/` head, and no workflow runs it.

## Lacked

The vocabulary from the start: the first drafts spoke of packages, and the CPO had to ask for language that holds in a repository without packages. A WIRE pull request template, so the WIRE contract would be the template's own and its Target comment would read the declaration instead of listing `.githooks/` and `.github/` by hand. The declaration sits in release management's architecture because its two consumers are release's own; an Engineering-wide home is not decided.

## Longed For

The next slices, each its own Change with its own owner: Pull Promotion's evidence rule and Change Isolation reading the same declaration. A check that what a solution declares it installs (in KAAL, a package contract's targets) lies inside the declared locations. And, before the templates WIRE: the ACT recognition of the merge-event classifier, which takes an ACT to be exactly two chapters, must be revisited, because the source ACT template carries a third chapter, `HOW TO WORK`.
