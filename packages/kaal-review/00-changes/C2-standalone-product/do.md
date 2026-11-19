# review/C2 DO

Authorized by the CPO's approval of the PLAN at `5516483`, with the boundary that Review's packed product is tested in an isolated environment against its runtime contract and that Engineering-time testing dependencies are not automatically product dependencies. Revised after the CPO's review of #1713 (head `9b1c5c8`): permitted dependencies must be available in the consumer environment and resolved there, not in the development workspace, and a missing one must fail.

## Delivered

`test/acceptance/standalone.test.mjs`, an acceptance scenario of the repository's Acceptance lane, replaces the in-process harness `test/standalone.mjs` the PLAN named. The lane packs every delivery workspace once and the scenario installs those tarballs into a fresh host outside the repository. It holds the packed `kaal-review`, the Engine a consumer registers into (`kaal-core` and `kaal-graph`) and the permitted shared dependencies (the scoped Foundation and Hosting), and nothing else. The Case is `review/T292`, declared by the scenario for `review/F24` and `review/G3`. From the host the scenario exercises what Review declares:

- no KAAL package other than the product, the Engine and the permitted dependencies is installed;
- each Skill the installed `skills/` declares loads as an Agent Skill;
- the Nodes the installed `payload/` declares are registered with the host's own `kaal` into a fresh Engine, and the Engine lists exactly them;
- the runtime closure, the manifest's dependencies and the packages shipped source imports, resolves from the installed product's own location in the host. Permitted packages are resolved like any other and are not assumed;
- negative: a fixture product that needs the permitted Foundation resolves inside the host and is reported unresolved outside it. Review itself declares no runtime dependency today, so this shows the check detects a missing permitted dependency without changing the product.

## Checked

- The Acceptance lane run locally passes, 45 of 45 tests, with the scenario's four Review tests and two negative tests among them. The lane reports 9 installations in 9 hosts.
- The ownership test, the `kaal-testing` devDependency and the existing Cases are unchanged. Nothing in the Skill, the Nodes or any other package changed.
- A first version of the scenario named the Foundation `kaal-foundation`; its package is `@kaihacksai/kaal-foundation`. Corrected.

## Not done

No promotion, no activation, no publication. Review ships no code and declares no dependency, so the closure check is vacuous for the product until it does.
