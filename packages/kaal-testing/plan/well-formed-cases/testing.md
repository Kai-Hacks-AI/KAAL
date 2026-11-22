# Well formed Test Cases: Testing

The planned Cases live in `packages/kaal-testing/test/plan/well-formed-cases/`, named `T<n>.red.mjs` (`T391` is a plain `T391.test.mjs`, as new Cases are) with `lib.mjs` and `run-red.mjs`. Each exports `id`, `tests`, `title` and `run()`. They are immutable to DO. `testing/C70` renames them `.test.mjs` and adds a wrapper under `npm test`. Each packs the package, installs it into an empty folder and observes the installed command.

| Case | Checks | What it decides |
| --- | --- | --- |
| testing/T378: first line, Case id and declared id | testing/F152 | a well formed Case has no finding; a missing first line, an id without a namespace and an id the file declares differently each give exactly their one finding; two comma-separated targets are allowed; a finding is `{ file, line, kind, detail }` |
| testing/T379: unique ids and existing targets | testing/F153, F154 | a duplicate id is reported against each file; a missing target is named; with no element list the report is `targets.checked: false` and says nothing about targets |
| testing/T380: reports, does not decide | testing/F155, N34 | exit 0 with findings, equal output on equal input, no verdict field, exit 2 on an invalid element list, rewording the prose after the edge changes nothing, no concrete peer named in the shipped module, the package describes the command |
| testing/T391: one reader of identity, with the catalog | testing/F164 | `check-cases --root` without files lists the same Case files as the catalog, a double-quoted and a single-quoted id both; a Case with no first line is still checked and reported, never missing; `lib/form.mjs` reads declarations through the catalog and holds no id pattern of its own |

## RED evidence

`node packages/kaal-testing/test/plan/well-formed-cases/run-red.mjs` on Node 24. See `evidence.md`.
