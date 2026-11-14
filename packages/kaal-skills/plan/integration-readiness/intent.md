# kaal-skills: integration readiness of a Skill (Intent)

This is `skills/C1`, a PLAN Change. It ships no code and installs nothing. It states, once, what makes a KAAL Skill ready to be invoked by hooks, CI and other agents, and plans the Cases that check it. Owner assignment: "Owner to CTO Handover, KAAL Skills, Common Integration Contract", 14 November 2026. The Owner's principle: *common Intent, common Requirements, common Tests; capability-driven realization.*

**What is missing.** Seven capabilities (Intent, Requirements, Architecture, Change, Review, Testing, Release) each guide an agent through a Skill. Some also have a mechanical part that a person or a machine can run. None says what a caller may rely on. Engineering and the Controls Change must decide, control by control, how to wire Skills into hooks and CI, and today each decision starts by reading a different README. The risk is the one the CI ownership map already found: a hook or workflow that carries its own copy of a capability's rule because the capability gave it no clean way to call that rule.

- **skills/I1**: A KAAL Skill is *integration-ready* when a caller that is not an agent (a hook, a CI step, another tool) can invoke whatever the capability makes mechanical, can read an honest result, and has to add none of the capability's rules to do so; and when whatever stays judgment is declared as judgment, with the shape of what an agent gives back. Each capability declares this in one small declaration that it owns and realizes in its own way. `kaal-skills` states the Intent, the Requirements and the Cases once, and checks every declaration against the same Cases. It runs nothing, installs nothing and decides how no capability is built.

**The Owner's five readiness criteria, and where each is answered.**

| Owner criterion | Answered by |
| --- | --- |
| 1. A documented mechanism suitable for invocation by hooks and CI | F1, F2 |
| 2. Small and focused on the Skill's responsibility | F1 (one declaration, a handful of fields), N1 |
| 3. Observable and testable | F3, F4 |
| 4. Satisfies the common acceptance Tests | T260 to T266 |
| 5. Integrable without duplicating business rules in hooks or CI | F4, F5, F6 |

**Boundaries (from the handover).** `kaal-skills` owns the Intent, the Requirements, the Cases and the contract against which a Skill is verified. Each capability owns its mechanism, its behaviour and its tests, and is the one to comply. Engineering and the Controls Change own installation into hooks and CI, and the decision to migrate, enhance, retain, improve or terminate a control. This Change grants no promotion or publication authority.

**Out of scope.** No central framework, runtime or shared engine. No refactoring of any Skill. No installation into a hook or workflow, no ruleset or required-check change, no migration or retirement of a control. No declaration added to any capability's package (each is that capability's own Change). No Gap or Change registered for the six other capabilities: `assessment.md` proposes them for the CPO.
