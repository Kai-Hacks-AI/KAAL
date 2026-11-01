# No Duplicate Runs: Requirements

Each Requirement names, in brackets, the Intents it serves.

## Functional

- **testing/F89** [testing/I23]: **The same run.** Two runs are the same run only when all of these are the same: the Case, its file path, its file's bytes (`sha256`), the subject's digest (`subject`, for example the candidate's `digest` of testing/F64), the platform and the Node version. Anything else, such as another candidate, edited file bytes, another platform or another Node, is other evidence and never a duplicate (testing/F15, testing/F56).
- **testing/F90** [testing/I23]: **Finding duplicates.** `duplicates(execution)` reads `{ runs: [{ case, file, sha256, subject, platform, node, ms, by? }] }`. Each entry is one run of a Case the harness observed in the execution, nested runs included. `by` names the Case that ran it, where a Case ran other Cases, for example through a nested `node --test` or `npm test`. Testing reads no clock: `ms` is as the harness recorded it.
  - The execution is **`unknown`**, with a finding for each problem and no challenge, when:
    - its runs are not a list or are empty;
    - an entry is not an object;
    - an entry has no `case`, `file`, `platform` or `node`;
    - `sha256` or `subject` is not a SHA-256;
    - `ms` is not a finite number of 0 or more;
    - `by` is present and is not a Case.
  - Otherwise the execution is **`challenged`** when any run happened more than once, and **`unchallenged`** when none did.
  - There is one challenge per repeated run, of kind `duplicate`. It holds:
    - `case`, `file` and `platform`;
    - `runs`, how often it ran;
    - `wastedMs`, its total time minus its fastest run, since one run is needed;
    - `by`, the Cases that re-ran it, in order, which is `[]` when it was re-run directly;
    - `statement`, `next` and `owner`.
  - Challenges are ordered by `wastedMs`, most first, then by Case, file and platform. The execution's `wastedMs` is their sum.
- **testing/F91** [testing/I23]: **Planning one run per file.** `schedule(requests)` reads `[{ by, files: [{ path, sha256 }], subject, platform, node }]`. Each request is one suite, job or Case that asks for case files to run. It gives `{ runs, reads, findings }`:
  - **`runs`:** one entry `{ file, sha256, subject, platform, node, for }` per distinct file under testing/F89, with `for` the requests that asked for it, in order. A file asked for twice by one request runs once.
  - **`reads`:** one entry `{ by, file, run }` per request and file, where `run` is the index of the run it reads.
  - A read is that one run's observation. Its result is the run's own: a failed or unknown run is read as failed or unknown by every request that reads it. It is never run again for a different result.
  - A request that cannot be read is a finding, and nothing is planned. That covers requests that are not a list; a request that is not an object or has no `by`; two requests by the same `by`; a request with no file, or a file with no path or no SHA-256; a `subject` that is not a SHA-256; and a missing platform or Node.

  Findings name what is wrong, never where it came in the list.
- **testing/F92** [testing/I23]: **A duplicate is evidence, never a result.**
  - `duplicates` gives `challenged`, `unchallenged` or `unknown`, never `failed`, `verified` or `passed`. It changes no run's result, no verifier's summary and no parity, as testing/F83 states for timing.
  - Each challenge's `owner` is `case owner`. Its `statement` names the Case, how often it ran, the platform, who re-ran it and the time beyond one run. Its `next` asks the re-running Cases to read the execution's own run, or asks for the file to run once.
  - A challenge states no outcome. Running a Case again after it failed, within one execution, is a duplicate like any other. Which result stands is the runs' own, never the duplicate's.

## Nonfunctional

- **testing/N19** [testing/I23]: Finding and planning are pure and deterministic. They read only the data given, run nothing, read no clock and no host, keep nothing and change no input. The same runs or requests give the same result, challenges, runs, reads and findings, in the same order, whatever order they come in. `kaal-testing/duplicates` imports nothing.
