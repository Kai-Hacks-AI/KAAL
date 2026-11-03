# No Duplicate Runs: Testing

The planned outer tests live in `packages/skills/kaal-testing/test/plan/duplicates.test.mjs`. Each title names the contracts it checks. They are immutable to DO and CHECK. `testing/C51` turns them GREEN and adds them to Testing's `npm test`. Runs and requests are given as plain data, and the tests own every expected challenge, run and read.

| Case | Checks | Loop |
| --- | --- | --- |
| testing/T104: a run is the same run only for the same Case, the same file bytes, the same subject and the same conditions | testing/F89 | Requirements |
| testing/T105: an execution that runs a Case more than once is challenged, naming the Case, how often it ran, who re-ran it and the time spent beyond one run | testing/F90 | Requirements |
| testing/T106: an execution is planned so each distinct case file runs once, and every request reads that one run | testing/F91 | Requirements |
| testing/T107: a duplicate is evidence for the case owner, never a result, and running a failed Case again in the same execution is a duplicate too | testing/F92 | Requirements |
| testing/T108: finding and planning are pure and deterministic: the same runs or requests give the same result, whatever order they came in | testing/N19 | Requirements |
| testing/T109: Testing's own npm test runs each of its files once: no case file is in two of its test scripts, nor twice in one | testing/F91, testing/F62 | Requirements |

## RED evidence

The tests run with `node --test packages/skills/kaal-testing/test/plan/duplicates.test.mjs`, outside Testing's `npm test` until `testing/C51`. At `testing/C50`, all six are RED, each **blocked before behavioural assertion**, because kaal-testing exports no `./duplicates`.

**Checked against a throwaway implementation.** A27 was implemented outside the repository, and all six pass against it. testing/T109 also passes on `testing/C38`'s layout (#718), where `test:consumer` runs `test/verify.mjs` over `test/embed/`. It fails there when a delivered case file is also named in `test:publisher`. All 30 mutants fail at least one test. The mutants cover:
- each part of a run's identity dropped;
- a single run challenged;
- the waste computed against the slowest run, or with the order reversed;
- challenges ordered least first, or without the tie-break by Case;
- the owner swapped;
- a challenge reported as `failed`;
- an empty execution, a negative or non-finite duration, an empty `by`, a subject or file hash that is not a SHA-256, or an entry that is not an object accepted;
- the re-runners left unordered, or `next` naming none;
- two requests by one `by`, or a request with no file, accepted;
- a file asked for twice by one request run or read twice;
- `for` or `reads` left unordered;
- something planned despite a finding;
- the execution's waste reported as its largest single waste;
- findings left unordered.

testing/N19's "imports nothing" is checked by review of `testing/C51`.
