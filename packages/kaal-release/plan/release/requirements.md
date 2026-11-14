# Release: Requirements (target)

Scoped `release/`. F are functional, N nonfunctional.

- **release/F1. One Skill.** The package ships one Agent Skill, `kaal-release`, in `skills/kaal-release/SKILL.md`, and one Skill Node `Release` in `payload/`, typed by Core's `KAAL Skill`. The Node states meaning and scope only.
- **release/F2. The Skill covers a target-neutral release loop,** each step as a decision to make or a check to hold, in industry terms. A target is any place a release moves to: a protected branch, a package registry, a deployment.
  1. assess the context (what is released, to whom, from where to where, what failure costs, who can decide);
  2. choose the identity of the release (a version or equivalent name; Semantic Versioning 2.0.0 where versions apply);
  3. establish readiness (evidence that the candidate meets its acceptance, and that the name is unused);
  4. choose the controls and the authority that fit the context (how many independent checks, who approves, separation between author and approver);
  5. preserve artifact identity: build once, move that same artifact, and never rebuild between test and release;
  6. promote or publish through an identity that can be audited, with provenance where the target supports it;
  7. verify what arrived against what was released, observed as a consumer sees it;
  8. announce (release notes, changelog, tag);
  9. recover (mark the release as not to be used, release a fix, withdraw only where the target permits).
- **release/F3. Decisions are named, not made.** For each step the Skill lists the decision a repository owns and its common options, and tells the agent to read the repository's own record of that decision first (a KAAL Engine's Nodes, or `AGENTS.md`). Absent a record, it asks the Owner rather than choosing.
- **release/F4. The Skill body is ecosystem-neutral; worked examples are separate.** `references/npm.md` applies F2 to npm as one example: npm trusted publishing (OIDC), npm provenance, `npm pack` once, `npm view` for existence, `npm deprecate`. These apply where the target is npm and are not requirements on any other consumer. The Skill body names no registry or tool.
- **release/F5. KAAL's realization is pointed to, never copied.** One section tells the agent that if the repository is KAAL's own, its release decisions are in `engineering/release-management/`, and to read them there. The shipped files contain no KAAL collector, gate, control or station name.
- **release/F6. Mnemonics are referenced by name only,** and only those that exist as Nodes in the Engine the agent is in. The shipped files do not redefine them. A mnemonic agreed but not yet landed (CARGO, DISCO, DRUMS) is not named in a shipped file until its Node is on `main`; the Skill states the same idea in plain words meanwhile.
- **release/F7. Different consumers derive different decisions from the same Skill.** Following F2 and F3, two distinct consumers or targets reach appropriately different controls, authority and verification, and neither imports a KAAL-specific control name from the Skill. This is demonstrated, not asserted (T10).
- **release/F8. The loop names delegated roles and defines none of them.** Where F2 needs implementation, protection, verification or validation, the Skill names the role, what the process requires from it and when (for example "before promotion, verification evidence that the change isolation holds, and a validation of the result"), and states that the provider and its rules are the consumer's. It owns the decision "is progression allowed given this verification and this validation". It does not own the verification's method, the validation's judgment, the protection's rules or the change's implementation.
- **release/F10. Readiness and outcome verification require both kinds of evidence.** In F2, readiness (step 3) and verification of what arrived (step 7) are stated as requirements on verification (deterministic; Testing's evidence) and on validation (judgment; Review's). The Skill defines no coverage measure and no acceptance criterion.
- **release/F9. The Skill helps design the process as well as drive it.** It guides a consumer through assigning each control to one authoritative owner, composing them under one orchestration layer, preserving distinct execution contexts, and proving a replacement's coverage before retiring a predecessor.
- **release/N1. Conforms.** The Agent Skill passes `kaal-engineer-skill`'s checker with no `standard` or `kaal` finding.
- **release/N2. Standalone.** The package declares no dependency on another KAAL package at runtime, and its Skill resolves every file it names inside the skill directory.
- **release/N3. Honest about its level.** The README states that 0.0.1 is Skill-level guidance with one Script, `analyze-flow.mjs`, hosted inside the Skill, and that it does not verify anyone's release. The Script's own contract is coordination/C1 (`plan/coordination/`).
