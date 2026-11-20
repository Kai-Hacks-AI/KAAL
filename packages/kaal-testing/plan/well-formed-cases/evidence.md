# Well formed Test Cases: Evidence

The PLAN observes its RED against `main`, which holds the runner and no `check-cases` command.

## Method

`node packages/kaal-testing/test/plan/well-formed-cases/run-red.mjs`, Node 24.22.1, registry reachable. Each Case packs the package and installs the tarball into a fresh folder; an infrastructure failure is an Error (UNKNOWN), never RED.

## Result

| Case | Checks | On `main` | Against the reference |
| --- | --- | --- | --- |
| T378 | F152 | RED: the command prints the `run` usage and exits 2 | green |
| T379 | F153, F154 | RED: the same | green |
| T380 | F155, N34 | RED: findings cannot be asserted, the command is absent | green |

On `main`: 3 RED-observed, 0 error, 0 green.

## Can each Case pass, and can it fail for the right reason

- A throwaway reference outside the repository (a copy of the package with `lib/form.mjs`, the export and a `check-cases` branch in the command) turns all three green.
- Mutants of the reference each fail the Case that names them: exit 1 on findings (T380); targets checked against an empty list when none was supplied (T379); duplicate detection removed (T378, T379, T380); the id the file declares ignored (T378).
- A mutant that required prose after the edge was not produced by my edit, so T380's wording assertion is shown only by its own reading, not by a mutant. The Case rewrites the text after the edge and expects an unchanged result.

## What this does not show

The reference reads files with Node, the real command uses Hosting. Wiring, deployment and the element list's source are not tested here.
