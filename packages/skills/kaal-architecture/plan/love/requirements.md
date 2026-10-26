# Packaging Readiness (LOVE): Requirements

Each Requirement names, in brackets, the Intents it serves.

## Nonfunctional

- **architecture/N1** [architecture/I1]: Architecture keeps no scripts and no lifecycle of its own. Core realizes its Installation Contract and registers its Nodes, so being installable adds no runtime dependency to the package.
- **architecture/N2** [architecture/I1]: The runtime prerequisite is Node 24 or later, as for Core.

## Functional

- **architecture/F1** [architecture/I1]: The package carries an Installation Contract instance, `contract.json`, in Core's format. It names the Capability `architecture` and the package's version. Its one asset is the Agent Skill, `skills/kaal-architecture`, a `directory` with target `.agents/skills/kaal-architecture`, and no `surface`. Its catalogue holds, for every file of that target, the SHA-256 of the bytes the package ships at each version, once, because Core deploys a Skill's files with the shipped bytes. Its record is `.kaal/state/architecture/installation.json`, and `provides` names the Skill `kaal-architecture`.
- **architecture/F2** [architecture/I1]: The contract's version and the package's version are the same, and the catalogue holds the current bytes of every asset file.
- **architecture/F3** [architecture/I2]: `Architecture` is typed by Core's `KAAL Capability` (the Owner's decision on #274). The package's ownership claim names it by kind `capability`, exact name and id. `URBAN` stays a `KAAL Definition`, and the Agent Skill stays a distinct instruction surface that the Capability delivers.
- **architecture/F4** [architecture/I2]: The Node states the boundary with Requirements: Requirements states what must hold, and Architecture places the behaviour a Requirement asks for. Neither defines the other's terms.
- **architecture/F5** [architecture/I3]: The Agent Skill is a canonical `SKILL.md` in Engineer Skill's format, which conforms as Engineer Skill reads it. Its frontmatter `description` is its description, and its body repeats it in no `## Description` section. Core deploys it, at its canonical location and for every provider, with the bytes the package ships.
- **architecture/F6** [architecture/I3]: The packed package holds its two Nodes, the Agent Skill, `contract.json`, README, LICENSE and `package.json`, and nothing else. It exports only `./package.json`.
