# Standalone use of kaal-testing: Evidence

The PLAN observes its RED against `main` (753bc3c0), which holds no runner yet, and against the same tree plus the runner collector `kaal/testing/run-cases` (testing/C63, C64; promotion #2012). Work that is not on `main` is not delivered, so the first column is the one that counts.

## Provenance

- Method: `node packages/kaal-testing/test/plan/standalone/run-red.mjs`; each Case packs the package, installs it into a fresh temp directory with network access to the registry, and observes the installed copy. Observed 19 Nov 2026 on Node 22.23.4 (the sandbox has no Node 24; Node 24 is shown by CI at the DO).
- Hosting 0.0.1 and `c8` 12.0.0 resolved from the registry.

## Result

| Case | Checks | On `main` | On `main` plus the runner collector |
| --- | --- | --- | --- |
| T370 | F146 | RED: the installed package has no command | green |
| T371 | F147, N32 | green (declared dependencies already hold) | green |
| T372 | N32 | RED: `README.md:140` and `lib/report.mjs:41` name Engineering | RED: the same, and `lib/run.mjs` lines 2 and 164 name kaal-change and Guard |
| T373 | F148 | RED: no command to run the fixture with | RED: no run is recorded (`runs/` is absent) |

On `main`: 3 RED-observed, 0 error, 1 green. With the runner collector: 2 RED-observed, 2 green. The red Cases wait for the DO: the scrubbed names and the recorded trial.

## Can each Case pass, and can it fail for the right reason

- Against a throwaway reference outside the repository (the runner collector with the four outside names rewritten and three synthetic recorded runs), all four Cases were green. The reference is not part of this PLAN and implies no wording of the DO. The fixture yields the key's counts (2 GREEN, 1 RED, 3 UNKNOWN) with the installed package.
- Six mutants of the reference each failed the Case that names them, on its own assertion: an extra runtime dependency (T371), an outside name added to the runner (T372), an undeclared Hosting (T370, T371 and T373: the installed command cannot start), a must item `not met` (T373), a quote that is not in the transcript (T373), the judge in the same session as the agent (T373).
- A registry failure is an error, not RED, by construction (`install()` throws a plain Error on network failure).

## What this shows and does not show

The deterministic Cases show that the package installs, runs and names nothing from outside. They do not show that it is good to use: that is the trial, one pilot of three runs, which shows what three agents did once, judged against a key written first. The key is this PLAN's judgment; the CPO judges it with the PLAN. The synthetic runs are for validating the Case only and are not evidence of use. No operational claim is made.

## Open decisions (not blocking the PLAN)

- **D1.** `lib/attribution.mjs` reads the claim file `ownership.kaal.json`, a KAAL-named file. The scan does not flag a file name, so T372 passes it, but a consumer outside KAAL would meet it. A neutral claim format supplied by Engineering belongs to the controls-level path (steps 3 and 4), not to this Change.
- **D2.** No baseline arm (the same trial without the Skill) is run; add one only if the three runs leave doubt.

## Reproduce

```
node packages/kaal-testing/test/plan/standalone/run-red.mjs
```
