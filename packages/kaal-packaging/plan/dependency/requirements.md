# Dependency traces: Requirements

These are planned. Each one moves to `docs/requirements.md` in the DO, packaging/C11.

## Functional

- **packaging/F20** [packaging/I8]: **Derived dependency relations.** `dependencies(manifests)` takes manifests the caller gives as `{ path, bytes }`. For each manifest, it resolves to the package's identity: its ecosystem, name, version and manifest path, as packaging/F7 reads them. For each dependency the manifest declares, it resolves to one relation: from this manifest's realization to the identity of the named package, naming the field that declared it. The relation is by name. Whether the version and source are acceptable stays packaging/F7's and F19's question. In npm, the declaring fields are `dependencies`, `devDependencies`, `peerDependencies` and `optionalDependencies`. A rename has to update all four, so all four are traces.
- **packaging/F21** [packaging/I8]: **What does not resolve is reported, never guessed.** Three cases are reported, each naming the path and the name involved:
  - A dependency on a name that no given manifest defines is `external`. It produces no Edge, because no KAAL owner is reachable through it.
  - Two manifests stating the same name are a finding naming both paths. Neither identity is used, and no relation targets that name.
  - A manifest that does not read, or states no name or no version, is a finding. It contributes nothing.

  Nothing is dropped silently, and no earlier or nearer manifest wins.
- **packaging/F22** [packaging/I8]: **Graph's form, as an optional complement.** When the caller hands in Graph's `createNode`, the same way `conform` takes Testing's model functions (packaging/F13), the result also holds Nodes in Graph's Form:
  - one **Package** Node per resolved identity, with no Edges;
  - one **Realization** Node per manifest, with one `Depends on` Edge group whose targets are the Package Nodes it depends on.

  Every Node states its manifest path, so an ownership claim attributes it. The Type Nodes (`KAAL Package`, `Package Realization`) and the relationship Node (`Depends on`) are Definition Nodes that Packaging ships in `capability/`. Without `createNode`, the result holds the relations only, and Packaging takes no dependency on Graph (packaging/N8).
- **packaging/F23** [packaging/I8, packaging/I7]: **Command.** `kaal-packaging dependencies <dir>…` reads each directory's manifest, calls `dependencies`, and prints its result as JSON, ending on one line `kaal-packaging-dependencies {json}` whose `causes` list every finding. It exits 0 when there is no finding and 1 when there is one. It decides nothing the library does not (packaging/N12).

## Nonfunctional

- **packaging/N13** [packaging/I8]: **Pure.** `dependencies` reads only the bytes it is given. It imports no host module, makes no network request, and never runs or installs a package. The same manifests, in any order, give the same relations and byte-identical Nodes. Engineering can therefore call it on a target's manifests, as engineering/N14 requires.
- **packaging/N14** [packaging/I8, packaging/I6]: **One meaning, no restatement.** `Depends on` means packaging/F7's dependency and nothing else. Impact, selection, isolation and ownership are referenced by their owners' IDs (engineering/F25–F27, the ownership claims), never restated here.
