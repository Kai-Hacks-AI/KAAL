# Pull Promotion: host-neutral gathering of stock items and consumption of their OUT verdict (testing)

Runnable Cases `T430` to `T434`, `.red.mjs`. They are RED because `scripts/deliveries.mjs` and the adapter do not exist. They are not wired into any CI run; the DO moves them to `test/pull/` as `.test.mjs`. Run from the repository root: `node -e "import('./packages/kaal-release/plan/pull-gather/T430.red.mjs').then(m => m.run())"`.

| Case | Requirement | What it shows |
| --- | --- | --- |
| pull/T430 | F50 | Stock items of declared classes become deliveries with an opaque `source`; an undeclared class is ignored with a finding; no value, size or unit; facts that are not lists give nothing and a finding; the input is not changed; the package lists only the items it is given. |
| pull/T431 | F51, F52 | OUT consumes `{candidate, side, verdict, revision, authority}`: PASS only at the item's revision from the class's registered OUT authority; FAIL likewise; no verdict, another revision, another authority, `held` and an unrecognised value are UNKNOWN; differently shaped evidence for three classes gives the same result. An item with OUT PASS and no IN verdict is `ready` with `in` null; an IN FAIL leaves it listed and `ready`; IN never makes an item ready. |
| pull/T432 | F52, F53 | The adapter builds items only from registered stocks (a head outside one, an issue and a PR are not items) using the supplied class routes; with no delivery PR at the revision there is no IN verdict; with one, IN is PASS only with every required context successful at that revision, FAIL on a failure, UNKNOWN when pending, missing, other-revision or unreadable; two required lists give two results. |
| pull/T433 | F53 | The reader, run over a recording client, makes only GET requests; a failing request leaves UNKNOWN and never PASS. |
| pull/T434 | F54, F55 | The same unmodified package module, given a different host (ticket ids, other class names and revisions), gives the right deliveries; its source contains none of this installation's words; an item of a registered stock is `auto`, every other is `judge` and still listed, and registration never changes a verdict. |

They do not show the live host or any workflow.
