# Review skill depth: Intent

This is a PLAN Change for `review`. It ships no code. It states what the Review Agent Skill must be for kaal-review 0.0.1 to be a working package, so that a later DO turns the planned tests GREEN.

Review today (kaal-review 0.0.1 on main) is a short instruction card: read the work and its evidence, report each finding with what was checked, say what was not checked, leave the human what to observe, grant no authority. It is sound but thin. It has no finding format, no severity scale, no scoping, no checklist, no security prompt, no re-review, no example, and no way for a capability to tune it.

The design follows BASS (Bare < Agent < Skill < Script). A bare Agent can review. Instructions such as `AGENTS.md` guide it. A Skill guides it better. Scripts add deterministic support. Every piece of skilled work has three parts: deterministic work, non-deterministic work, and a review of whether those two did what they should. Review is that third part, offered to every capability.

- **review/I0.** The core of Review is a **structured review record**. All KAAL review going forward produces one, so that reviews can be found and analysed across pull requests, not only read. Review is a meta-level capability, like Testing: other capabilities use it, and the record is what it gives them.
- **review/I1.** Any capability can invoke Review with parameters that tune it to that capability, and Review needs no knowledge of the capability, its roles or its documents. The dependency points from the invoker to Review, never back.
- **review/I2.** Review keeps the three kinds of work apart. Deterministic work is done by scripts or by the invoker's checks and is reported as observed. Judgment is guidance and is reported with its evidence and its uncertainty. The self-check says whether both were done as asked.
- **review/I3.** A review reports what was observed and the evidence for it, in a form another Agent or a human can act on and a script can validate. It grants no authority: severity says how serious a finding is, never who may merge or decide.
- **review/I4.** Review works in any repository with no KAAL Engine. The Engine, the Nodes, a capability's documents and a role's definition are optional inputs, never prerequisites.
- **review/I5.** A review can be repeated: after the work changes, each earlier finding is checked against the new work, and open findings carry forward.

Out of scope here: what a capability's own lens says (that is the capability's), what a role is (Roles'), package shape and installed verification (Packaging's, held on #686), and npm publication (the Owner's separate authorization, after Hosting and Core).
