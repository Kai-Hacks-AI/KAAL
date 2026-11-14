# engineering/C15 change: collector capability check

Provisional ids: C15 and T268-T276 were not checked for global uniqueness over every remote branch.

## PLAN (revised after the CPO decision at c0a4a29)

1. Add a pure function `collectorCapability(ref, { capabilities })` returning PASS, FAIL or UNKNOWN for a branch `kaal/<capability>/<leaf>`. UNKNOWN never passes and is never reported as a pass or an exception.
2. Proposed API: `collectorCapability(ref, { registrations, capabilities })`. `registrations` is main's Core Registration evidence: the scope claims `{ scope, holder }` and the collisions that Core's `assemble()` reports over the Registrations on main, or null when unreadable. `capabilities` is the set of names of admitted **KAAL Capability** Nodes. PASS needs both: the segment is a registered scope, and that scope's holder is an admitted Capability. A Skill, Agent or Extension holder, or an admitted Capability Node name without a registered scope, never passes; the Node name's spelling is never used. Skills follow the collector of their owning capability.
3. Trusted main: the names are read from the default branch's tip with Core's `evaluate` and Graph `typed()`, never from the pull request head or the collector. A Node that exists only in the head does not count.
4. Report-only. Refs that do not pass are listed as migration findings (never as authorized): non-Node namespaces (`engineering`, `architecture`), flat legacy branches, `kaal/old/*`, and segments that name only a Skill (`release`, `review`, `retro`). Nothing enforces anything; no ruleset, workflow install or hook is part of this Change. Enforcement waits until bootstrap and owner identities are resolved and the Owner authorizes it.
5. Explicit bootstrap path: a new capability's Node lands on main through a collector whose segment already passes (a registered owner), is promoted, and only then do collectors of the new capability pass. Before that they are reported exceptions. No parallel owner registry (option C is not accepted).
6. Core stays ignorant of branches; Engineering owns the control and the Cases.

## Earlier Core 0.0.1 work (added after the Owner's pointer)

- Core's native capability identifier is the **registered scope** (core/F47-F49, shipped in 0.0.1 by the Owner's Option B on #600): a holder claims a scope, one scope has one holder, scopes are opaque text and Core derives nothing from spelling. The control should use a Capability's registered scope as the segment, not a lowercased Node name that Engineering invents. A segment passes only if its scope's holder resolves to an admitted KAAL Capability Node.
- On main no Registration instance exists yet (only the Definition and README), so every segment is UNKNOWN or an exception until each Capability lands its own Registration. That Registration Change, owned by each Capability, is the bootstrap path of step 5.
- `kaal/core` (stale, 5 Nov, not promoted) holds core/C50 (independent discovery and optional composition, T112-T114), core/C47, initialization plans and Windows defects D1-D3. It adds no branch or collector knowledge and no registered kind, so it changes the answer by evidence only: registration discovery is tested in fixtures there; this repo registers nothing.

## CPO follow-up (0409476)

Report-only; no ruleset for collector legitimacy is activated. No Retro Capability Node is created merely to match `kaal/retro/*`: Retro is its own capability (Owner decision on #1640), so it needs its own legitimate capability identity first, which this Change does not decide. No branch is permanent except `main` (Owner, general principle): flat, legacy or conflicting branches may be changed or retired with Owner coordination, and their current existence is not an architecture constraint. The flat `kaal/learning` branch is therefore not a blocker: if a `kaal/learning/<name>` collector is needed, the CTO asks the Owner for that specific operation. No permanent exception or alternative registry is designed around it.

## Open, not decided here

Which capability owns each existing Skill (Release, Review, Graph, Engineer Skill, Change Practice) is not declared anywhere on main. Until it is, `kaal/release/*` is an exception, not a PASS. C18's collectors are therefore reported, not blocked.

## Verdicts: UNKNOWN when Registration evidence is absent, empty, unreadable or ambiguous (a collided scope, or no admitted Capability set); FAIL when evidence exists and the segment is not a registered scope held by an admitted Capability. The assessment is accepted (direction B); this implementation PLAN is not yet approved, and nothing is activated.

## Cases (all RED on main: the module does not exist)

- T268: a segment that is a registered scope held by an admitted Capability passes.
- T269: a registered scope held by a non-Capability (a Skill) fails.
- T270: an admitted Capability Node name without a registered scope never passes, whatever its spelling.
- T271: absent, empty or unreadable Registration evidence, or no admitted Capability set, gives UNKNOWN.
- T272: a Registration or Capability Node only in the pull request head does not count.
- T273: bootstrap: a new capability's collector fails until its Registration and Node are on main; the registering Change travels on an already passing owner's collector.
- T274: legacy, flat and non-Node refs are migration findings, never authorized, and change no exit status.
- T275: a scope held by a Skill is FAIL even when registered.
- T276: a scope Core reports as claimed by several holders gives UNKNOWN, never PASS.
