# Known failures: Testing

The planned Cases live in `packages/kaal-testing/test/plan/expected-failures/`, named `T<n>.red.mjs` with `lib.mjs` and `run-red.mjs`. Each exports `id`, `tests`, `title` and `run()`. They are immutable to DO. `testing/C68` renames them `.test.mjs` and adds a wrapper to Testing's `npm test`. They pack the package, install it into an empty directory and observe the installed copy, so they need network access to the registry for Hosting and `c8`; if the registry or npm is unavailable a Case ends as an error (UNKNOWN), never as RED.

| Case | Checks | What it decides |
| --- | --- | --- |
| testing/T374: a held expected failure is listed and nothing observed changes | testing/F149 | the export exists, a registered RED is `held`, the input report is not changed, equal input gives equal output, an invalid register throws |
| testing/T375: a registered entry is held, not holding, unconfirmed or absent, and a RED nobody listed is unexpected | testing/F150 | one fixture file with a RED, a GREEN, a skipped test and an unregistered RED; provisional for an id of a file that was not run |
| testing/T376: the command adds the expectations and refuses a bad register | testing/F151 | `run --expect` embeds the result, the rest of the report is unchanged, exit 0; an unreadable or invalid register exits 2 with no report |
| testing/T377: abstract and without a verdict | testing/N33 | no concrete owner or consumer named in the new files, no deciding field in the output |

## RED evidence

`node packages/kaal-testing/test/plan/expected-failures/run-red.mjs`. See `evidence.md`.
