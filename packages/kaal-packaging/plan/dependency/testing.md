# Dependency traces: Test Plan

The cases go in `test/embed/dependency.test.mjs`, except T43, T45 and T48. Those go in `test/publisher/`, because they need Graph from the workspace or the source command, and the installed verification depends on neither (packaging/N8). Each case uses fixture manifests given as bytes. Each is first observed RED against the deliberately wrong implementation named. A RED that shows only a missing export counts as blocked, not RED (packaging/C9's rule). The cases are paired as BRITTLE requires (testing/F73).

| Test | Checks | BRITTLE | Deliberately wrong implementation that makes it RED |
| --- | --- | --- | --- |
| packaging/T37 [packaging/F20] | A dependency in each of the four fields gives one relation, naming its field, and no relation states an installation obligation | false GREEN | One that reads `dependencies` only |
| packaging/T38 [packaging/F20] | A new dependent manifest adds its relation with no edit to Packaging | false RED | One with a fixed package list |
| packaging/T39 [packaging/F20] | `*`, `workspace:`, `file:` and exact specs all give the relation; F7 still fails the non-registry ones separately | false GREEN | One that relates exact versions only |
| packaging/T40 [packaging/F21] | A name no manifest defines is `external`, named, with no Edge | false GREEN | One that drops it, or invents a Node |
| packaging/T41 [packaging/F21] | Two manifests with one name give a finding naming both paths, and no relation targets the name | false GREEN | One where the first manifest wins |
| packaging/T42 [packaging/F21] | A manifest that is not JSON, or lacks a name or version, gives a finding naming its path and contributes nothing | false GREEN | One that skips it silently |
| packaging/T43 [packaging/F22] | With Graph's `createNode` handed in: every Node is in Form, Graph's `check()` reports nothing, and `traverse(<Package>, { direction: "in" })` reaches exactly the dependents' Realizations | false GREEN | One whose Edges target names instead of Package Nodes |
| packaging/T44 [packaging/F22, packaging/N8] | Without `createNode`: relations only, and no module of Packaging imports `kaal-graph` | false GREEN | One that imports Graph |
| packaging/T45 [packaging/A16] | Two packages naming each other both build, and each reaches the other | false RED | One Node per package carrying its own Edges |
| packaging/T46 [packaging/N13] | The same manifests in any order give equal relations and byte-identical Nodes | false GREEN | One that keeps input order |
| packaging/T47 [packaging/N13] | `lib/dependency.mjs` imports no host module and starts no process | false GREEN | One that reads the manifests from disk itself |
| packaging/T48 [packaging/F23] | The command prints the library's result, with `causes` and exit 1 for a finding, and 0 without one | both | One that exits 0 whatever it found |
| packaging/T49 [packaging/I8] | Hosting/C11 replay: fixture manifests mirroring `kaal/hosting` at bf98e7b. From `kaal-hosting`, exactly Core, Engineer Skill, Graph and Testing are reached, and Foundation is not | acceptance | — |
| packaging/T50 [packaging/F24] | From the target revision's manifests, every dependent of the old name is reached from its Package Node. A candidate revision that renames the package gives a Package Node with a different id, and no relation or Node links the two names | false GREEN | One that maps the new name onto the old Package Node |

T43 and T45 use the workspace's real `kaal-graph`, and never a stand-in, because what they check is that Graph accepts and traverses the Nodes. Packaging still declares no dependency on Graph.
