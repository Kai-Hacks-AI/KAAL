# Pin-behind in the acceptance evidence: Testing

The outer tests are in `test/plan/pin-behind.red.mjs`, run by hand with `node --test test/plan/pin-behind.red.mjs` until the DO (since folded into `test/acceptance.test.mjs`, where `npm test` runs them). Cases carry the model's identities (numbers provisional, after testing/T140 of the loops PLAN):

| Case | Checks | Role |
| --- | --- | --- |
| testing/T141: a nested older Foundation copy gives `pin-behind` naming consumer, package, held and packed version, and no verified failure | testing/F118 | RED now, GREEN at the DO |
| testing/T142: `pin-behind` with every other finding absent leaves `findings` free of verified failures, so a run's `passed` is not decided by it | testing/F118, testing/F120 | RED now, GREEN at the DO |
| testing/T143: a top-level held copy with other bytes stays a verified failure | testing/F119 | control, GREEN now and after |
| testing/T144: a nested copy of the same version with other bytes stays a verified failure | testing/F119 | control |
| testing/T145: a nested copy of a newer version stays a verified failure | testing/F119 | control |
| testing/T146: a nested older copy is a verified failure when the manifest has no `version`, when the held entry has no version, or when a version is not plain `x.y.z` | testing/F119 | control |
| testing/T147: a held copy equal to the packed integrity gives no finding of either kind | testing/F121 | control |

T141 and T142 are RED against `kaal/testing` at its tip, because the older nested copy is a verified failure there. The controls pass there, and must keep passing. At the DO the two RED Cases are folded into `test/acceptance.test.mjs` and named by `npm test`; the hand-run file is removed. Nothing here changes an existing Case.
