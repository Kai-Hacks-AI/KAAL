# Installation Contract and Agent Realization: Intent

This is `core/C3`, a PLAN Change. Core owns all of CASE (Capability, Agent, Skill, Extension) and their installation. It states how any Capability declares what an installation of it is, and how Core makes a Capability's Skills reachable by the agents a repository uses. It ships no code. `core/C4` turns the planned tests GREEN. Guard is the first Capability with an instance (`guard/F27`), and Guard's standalone lifecycle stays independent of Core (`guard/N12`).

- **core/I3.** Every Capability states what an installation of it is in one installer-neutral contract, in one format that Core owns. Any installer that realizes the contract, whether the Capability's own standalone lifecycle or Core, leaves a repository that the other can upgrade and remove.
- **core/I4.** An agent of every provider a repository declares reaches each installed Skill. Each Skill has one canonical source, and nothing is duplicated by hand or left to drift.
- **core/I5.** Installation never takes what is not its own. A file someone changed is kept and reported. Only what an installer wrote is pruned. Instruction files such as `AGENTS.md` and `CLAUDE.md` stay their authors'.
