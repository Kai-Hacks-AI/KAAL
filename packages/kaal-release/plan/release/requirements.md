# kaal-release 0.0.1: Requirements

Scoped `release/`. F are functional, N nonfunctional.

- **release/F1. One Skill.** The package ships one Agent Skill, `kaal-release`, in `skills/kaal-release/SKILL.md`, and one Skill Node `Release` in `payload/`, typed by Core's `KAAL Skill`. The Node states meaning and scope only.
- **release/F2. The Skill covers the release loop in this order,** each as a decision to make or a check to hold, in industry terms:
  1. choose the version (Semantic Versioning 2.0.0: what is breaking, a feature, a fix; pre-release identifiers);
  2. establish readiness (tests pass on the commit to be released, the version is unused, the manifest is complete);
  3. build once, and promote that same artifact through every later step (never rebuild between test and publish);
  4. approve publication (a named person or role decides, separately from whoever built);
  5. publish through trusted publishing (OIDC, no long-lived token) with provenance attached;
  6. verify the published artifact against the promoted one, installed as a consumer installs it;
  7. announce (release notes, changelog) and tag;
  8. recover (deprecate and publish a fixed version; unpublish only where the registry's own policy allows).
- **release/F3. Decisions are named, not made.** For each step the Skill lists the decision a repository owns and its common options, and tells the agent to read the repository's own record of that decision first (a KAAL Engine's Nodes, or `AGENTS.md`). Absent a record, it asks the Owner rather than choosing.
- **release/F4. Examples are worked in npm.** `references/npm.md` applies F2 to npm packages (provenance, trusted publisher, `npm pack` once, `npm view` for existence). The Skill body stays ecosystem-neutral.
- **release/F5. KAAL's realization is pointed to, never copied.** One section tells the agent that if the repository is KAAL's own, its release decisions are in `engineering/release-management/`, and to read them there. The shipped files contain no KAAL collector, gate, control or station name.
- **release/F6. Mnemonics are referenced by name only,** and only those that exist as Nodes in the Engine the agent is in. The shipped files do not redefine them.
- **release/N1. Conforms.** The Agent Skill passes `kaal-engineer-skill`'s checker with no `standard` or `kaal` finding.
- **release/N2. Standalone.** The package declares no dependency on another KAAL package at runtime, and its Skill resolves every file it names inside the skill directory.
- **release/N3. Honest about its level.** The README states that 0.0.1 is Skill-level guidance, ships no Script, and does not verify anyone's release.
