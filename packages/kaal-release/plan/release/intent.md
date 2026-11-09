# kaal-release 0.0.1: Intent

This is `release/C1`, a PLAN Change. It ships no code and no package. It states what the Release capability is for, which of its content is general release management and which is a KAAL decision, and what a first `kaal-release` 0.0.1 contains, so that a later DO Change can build it against agreed Cases.

The Owner asked for "some basic setup with a skill, potentially mnemonics if we have some for release work already", and for a clear line between specific KAAL decisions and general release management work.

The line is the point of this capability. KAAL's own release approach (collectors, two required gates, a merge queue only on `main`, named controls) answers KAAL's questions. A consumer asking how to release a package has different questions, and must not inherit KAAL's answers by accident.

- **release/I1. A consumer can release well using `kaal-release` without adopting KAAL's release approach.** The capability carries general release management only, in industry terms: Semantic Versioning, build once and promote the same artifact, approval before publication, trusted publishing with provenance, verification of what was published, release notes, and recovery by deprecation.
- **release/I2. KAAL's own release decisions stay in KAAL.** They live in `engineering/release-management/` as Delivery architecture, are traced there, and are not shipped. `kaal-release` points to them as one realization when the repository is a KAAL Engine that has them, and never restates them.
- **release/I3. The shipped Skill never forces a decision.** Where a repository has to choose (how many gates, who approves, where a candidate is tested), the Skill names the decision and its common options, and the repository's own record wins.
- **release/I4. The capability runs standalone.** A dependency on KAAL is fair for developing `kaal-release` and not for running it (Owner, 9 Nov 2026).
- **release/I5. The capability is shipped as BASS and says at which level each behaviour lives.** Judgment stays guidance (Skill). What must repeat exactly may become a Script later, and is not in 0.0.1.

## Out of scope

- Releasing `kaal-release` itself. That is the final step, after release management is on `main`.
- The Release engine (`engineering/release-management/05-src/release-engine/`). It is KAAL's realization, owned by Engineering, and moves only through its own Changes.
- Any new mnemonic. Existing ones are reused (see the architecture).
