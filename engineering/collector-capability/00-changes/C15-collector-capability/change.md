# engineering/C15 change: collector capability check

Provisional ids: C15 and T268-T274 were not checked for global uniqueness over every remote branch.

## PLAN (revised after the CPO decision at c0a4a29)

1. Add a pure function `collectorCapability(ref, { capabilities })` returning PASS, FAIL or UNKNOWN for a branch `kaal/<capability>/<leaf>`. UNKNOWN never passes and is never reported as a pass or an exception.
2. Kind-specific rule: `capabilities` holds only the names of admitted **KAAL Capability** Nodes (today Change, Core, Guard, Testing). A Skill, Agent or Extension Node does not authorize a segment. Skills follow the collector of their owning capability.
3. Trusted main: the names are read from the default branch's tip with Core's `evaluate` and Graph `typed()`, never from the pull request head or the collector. A Node that exists only in the head does not count.
4. Report-only. Refs that do not pass are listed as exceptions during migration: non-Node namespaces (`engineering`, `architecture`), flat legacy branches, `kaal/old/*`, and segments that name only a Skill (`release`, `review`, `retro`). Nothing enforces anything; no ruleset, workflow install or hook is part of this Change. Enforcement waits until bootstrap and owner identities are resolved and the Owner authorizes it.
5. Explicit bootstrap path: a new capability's Node lands on main through a collector whose segment already passes (a registered owner), is promoted, and only then do collectors of the new capability pass. Before that they are reported exceptions. No parallel owner registry (option C is not accepted).
6. Core stays ignorant of branches; Engineering owns the control and the Cases.

## Open, not decided here

Which capability owns each existing Skill (Release, Review, Graph, Engineer Skill, Change Practice) is not declared anywhere on main. Until it is, `kaal/release/*` is an exception, not a PASS. C18's collectors are therefore reported, not blocked.

## Cases (all RED on main: the module does not exist)

- T268: kaal/core/x PASSes when a Capability Node named Core is admitted.
- T269: kaal/release/x is reported (FAIL) when only a Skill Node named Release is admitted.
- T270: kaal/retro/x is reported (FAIL) even when a Skill Node named Retro is admitted; a Skill alone never authorizes it.
- T271: an unreadable main, or a main with no admitted Capability Node, gives UNKNOWN, which never passes.
- T272: a Capability Node only in the pull request head does not make its segment PASS.
- T273: bootstrap: before a Capability Node is on main its collector is FAIL; with the Node on main it is PASS; the registering Change's own ref passes through an already-registered owner.
- T274: flat refs, `kaal/old/*` and non-Node namespaces are listed as exceptions; the report changes no exit status.
