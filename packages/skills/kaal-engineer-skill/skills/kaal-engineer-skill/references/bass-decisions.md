# Reference: choosing judgment or script (BASS)

BASS is Bare < Agent < Skill < Script. For each behavior a Skill asks of an agent, decide which realization it needs. A script repeats a step. It does not decide whether the step was adequate, who owns the result, or whether it is permitted.

## Per behavior, ask

1. **What must repeat, and what needs interpretation?** Repeatable, mechanical steps can be a script. Prioritizing, comparing meanings and deciding authority stay with the agent or the responsible owner. More determinism is not more correctness.
2. **Does a tool already do it?** Look in this Skill, then in the capability that owns the behavior and its Agent Skill, then in repository procedures. Use a declared bin or API as it is. Do not copy its implementation, and do not add a script only so a step has one.
3. **Where does it belong by role?**
   - An adapter that implements this Skill's own procedure lives inside the Skill, in `scripts/`, reached by relative path.
   - A public CLI or library stays in its owning package and is called through its public interface.
   - Build, test, release and CI code stays with the context that owns it.
   - Where a file sits does not make it the semantic owner, and private internals are never an interface for others.
4. **What is the invocation contract?** Before relying on a tool, name its runtime, dependencies, supported hosts and shell, inputs, what it writes, and what each result means. Resolve Skill-relative files from the Skill's actual location. Do not assume a source checkout, the working directory or a registry fallback. Discovering a tool must not change a target's instructions or Engine.
5. **What does the result establish?** Record what the tool observed, then the judgments and unknowns it leaves. A missing tool or missing evidence is unknown, never a clean result. Test reporting follows Testing and delivery conformance follows Packaging.

## Worksheet (an aid, not a required schema)

For each candidate: purpose; semantic owner and evidence; chosen realization (judgment, Skill procedure, public tool, Skill-private adapter); interface and effects; where it lives and why; how it is verified; what judgment remains.

## Worked choices

- **Judgment only.** Deciding whether a Skill's scope overlaps another capability. No script helps: the agent reads both Nodes and decides, and asks the owners when unsure.
- **Existing public tool, outside this Skill.** Checking an Agent Skill's conformance: run `scripts/check-skill.mjs` or the `kaal-engineer-skill` command. Admitting a Node: use Core's `kaal` commands. Do not reimplement either.
- **Contained adapter.** A Skill needs a small step that only its own procedure uses, for example listing the relative links in its `SKILL.md`. It goes in that Skill's `scripts/`, with the contract from question 4 written beside it.
- **Stays outside.** A build, test or release script is implementation of its owning package. Reference the owner's command. Do not move it into a Skill.
- **Owner unclear.** Record the owner as unresolved and ask. Do not infer ownership from the directory.

The structural checker confirms the Agent Skill's structure and that its relative references resolve. It does not judge whether a BASS choice is sound.
