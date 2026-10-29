# Engineering's test lanes

> PLAN (engineering/C6): nothing below exists yet. This PLAN answers Core's release PLAN, core/C28 (#622, core/A36 and conflict 4). From core/C29 on, kaal-core's `npm test` is the consumer's entry, and its publisher tests move to `test:publisher`. Engineering's lanes must keep running a workspace's publisher tests. Approving this PLAN authorizes only its DO, on `kaal/engineering`.

## Today

Each workspace's tests run through `npm test --if-present -w <name>` in three places:

- the Workspaces lane, `engineering/lanes/workspaces.mjs`;
- the evidence lane's driver, `engineering/coverage/measure.mjs`, for a workspace that delivers no JavaScript;
- Testing's coverage measurement, `kaal-testing/coverage` (`cover`, `lib/coverage.mjs`), which the evidence lane calls for every other workspace.

If nothing changes, once core/C29 renames the script these lanes would run kaal-core's consumer verification instead of its publisher tests, and the evidence lane would measure the wrong suite.

## The rule

- **engineering/F1.** A workspace's tests are its `test:publisher` script when its `package.json` declares one, and its `test` script otherwise. Every lane that runs a workspace's tests uses that rule. This is a convention, not a special case: no lane names a package. Any workspace that separates a consumer `npm test` from its publisher tests opts in the same way.
- **engineering/N2.** A workspace that declares no `test:publisher` runs exactly as it does today. Guard's `npm test` stays its consumer verification, and the Guard lanes keep running its own tests.

## The Change

- **engineering/A1.** One function, `script(workspace)`, in `engineering/lanes/`, reads the workspace's `package.json` and returns `test:publisher` or `test`. Both `workspaces.mjs` and `measure.mjs` use it, through `npm run <script> --if-present -w <name>`.
- **engineering/A2.** The coverage run is Testing's. `cover` takes the script it runs as an option, defaulting to `test` so nothing changes for its other callers, and the evidence lane passes `script(workspace)`. **That is a Testing Change.** Engineering asks Testing for it and does not edit `kaal-testing`. Until it lands, the evidence lane uses `test:publisher` only for a workspace that delivers no JavaScript, and says so in its report for any other.

**Order.** The rule changes nothing until a workspace declares `test:publisher`, so it can land before core/C29. It must be on `main` before C29's rename reaches `main`. Change Isolation keeps it out of Core's Change. So this Change goes through an Engineering promotion, ahead of Core's C29 promotion, in the one-pair queue. Testing's A2 Change follows the same order through Testing's promotion.

## Test Cases

These go in `engineering/lanes/script.test.mjs`, which joins `npm run test:engineering`. Each is first observed RED against today's lanes. A RED that shows only a missing module counts as blocked, not as evidence.

| Test | Checks | RED today because |
| --- | --- | --- |
| engineering/T5 | A fixture workspace that declares both `test` and `test:publisher` has its `test:publisher` run by the Workspaces lane, and its `test` not run. Each script writes a marker the test reads | the lane runs `test` |
| engineering/T6 | A fixture workspace with only `test` runs `test`, as today | (must be GREEN today: it guards engineering/N2) |
| engineering/T7 | The evidence lane, for a fixture workspace that delivers no JavaScript and declares both scripts, runs `test:publisher` | the driver runs `test` |

T5–T7 run on fixture workspaces in a scratch directory, never on kaal-core, so they do not wait for core/C29. The numbers follow engineering/T1–T4, which engineering/C5 (#610) plans.

## Not in this Change

- Core's script rename. That is core/C29's.
- Testing's `cover` option (A2). That is Testing's, and it is asked of Testing.
- Any workflow file, ruleset or required check. The lanes' job names do not change.

Approving this PLAN authorizes the engineering/C6 DO only. It authorizes no synchronization, promotion or publication, and no Change in another Capability's tree.
