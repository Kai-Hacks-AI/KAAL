# kaal-core: Limitations

This document lists what kaal-core 0.0.1 does not do, and what its tests cannot show. Each item is deliberate. None is a defect waiting for a workaround.

## What 0.0.1 leaves out

Registration ships in 0.0.1 (core/F68). These parts of it do not:

- **Recording how owners aligned a shared term.** Assembly reports a term that several owners define as a shared term, always unaligned (core/F66). There is no way yet to record that the owners aligned it, whether as one authoritative meaning the others consume, as meanings kept distinct, or as meanings related explicitly. Every shared term stays reported as unaligned.
- **Typed relationship kinds.** A trace has no type of its own. A kind's rule says which kinds its instances may trace to, but two different relations between the same pair of kinds, such as `refines` and `verifies`, cannot be told apart.
- **An absent optional complement versus a malformed registration.** When a registration refers to a kind or a target that does not resolve, Core reports a finding (core/F50, core/F52). It does not distinguish a complementary capability that is simply not installed from a registration that is malformed or contradictory. Both give the same finding.
- **Graph's analysis.** Reach, incoming views and observed cycles are Graph's, an optional complement (core/F80). kaal-core 0.0.1 does not use Graph at run time. So `assemble` returns `cycles: null`, and `incoming(scope, id)` and `reach(scope, id)` return `null`. `null` means unavailable, never empty and never cycle-free. `kaal verify` prints that cycles are unavailable. kaal-core runs without Graph, and nothing is refused or failed because Graph is absent.
- **Acyclicity.** Core holds no acyclicity requirement and never judges a cycle. A capability that needs its relationships to be acyclic must produce that evidence itself.
- **Navigation over Edges.** Looking Nodes up by Edge and walking a graph are Graph's. Install `kaal-graph` beside kaal-core and hold `engine.nodes` in a Graph for that.

## Other boundaries

- **No migration from earlier Engines.** 0.0.1 is the first version. An Engine bootstrapped from earlier, unreleased kaal-core bytes does not verify and is not adopted by `kaal upgrade`. Bootstrap a fresh Engine.
- **The lifecycle acts on `./.kaal` only.** An Engine created with `--engine <dir>` has no record, so `kaal upgrade` and `kaal remove` refuse it and `kaal version` reports it as unrecorded.
- **No Skill format.** Core deploys a Skill's files unchanged and never checks a `SKILL.md`.
- **No meaning.** Core judges structure: identity, type resolution, schema conformance and trace permission. It never says that a Node's or an instance's content is right.
- **No scratch directory from Hosting.** The verifier makes its scratch directory with Node's portable temporary-directory call, the one host operation outside Hosting (core/F88).

## What the tests cannot show

- **A matching manifest is consistency, not provenance.** The verifier checks the installed files against `test/verify.json`, which ships in the same package. A match shows that the files agree with that manifest. It does not show that they are the bytes the publisher packed. Whoever changes both a file and the manifest is not detected. The packed artifact's identity is recorded by the publisher, outside the package.
- **`verified` is evidence for the installed candidate only.** It speaks for the package name, version and manifest SHA-256 the execution record names, on the host where it ran. It says nothing about another version, another installation or another platform. A later run that fails supersedes it.
- **`verified` is not `validated`.** `verified` means every required case executed successfully. Whether the package is fit for a purpose is a review judgment, never an automatic consequence of a passing run.
- **The delivered tests are a sample.** They check representative behaviour of each loop on the installed copy. Most Requirements are checked only by the publisher's tests, which do not ship. [Testing](testing.md) states which Requirement is checked where, and which are checked by no test.
- **One host per run.** A run on one platform is no evidence for another. Host compatibility is Hosting's to establish.
- **Documents are judged by review.** A test checks that these documents exist, link only files that ship, and name what is left out. Whether they are coherent and accurate is a review judgment.
