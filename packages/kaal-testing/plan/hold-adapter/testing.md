# Hold adapter: Testing

The planned Cases live in `packages/kaal-testing/test/plan/hold-adapter/`, named `T<n>.test.mjs` and never renamed. Each exports `id`, `tests`, `title` and `run()`. `lib.mjs` builds throwaway trees and run reports in a temp directory and touches nothing else. The aggregate `test/plan/hold-adapter.test.mjs` runs them, and the DO appends it to `package.json` `scripts.test`. Each Case asserts that the module exists before it imports it, so on `main` it is RED by assertion and never a load error.

| Case | Checks | What it decides deterministically |
| --- | --- | --- |
| testing/T384: the catalog lists every Case file wherever it sits | testing/F158, testing/N36 | any depth, `.test.mjs` and `.red.mjs` (parked), single and double quotes, not under `node_modules` or `.git`, not a file that is not named `T<n>`, a file that throws on import is listed and never run, the same list in any directory order and twice |
| testing/T385: a Case that cannot be joined is named | testing/F159 | duplicate id (every file named) and no id, each naming its files and saying why; a Case with either is not in the list; a Case with an id stays listed whatever its form (that is `testing/C69`'s) |
| testing/T389: a catalog defect cannot leave an all-GREEN observation | testing/F159, testing/F162 | every other Case GREEN and a duplicate id: the id is in the map as UNKNOWN; every other Case GREEN and a file with no id: `catalog.complete` is false and names the file, through the command as well; a clean catalog: `complete` is true |
| testing/T386: observing a Case | testing/F160 | GREEN needs a run, tests, all GREEN and a clean file; RED for a RED test; UNKNOWN for skipped, error, not run, no test, a file problem; attribution by catalog file and not by what a test says; every catalog Case observed and no other; uncataloged tests reported; a report that is not `run-report@1`, and a run incomplete with no problem to say where, give UNKNOWN |
| testing/T387: provenance and a stale report | testing/F161 | revision, expected revision, run id and `producedBy` in the evidence; no report, no revision, no run id, no revision asked about, or another revision gives every Case UNKNOWN with a reason |
| testing/T388: the command and the boundary | testing/F162, testing/N36 | writes the `{id: state}` map and an evidence file, exits 0 with a RED Case, 2 for a missing report and for no arguments, nothing written under root, the same bytes twice, two new exports, no new dependency, Node 24 or later |

T388 asserts the Node major last, so it is RED on any Node below 24 even against a correct implementation. That is the acceptance condition (`testing/N36`), as for `testing/T369`, and not a defect of the Case.

What these Cases do not decide: that Hold does not PASS on `catalog.complete: false` (that is Release's Case, and a condition of wiring the producing job), that the hold judge reads the map as intended (release's `judge-act.mjs` already does and has its own Cases), where the observation runs, and that the pull request's own run is honest. The last is the reason the evidence says `producedBy`.

## RED evidence

`node --test packages/kaal-testing/test/plan/hold-adapter.test.mjs` on `main`: all six are RED by assertion (`missing: …/lib/cases.mjs`), none a load error. See `evidence.md`.
