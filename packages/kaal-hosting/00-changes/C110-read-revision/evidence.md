# hosting/C110 evidence

Observed on Node 24.22 and Git 2.43, on Linux only, on `main` 3a3cf6e6 plus this PLAN. Hosting was installed with its own runtime dependencies in a throwaway copy of the package and built with `04-test/engineering-check/build.mjs`. Each Case is a module exporting `id`, `tests`, `title` and `run()`; they were run one after another with a driver outside the repository, which prints PASS or the first line of the failure.

## Expected RED (the PLAN's tree)

| Case | Result |
| --- | --- |
| T258, T259, T260, T261 | `readRevision is not exported` |
| T262 | the command `revision-cli.mjs` is not built into `dist` |
| T263 | `readRevision is not exported from the main entry` |
| T264 | `SKILL.md does not name readRevision` |

7 of 7 fail, each for the reason the PLAN states. The shipped package-check suite on this tree: 113 Cases, 113 pass (`node --test 04-test/package-check/*.test.mjs`). This PLAN adds no file the suites run, so it changes neither.

## Each Case can pass (throwaway copy)

In a second throwaway copy with every draft of `interface.md` applied as the DO's file (the new files, the three small edits, the appended texts, the table row and the README line), rebuilt, T258 to T264 are 7 of 7 PASS. The shipped package-check suite of that copy: 113 Cases, 113 pass, so the new `bin` row, the new exports and the new documents do not break the existing interface, intent, architecture, requirements or allocation Cases.

## What the run showed in the design

- A first draft treated any non-zero `rev-parse` with a message on standard error as "could not be read". Git exits 1 with an error message for a blob or a tree given as a ref (`expected commit type`), which is "no such revision". T259 caught it, and the rule is now: exit 1 is no such revision; any other failure is unreadable.
- `execute` returns text, so a file that is not text (`ff fe 00 ...` in T258) cannot be read through it unchanged. The draft starts Git through `startPlan` with its own byte-keeping start, internal to `revision.ts`.
- A ref such as `--output=pwned` creates nothing (T259); `--end-of-options` is what keeps it data.
- Three Git starts for five files and for eighty (T261), counted from Git's own trace.

## What is not proven

Windows and macOS (the three-host lanes are the DO's evidence); that `GIT_TRACE` counts the same starts on every Git version in the lanes; reading a very large repository (the Cases read at most eighty files); and that the collector check can move to `readRevision` with unchanged output, which is the next Change's evidence.
