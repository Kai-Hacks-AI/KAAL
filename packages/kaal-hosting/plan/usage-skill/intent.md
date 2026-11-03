# Hosting Usage Skill: Intent

This is `hosting/C25`, a PLAN for the agent-facing use of Hosting 0.0.1. It follows the Owner's 2026-11-01 direction that a registry product dependency for Core must include its Skill and testing, alongside its runtime package. This PLAN delivers no Skill or runtime implementation and authorizes no integration, promotion or publication by itself.

## CHECK

At collector `58ef6f6c61bc3253de5b9c1f9b218b1158615436`, Hosting already delivers its operations, authoritative product contracts, four embedded testing loops, installed verifier, boundary command and `kaal-hosting-boundary` review Skill. The exact collector's Hosting jobs in run `41304093322` pass 135 product/publisher tests plus 14 release tests on each of Linux, macOS and Windows, with no skips or todos. Those release tests exercise a packed candidate in fresh consumers, including verification failures. This is evidence for that collector, not for the future Skill.

The existing Skill explains boundary findings. It does not teach an agent how to select and use Hosting operations. `main` still names the dependency `kaal-hosting`; the collector names it `@kaihacksai/kaal-hosting`. Scoped publication, dependency migration, promotion and registry acceptance remain separate work. The package version alone establishes none of them.

- **hosting/I14.** A consumer, human or agent, can discover and use the installed Hosting product to read, initialize, update and reconcile files, execute installed commands, and interpret verification and boundary findings without a KAAL checkout. The agent-facing Skill guides use of the same public contracts as the Bare API. It neither reimplements host operations nor grants authority to change the consumer's files.

## Acceptance boundary

Hosting remains the `Hosting` KAAL Extension carried by `payload/Hosting.md`. An Agent Skill accompanying an Extension does not retype that Node or introduce a second product capability. Core consumes Hosting's API, not the Agent Skill, and Hosting gains no Core runtime dependency.

The smallest delivery adds one general usage Skill and demonstrates its published workflows. Existing APIs, verifier and boundary tools supply the Script part of BASS; a wrapper command for every API is unnecessary. The existing boundary-review Skill remains independently usable.

Ordinary packed installation on the three supported hosts is the 0.0.1 acceptance boundary for this Change. Linked dependency traversal (#694), ownership claims (#751), live CI optimization and broader Change Isolation are not bundled. Unknowns and limitations remain visible.
