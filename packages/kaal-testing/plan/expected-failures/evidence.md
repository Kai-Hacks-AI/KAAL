# Known failures: Evidence

The PLAN observes its RED against `main` (1168212), which holds the runner (testing/C63, C64) and no expectations.

## Provenance

- Method: `node packages/kaal-testing/test/plan/expected-failures/run-red.mjs`; each Case packs the package, installs the tarball into a fresh temp directory with network access to the registry, and observes the installed copy. Observed 20 Nov 2026 on Node 24.22.1 (`/opt/node24/bin`; the sandbox default is Node 22).
- Hosting resolved from the registry. The reference below uses the published Hosting, as the installed package does.

## Result

| Case | Checks | On `main` | Against the reference |
| --- | --- | --- | --- |
| T374 | F149 | RED: `kaal-testing/expectations` does not resolve (`ERR_PACKAGE_PATH_NOT_EXPORTED`) | green |
| T375 | F150 | RED: the same | green |
| T376 | F151 | RED: `run --expect` exits 2, "--expect is not a file" | green |
| T377 | N33 | RED: `lib/expectations.mjs` is absent from the installed package | green |

On `main`: 4 RED-observed, 0 error, 0 green.

## Can each Case pass, and can it fail for the right reason

- Against a throwaway reference outside the repository (a copy of the package with `lib/expectations.mjs`, the export, `--expect` in the command and one paragraph in the README and the Skill), all four Cases were green. The reference is not part of this PLAN and implies no wording of the DO.
- Six mutants of the reference each failed the Case that names them, on its own assertion:
  - a registered GREEN not reported as no longer holding: T375;
  - a registered UNKNOWN reported as held: T375 and T376 (the lists differ);
  - an id of a file that was not run not marked provisional: T375;
  - the function changing the observed counts it was given: T374, T375, T376;
  - the command exiting 1 when a RED is unexpected, which turns a list into a verdict: T376 and T377;
  - a deciding field (`pass`) added to a state: T377. This mutant first passed T377 because the Case ran a register that never produced that state; the Case now runs a register that produces every state, so the mutant fails it.
