# Catalog only: Requirements

Each Requirement names, in brackets, the Intents it serves.

## Functional

- **core/F120** [core/I43]: `kaal-core` exports `catalog` and no `capabilities`. `catalog(dir)` still returns, for one Engine, the Capabilities, Agents, Skills and Exchanges its admitted Nodes hold, each by name and id, found by type alone. Everything `capabilities(dir)` returned, the Skills and the Exchanges, is returned by `catalog(dir)` unchanged.
