# Release: Intent (target)

This document states the enduring target (B) of the Release capability, `kaal-release`. It does not describe how to get there; the finite Change is in [00-changes.md](00-changes.md) and references this target by id.

The Owner asked for a clear line between specific KAAL decisions and general release management work.

The line is the point of this capability. KAAL's own release approach (collectors, two required gates, a merge queue only on `main`, named controls) answers KAAL's questions. A consumer asking how to release a package has different questions, and must not inherit KAAL's answers by accident.

- **release/I1. A consumer can release well using `kaal-release` without adopting KAAL's release approach.** The capability carries general release management only, in industry terms: Semantic Versioning, build once and promote the same artifact, approval before publication, authenticated publication with provenance where the ecosystem offers it, verification of what was published, release notes, and recovery.
- **release/I2. KAAL's own release decisions stay in KAAL.** They live in `engineering/release-management/` as Delivery architecture, are traced there, and are not shipped. `kaal-release` points to them as one realization when the repository is a KAAL Engine that has them, and never restates them.
- **release/I3. The shipped Skill never forces a decision.** Where a repository has to choose (how many gates, who approves, where a candidate is tested), the Skill names the decision and its common options, and the repository's own record wins.
- **release/I4. The capability runs standalone.** A dependency on KAAL is fair for developing `kaal-release` and not for running it (Owner, 9 Nov 2026).
- **release/I5. The capability is shipped as BASS and says at which level each behaviour lives.** Judgment stays guidance (Skill). What must repeat exactly is a Script. 0.0.1 ships one, `analyze-flow.mjs`, hosted inside the Skill (Owner, 12 Nov 2026); any further Script is a later Change.

## Product boundary

KAAL engineers `kaal-release` by learning from its own release-management work, then embeds it back as its first consumer. KAAL uses it for two targets: promoting updates into `main`, and publishing products to a package registry. Another repository benefits from the resulting techniques without repeating KAAL's engineering pain and without copying KAAL's decisions.

| Part | What it is | Home |
| --- | --- | --- |
| **Generic Release Solution** | Reusable guidance that helps a consumer make its own decisions: assess the context, establish readiness, choose appropriate controls and authority, preserve artifact identity, promote or publish, verify, recover. It prescribes no collectors, gates, rulesets or registry setup. | `kaal-release` (this capability) |
| **KAAL as consumer (Delivery)** | KAAL's realization for promotion into `main` and package publication. KAAL is a reference consumer, not a mandatory template. | `engineering/release-management/` |
| **Change** | How each realization is established and improved. Migration and interim controls never enter the generic target. | `00-changes.md`, and the Changes of release management |

- **release/I6. The generic loop serves any release target,** a branch promotion as well as a package publication. Which controls and authority apply is derived from the consumer's context, not fixed by the Skill.
- **release/I7. `kaal-release` is the reusable product; Engineering Release Management is KAAL's implementation of its principles** (Owner, 9 Nov 2026). The Skill describes how to design and drive an end-to-end release process. KAAL's Delivery architecture implements that process with GitHub Actions, Guard, Change, Testing and npm. KAAL-specific CI machinery is never exported as a universal product.
- **release/I8. Release drives the process and delegates the other responsibilities** (Owner, 10 Nov 2026). Release drives a change from intent to delivery: stages, readiness, sequencing, promotion, publication, recovery, and the decision whether progression is allowed. It does not become the owner of every responsibility it invokes. The process is composed from delegated roles: **implementation** (Change: the process that implements a given change, with its record and PLAN/DO integrity), **protection** (Guard: protects what we have and shall have; invariants, trusted checks, verdicts), **verification** (Testing: deterministic evidence; Cases, suites, coverage), **validation** (Review: judgment of the result), and the **execution infrastructure** (workflows, runners, required contexts). A consumer fills each role with its own choice.
- **release/I10. Quality assurance needs both verification and validation.** Verification is deterministic (a Script element) and belongs to Testing. Validation is non-deterministic (Bare, Agent or Skill elements) and belongs to Review. Release requires both before it allows progression, and it replaces neither: it does not run verification itself and does not judge the result itself.
- **release/I9. The Skill stays clean.** It speaks only about the process and names each delegated role as a step whose provider the consumer chooses. It defines no protective rule, check, runner, verdict vocabulary or gate.
