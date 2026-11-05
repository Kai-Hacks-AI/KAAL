# Test run re-entry guard: Testing

The planned outer tests live in `test/plan/reentry.test.mjs`. Each title names the contracts it checks. They are immutable to DO and CHECK. A later DO turns them GREEN and adds the file to Testing's scripts. No existing Case is changed.

| Case | Checks | Loop |
| --- | --- | --- |
| testing/T123: with no marker, `guard` enters at its level and hands children an environment carrying that level | testing/F102 | Requirements |
| testing/T124: with the marker at or above the entry's level, or unreadable, `guard` does not enter, leaves the environment unchanged and reports re-entry | testing/F102 | Requirements |
| testing/T125: the run entry started with the marker present runs nothing, prints an unknown line naming re-entry and ends 2 | testing/F103 | Requirements |
| testing/T126: `guard` is pure and deterministic and `lib/reentry.mjs` imports nothing | testing/N22, testing/A30 | Architecture |
| testing/T127: the verification (level 2) enters under the run entry's marker (1) and when unmarked, passes level 2 to its children, and is refused at 2; the run entry (level 1) is refused at 1 | testing/F104 | Requirements |

## RED evidence

Run with `node --test test/plan/reentry.test.mjs`, outside `npm test` until the DO. T123, T124, T126 and T127 are blocked before behavioural assertion because kaal-testing exports no `./reentry`. T125 does not import it: it uses the marker name the contract fixes (`KAAL_TESTING_RUN`) and fails on its own assertion, because the existing entry still lists suites. The file has no `todo` or `skip` marker.
