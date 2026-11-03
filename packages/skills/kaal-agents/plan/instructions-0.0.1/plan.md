# Agents: the instruction model and its ownership (agents/C11 PLAN)

This PLAN proposes an amendment to the Agents charter, `capability/Agents.md`. It ships no change to the charter itself and no code. The DO that applies the wording is agents/C12, after the CPO accepts this PLAN. It authorizes no sync, promotion, publication or version bump.

## Intent

The Owner names Agents as the likely owner of the AGENTS.md concern and frames it as an ownership split between the capability or package level and the deployment instance:

- **Agents (capability and package level)** owns the **instruction model** and its **composition**: what an agent instruction is, which layers exist, and how the layers combine into one working context.
- **A deployment instance** owns its own instruction files. For KAAL's own repository the instance's files are the root `AGENTS.md` and its siblings. The content in them belongs to whoever owns the matter they state: Engineering for the repository's engineering rules, and each capability for its own text.

The charter today does not say this. It limits Agents to an Agent's readiness and operation, "that alone", and it names no instruction model. Instruction files are already a source `orient` reads and lists without interpreting. Taking the model and composition does not widen what Agents may do. It names what Agents already presupposes.

## Proposed charter wording

Added after the paragraph that begins "It starts where Core ends", and in place of the sentence that ends "Its scope is that alone":

> Agents also holds the model of the instructions an Agent works under, and how they compose. An instruction guides an Agent. It never authorizes one. Instructions live in layers: the instruction files of a deployment instance, such as a repository's `AGENTS.md`, the Skills a package ships, and the Nodes a capability keeps. Agents says what each layer may state and how the layers combine into one working context. It owns no layer's content and writes no instruction file. A deployment instance owns its own instruction files, and the owner of a matter owns what is said about it there.

The sentence that says it ends "where the work an Agent takes up begins" stays. In its list, "where content goes is Communication's" becomes "channels and carriers are Communication's", as finding 2 below proposes.

## Requirements

- **agents/F13** [agents/I2]: The charter states the instruction model and its composition as Agents' own, and states that an instruction guides and never authorizes.
- **agents/F14** [agents/I2]: The charter states that a deployment instance owns its own instruction files, that Agents writes none, and that the owner of a matter owns what is said about it.
- **agents/F15** [agents/I3]: The charter's reference to Communication reads consistently with F13 and F14 and does not leave the placement of instruction content to two capabilities. Its exact wording is settled by the finding on Communication below.

## Findings (overlaps, recorded and not decided here)

| # | With | Finding | Proposed handling |
| --- | --- | --- | --- |
| 1 | **Core** | Agent Realization deploys Skills and proposes a pointer "for the instruction file's owner to adopt", and core/F20 says Core never writes an instruction file. The instruction file's owner is undefined today. | Under this PLAN the owner is the deployment instance. Core's text and core/F20 stand unchanged. Core keeps what an Agent is, and its registration, admission and catalog. Core's owner confirms. |
| 2 | **Communication** | The charter says "where content goes is Communication's". Read broadly it covers where instruction content lives, which F13 and F14 give to the model and to the instance. | Clarify the charter's clause to channels and carriers: Communication places content between people and Agents, and Agents places no content. Communication's owner confirms, since the capability is dormant (last change 19 Oct). |
| 3 | **Engineer Skill** | BASS names its Agent level after `AGENTS.md`-style instructions. | Agents uses BASS and does not redefine it. No change. |
| 4 | **Engineering** | The repository's root `AGENTS.md` is the instance's file and today holds engineering rules such as the Foundation and Hosting dependency rule. | Engineering keeps that content. The model tells it where the rules sit relative to the other layers, and nothing more. |
| 5 | **Change** | Changing an instruction file is an ordinary Change. | No change. |
| 6 | **Existing Agents tests** | `test/agents.test.mjs` pins the charter's present statements, and the Node's id changes with its text. The ownership claim and README follow the new id. | agents/C12 updates those package tests and the claim. The planned tests in this PLAN do not change. |

## Not in this PLAN

Any content in any instruction file, a template for instruction files, a new check on instruction files, a new command, and any capability other than Agents. It also does not change what `orient` does.

## Testing

The three planned tests are in `test/plan/instructions.test.mjs` and run with `node --test test/plan/instructions.test.mjs`, outside `test:publisher`, so CI is not red. Each fails today on the charter's text, not on a missing file. agents/C12 turns them GREEN without changing them.

| Test | Checks | Loop |
| --- | --- | --- |
| agents/T25: the charter states the instruction model and its composition, and that an instruction guides and never authorizes | agents/F13 | Intent |
| agents/T26: the charter states that a deployment instance owns its instruction files, that Agents writes none, and that the owner of a matter owns what is said about it | agents/F14 | Requirements |
| agents/T27: the charter's text no longer leaves instruction placement to Communication: it names Communication's part as channels and carriers | agents/F15 | Architecture |

Validated by review: the wording, and the confirmations the findings ask of Core's and Communication's owners.
