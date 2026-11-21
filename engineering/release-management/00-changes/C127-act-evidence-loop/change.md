# C127 change

## PLAN

Three small pieces and a stated bar. Nothing here sets a flag, installs a workflow or changes a ruleset.

### Decisions (the approval of this pull request is the go for the DO)

1. **One record per judge per run.** The runner of `controls ACT` prints, next to its report line, one stable line per judge: `act-evidence {"judge","check","pr","merge","run","verdict","applies","attribution"}` where `attribution` is `complete` or `missing` (what `isolate Changes` returned) and `merge` and `run` carry the merge-result sha and the run id (a record is evidence, never enforcement). The line is plain output of a job that already runs, so no new permission, no App and no write by the workflow. *Recommendation; the alternative, a run artifact, adds a download step for no gain.*
2. **The ledger is a file, kept with the control.** `04-controls/CTL<n>-<name>/evidence.jsonl` holds the records of that judge, one per line, appended by a Change (a DO or an ACT-side batch the owner approves), each carrying its run id as the recorder. A pure function `summarizeEvidence(records)` in `05-src/phase/lib/` reads the ledger and returns, per judge: runs, PASS, FAIL, UNKNOWN, and for each non-PASS whether it is handled (a `handled` field naming the Defect, Change or reason). It reads files only, imports no process (T1314), and names the layer.
3. **Unobserved is not evidence.** A record whose `attribution` is `missing` (the interim UNKNOWN) is counted as `unobserved`, never as a PASS or a clean UNKNOWN. A judge is not qualified by runs that could not see the pull request.
4. **The advisory bar** is a test the summary answers, per judge: at least ten records with complete attribution, no FAIL that is not handled by a named Defect or Change, no UNKNOWN that is not handled, and at least one provoked FAIL in the control's own evidence. The number ten is the owner's to set; the PLAN proposes it because the first ten runs were the sample that exposed D18. The summary reports the bar as MET or NOT MET with the reasons; it does not flip a flag. Going advisory stays the owner's go, in a Change that sets the flag.
5. **The loop closes in the ACT.** The retro of a collector quotes the summary of the judges that judged it, so the learning is read from the ledger and not from memory.
6. **Not here.** `hold Act` reading Testing's evidence is release/C125; the workflow names control is C124; the source-versus-installed control is C126. This Change adds none of them and depends on none.

### Cases (ids are taken at the DO, after the highest on main)

- the runner prints one record per judge with the six fields, and an incomplete attribution prints `missing`;
- `summarizeEvidence` counts a `missing` record as unobserved, a FAIL without `handled` as unhandled, and answers NOT MET with the reason;
- ten complete, clean records and one provoked FAIL answer MET; nine do not;
- the library imports no process and reads no history; the ledger is read as a file.
