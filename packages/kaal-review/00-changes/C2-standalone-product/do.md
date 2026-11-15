# review/C2 DO

Authorized by the CPO's approval of the PLAN at `5516483`, with the boundary that Review's packed product is tested in an isolated environment against its runtime contract and that Engineering-time testing dependencies are not automatically product dependencies.

## Delivered

- `test/standalone.mjs`, the consumer harness. It packs the package, extracts the tarball outside the workspace and acts as a consumer of the extracted copy. It loads each Skill the extracted `skills/` holds, registers the Nodes the extracted `payload/` holds into a fresh Engine and compares the Engine's listing with what the payload declares, and resolves what the manifest declares and what shipped source imports, accepting only permitted packages. It derives every expectation from the product itself and returns the packed file list as evidence only.
- `T292` renamed from `.red.mjs` to `.test.mjs`: green.

## Checked

- T292 passes with the package as it stands, and `cases.test.mjs` runs it with the other Cases.
- Mutation: declaring `kaal-testing` as a runtime dependency makes T292 fail; restoring the manifest makes it pass.
- The ownership test and the `kaal-testing` devDependency are unchanged. Nothing in the Skill, the Nodes or any other package changed.

## Not done

No promotion, no activation, no publication. The closure check is vacuous until the product ships code or declares a dependency; it exists to catch the first one.
