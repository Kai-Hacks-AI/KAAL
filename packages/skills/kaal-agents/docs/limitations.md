# Agents: Limitations

What `kaal-agents` does not establish. The obligations these concern are in [Requirements](requirements.md).

- **Authority.** `orient` lists where authority may be stated. It never establishes, verifies or grants it, and its report always says so (agents/F2). Reading the sources, and consulting where they do not settle it, stay the Agent's work.
- **What a PREACH report means.** `preach check` checks structure only (agents/F4). A structurally valid report may still be wrong about the facts, may list the wrong candidates, and may cite an authority that does not grant what it claims.
- **What an instruction file says.** Instruction files are listed, never interpreted. A listed file can be stale, wrong or contradicted by another.
- **Who owns a path.** An ownership claim is reported as written. `orient` does not check that a claim is current, or that claims do not overlap.
- **The catalog without Core.** Without Core's package installed in the project, the catalog is unresolved. A consumer can reach a listed catalog only once Core can be installed from the registry.
- **Native loading of the Skill.** No host is relied on to load the Skill. An Agent reaches it when it is asked to, or through a pointer the repository adds (agents/A6).
- **What `verified` does not establish.** `verified` says the shipped files match the manifest that ships with them, and that the delivered cases passed here. It is consistency evidence, not provenance of the installed bytes. It says nothing about behaviour no case covers, or about your repository's own integration.

## Defects in published versions

None. No version of `kaal-agents` has been published.
