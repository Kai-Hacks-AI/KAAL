# Well formed Test Cases: Requirements

All answer testing/I43.

## Functional

- **testing/F152** [testing/I43]: **First line and id.** A Case file's first line is exactly `// Case <id> tests: <element id>[, <element id>...]`, optionally followed by `.` and free text that is never read. `<id>` is `<namespace>/T<number>`. A file that declares its own id (`export const id = '...'`) declares the same one. Findings: `first-line`, `case-id`, `id-differs`.
- **testing/F153** [testing/I43]: **Unique ids.** A Case id is carried by one file among the files given. Every file that carries it gets a `duplicate-id` finding.
- **testing/F154** [testing/I43]: **Targets exist.** When the caller supplies the element ids that exist, a target outside that list is a `target-missing` finding naming it. When the caller supplies none, targets are reported `unchecked` and are never called present or missing. Where the ids come from is the caller's answer, as Hosting and Core already are for ownership.
- **testing/F155** [testing/I43]: **Report and command.** `checkCaseForm(files, { elements })` (export `./form`) is pure and deterministic. `kaal-testing check-cases [--root dir] [--elements file] <files…>` prints `{ schema: 'kaal-testing/case-form@1', files, targets: { checked }, findings: [{ file, line, kind, detail }] }`, exits 0 whenever a report was produced and 2 for invalid input (an unreadable file or element list). Findings are sorted, equal input gives equal output.

## Nonfunctional

- **testing/N34** [testing/I43]: **Structure, not wording; reports, does not decide.** The check never reads text after the edge and never judges a Test Case's quality. The report has no verdict field (`pass`, `ok`, `valid`, `status`) and findings never change the exit code. The shipped files name no concrete peer, owner or consumer. The edge word is one constant, so a later rename is one change here.
