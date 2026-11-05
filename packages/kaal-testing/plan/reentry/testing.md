# Test run re-entry guard: Testing

The planned outer tests live in `test/plan/reentry.test.mjs`. Each title names the contracts it checks. They are immutable to DO and CHECK. A later DO turns them GREEN and adds the file to Testing's scripts. No existing Case is changed.

| Case | Checks | Loop |
| --- | --- | --- |
| testing/T123: with no marker, `guard` enters and hands children an environment carrying it | testing/F102 | Requirements |
| testing/T124: with the marker present, `guard` does not enter, leaves the environment unchanged and reports re-entry | testing/F102 | Requirements |
| testing/T125: a run entry started with the marker present runs nothing, prints an unknown line naming re-entry and ends 2 | testing/F103 | Requirements |
| testing/T126: `guard` is pure and deterministic and `lib/reentry.mjs` imports nothing | testing/N22, testing/A30 | Architecture |

## RED evidence

Run with `node --test test/plan/reentry.test.mjs`, outside `npm test` until the DO. T123, T124 and T126 are blocked before behavioural assertion because kaal-testing exports no `./reentry`. T125 fails on its assertion: the entry run with the marker set still lists and runs suites. The file has no `todo` or `skip` marker.
