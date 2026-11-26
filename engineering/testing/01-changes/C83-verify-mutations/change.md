# C83 change

## Finding

Targeted Mutation Verification (Testing's Skill) is run by hand: a Change keeps patches and a `run.sh` (for example controls C147's `mutations/run.sh` and `run-at-do-head.txt`), and a surviving mutant is found only when someone reads the output. Kai asked that surviving mutations be detected automatically. The runner already says RED only for an assertion and UNKNOWN for an error, a timeout or an incomplete run, which is the distinction killed versus unresolved needs; what is missing is a step that applies a mutant, runs its Cases and records the outcome.

## PLAN

1. A spec form `kaal-testing/mutants@1` (mutants as exact `find`/`replace` changes with the Cases that should detect them), a runner `lib/mutate.mjs` (`runMutants`, pure `classify`) and a record `kaal-testing/mutation-report@1`, as in `F176` and `A62`. Command `kaal-testing mutate`; export `./mutate`. `run`, `observe` and `observe-at` stay.
2. Cases `testing/T414` to `testing/T419`, plain `.test.mjs` in their destination folders (the `C30` and `C80` precedent), RED on this tree and GREEN in place in the DO:
   - `T414` (`testing/I51`), `T415` (`testing/F176`), `T416` (`testing/A62`): each file equals its draft.
   - `T417` (`testing/F176`): over a fixture with two Cases and seven mutants, a mutant that flips an operator is `killed` with `killedBy`, a mutant of code no Case checks is `survived` and its id is in `survivors`, a mutant whose `find` is absent, or occurs twice, or equals `replace` is `invalid`, a mutant that makes the Case fail to import is `unresolved` and never killed, a mutant that never ends is `unresolved` with a timeout problem, `counts` add up, and `complete` is false.
   - `T418` (`testing/F176`): when every mutant is killed or survived and the baseline is `ok`, `complete` is true; a baseline that is RED, incomplete or has a file without a test makes every mutant `invalid` with the reason and the record not complete; `root` is byte for byte the same after a run; a mutant is run in a scratch copy, so a mutant that writes into its tree cannot change `root`.
   - `T419` (`testing/F176`): the command writes `mutation-report.json` and exits `0` when a mutant survived, exits `2` and writes nothing for a wrong schema, a duplicate id, a file outside `root`, an empty list or a missing `--spec` or `--out`.
3. Evidence: `T414` to `T419` RED on this tree, `T414` to `T416` GREEN on a throwaway DO with the drafts placed, `T417` to `T419` GREEN with a throwaway prototype of the runner.

## Boundary with the other capabilities

- **Testing** owns the spec form, the classification and the record.
- **The caller** (a Change, a control, a job) owns which mutants to run, what a survivor means for it (equivalent mutant or a gap in its Cases), and any gate or ratchet over `survivors`. The existing mutation records of other capabilities keep working as they are and can move to the spec later.
- **Engineering or release** would wire a job that runs `mutate`: a separate Change that needs Kai's go, advisory first. This Change wires nothing.

## Residual risks, kept visible

- A survivor is not a defect: an equivalent mutant also survives. The record names survivors and decides nothing.
- A mutant killed by an assertion in a Case that was meant for something else is still killed; `cases` and `claim` let a reader see what was meant, and the Skill's rule (the intended assertion detects) stays a reader's judgment.
- Mutants run candidate code. A Case that lies about its result, or a mutant that rewrites the report path, is not excluded by files; the record is evidence for a reader, not enforcement.
- `copy` limits what a scratch tree holds. A Case that imports a package from `node_modules` needs it named in `copy`; otherwise its mutants are `unresolved`, never killed.

## Not in this Change

No mutant generation from operators, no wiring, no flag, ruleset or required check, no ratchet, no change to `run`, `observe` or `observe-at`, and no move of the existing patch sets.

## Ids

Change `testing/C83`, Intent `testing/I51`, Requirement `testing/F176`, Architecture `testing/A62`, Cases `testing/T414` to `testing/T419`. Ids are taken by hand; on a clash the newer PR renumbers.
