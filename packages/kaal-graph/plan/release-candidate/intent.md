# Graph release candidate: Intent

This is `graph/C11`, a PLAN Change. It ships no code and changes no test. It plans the remaining path from the current `kaal/graph` to the accepted Graph 0.0.1 release candidate that #621 waits for, and it names the decision each step needs.

The CPO holds #621 as "release candidate incomplete" (2 Nov), and the Owner holds it until C5 and C6 are implemented and demonstrated (comments 6535618294 and 6548272787). `graph/C4` (#627) fixed *what* Graph 0.0.1 is. `graph/C9` corrected the composition defect. What is missing is the route: `graph/C5` (#659) is a draft stacked on an unresolved Hosting reference migration, and `graph/C6` has no definition of its evidence beyond graph/T13.

- **graph/I8. #621 returns once, complete.** The next time #621 asks for promotion it carries a Graph that installs, verifies itself and passes release acceptance from the packed artifact, with the evidence attached, and nothing unrelated to Graph in the diff.
- **graph/I9. Release acceptance uses the repository's mechanisms.** Graph does not build a second packer, installer or registry check. It reuses Engineering's pack and Acceptance lane, Testing's acceptance method and Packaging's conformance, and it owns only its own cases and its own evidence.

Graph's scope is unchanged: Node Form and identity, Edge structure, navigation, reach, reverse, cycles and the CLI. This Change adds no behaviour.
