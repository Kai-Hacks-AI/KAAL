# C125 change

## PLAN

Three small pieces, in the judge and the library. Nothing here installs a workflow, sets a flag, changes a ruleset or imports Testing's code.

### Decisions (the approval of this pull request is the go for the DO)

1. **The judge reads the evidence as data.** `judgeHold` takes the file `observeCases` produced, `{ observed, evidence }`, as an input (the runner gets it as `--evidence <file>`); the contract is the shape of that file, never an import of Testing (T1314 keeps `lib` free of Testing's code). It reads only: `observed`, `evidence.catalog.complete`, `evidence.catalog.findings` and `unobservable`, `evidence.revision` and `evidence.expectedRevision`.
2. **What the judge answers from it.** UNKNOWN, naming the reason, when: no evidence file is handed (the answer today, kept); the file cannot be read or is not the shape the contract names; `catalog.complete` is not exactly `true`, even if every Case in `observed` is GREEN (the reason names the findings and the unobservable files); `revision` is not `expectedRevision` or either is absent (stale evidence is no evidence). A Case that is RED is a FAIL whatever the catalog says: incompleteness never turns a red Case into UNKNOWN. A Case that applies and is missing from `observed` is UNKNOWN, as today. PASS only when the catalog is complete, the evidence is for this revision, and every applicable Case is GREEN.
3. **`applicableCases` reads both quote forms** of `export const id`, `'...'` and `"..."`, and a file that declares an id in neither form is not a Case. This is the reading Testing's finding F158 asks for; the 36 double-quoted Case files become visible, and the Cases that name their element in a double-quoted `tests` list are read the same way.
4. **The three Cases of the pilot are landed, each as release's own Case.** J1: `judgeAct` with `acted` undefined, null, `'true'` or `1` answers UNKNOWN with `applies` true (kills M12). J2: `judgeHold` with `reflects: [1]` and `[null]` does not throw (`assert.doesNotThrow`) and answers UNKNOWN with `applies` true (detects M16 by assertion). J3: UNKNOWN with `applies` true for no applicable Case, an unobserved Case, an unknown `acted` and an unreadable carried Change, and `applies: false` only on a PASS. *Recommendation on M21 (answers built as literals, not through `lib/result.mjs`): pin the shape with J3 now and leave the construction as it is. Building every answer through `answer` and `pass` is the cleaner design and changes the judges' internals, so it is a separate small Change if the CPO wants it.* M20 and M23 need nothing.
5. **Runs without the evidence stay as they are.** The installed workflow hands no evidence file, so `hold Act` stays UNKNOWN, reported only, exactly as it is now. This Change changes nothing that runs until a later WIRE installs Testing's producing job and a copy of the workflow that passes `--evidence`; that WIRE needs the Owner's go.
6. **Sequence.** The DO touches `run-controls-act.mjs`, which release/C127 also changes (the record line). The DO of this Change follows the PROMOTION of C127 and starts from a collector synced with main; the PLAN names that SYNC so the collector is not found behind main (the learning of RT12).

### Cases (ids are taken at the DO, after the highest on main)

- the judge answers UNKNOWN for a complete-looking all-GREEN map when `catalog.complete` is false, is absent, or is not `true` (a string `'true'` is not `true`); and the reason names the findings;
- UNKNOWN for evidence of another revision, or with no revision; a RED Case is a FAIL even with an incomplete catalog;
- PASS only with a complete catalog, the right revision and every applicable Case GREEN;
- `applicableCases` finds a Case declared with double quotes and one with single quotes, and not a file that declares no id;
- J1, J2 and J3 as decision 4 states them;
- `judge-act.mjs` and `lib` import nothing of Testing, and the runner reads the evidence as a file.
