# C127 change

## PLAN

Three small pieces and a stated bar. Nothing here sets a flag, installs a workflow or changes a ruleset.

### Decisions (the approval of this pull request is the go for the DO)

1. **One record per judge per run.** The runner of `controls ACT` prints, next to its report line, one stable line per judge: `act-evidence {"judge","check","pr","merge","run","verdict","applies","attribution"}` where `attribution` is `complete` or `missing` (what `isolate Changes` returned) and `merge` and `run` carry the merge-result sha and the run id (a record is evidence, never enforcement). The line is plain output of a job that already runs, so no new permission, no App and no write by the workflow. *Recommendation; the alternative, a run artifact, adds a download step for no gain.*
2. **The ledger is a file, kept with the control.** `04-controls/CTL<n>-<name>/evidence.jsonl` holds the records of that judge, one per line, appended by a Change the owner approves, each carrying its run id as the recorder. A pure function `summarizeEvidence(records)` in `05-src/phase/lib/` reads the ledger and returns, per judge, the counts (runs, PASS, FAIL, UNKNOWN, unobserved, not-applicable PASSes) and the two outcomes of decision 4. It reads files only, imports no process (T1314), and names the layer.
3. **Unobserved is not evidence.** A record whose `attribution` is `missing` (the interim UNKNOWN) is counted as unobserved. It counts toward nothing: not the trigger, not a PASS, not a clean UNKNOWN.
4. **Quantity triggers review; quality determines readiness; the Owner authorizes advisory.** The summary keeps these apart and never lets one stand for the other.
   - **Trigger (quantity).** What counts is **one run of the judge on a real ACT pull request, with complete attribution (`applies` true), on a distinct pull request**: ten such runs per judge open a quality review. A run on a pull request that is not an ACT (a DO, a PLAN, a SYNC: the judge answers "not an ACT", `applies` false) is recorded in the ledger but counts toward nothing, because it says nothing about how the judge judges an ACT. A re-run of the same pull request counts once (the latest record of that pull request stands). The result is `trigger reached` or `trigger not reached`, with the count of counted runs and of recorded runs shown side by side. Ten is a pragmatic first observation window (five may be too early, twenty delays feedback), not a statistical reliability claim.
   - **Quality review (independent of the count).** At the trigger the review assesses: whether the observed verdicts match the facts; whether the relevant PASS, FAIL and UNKNOWN decision boundaries have been exercised; whether any judgment defect remains unresolved (a linked but open Defect is not correctness, so a `handled` label alone clears nothing); and whether an intentionally provoked violation actually challenges that judge's contract. Repeated not-applicable PASSes alone cannot qualify a judge. The result is `READY`, `NOT READY` or `MORE EVIDENCE NEEDED`, each with its reasons. The summary computes the facts the review needs (which boundaries were exercised, how many PASSes were not applicable, which non-PASS records are unresolved); the verdict is the reviewer's, recorded in the ledger as a review entry naming the reviewer.
   - **More evidence.** The next observation trigger is set deliberately in that review entry, not by adding ten automatically.
   - **Advisory** stays the Owner's go, in a Change that sets the flag. The summary never flips a flag and never equates a count or a `handled` label with readiness.
5. **The loop closes in the ACT.** The retro of a collector quotes the summary of the judges that judged it, so the learning is read from the ledger and not from memory.
6. **Not here.** `hold Act` reading Testing's evidence is release/C125; the workflow names control is C124; the source-versus-installed control is C126. This Change adds none of them and depends on none.

7. **`isolate Changes` has a trust bar of its own, recorded in CTL33.** The Owner agreed that the control that sorts a pull request's paths reuses the shape of decision 4 and not a second one. The DO adds one line to `04-controls/CTL33-isolate-changes/CTL33.md` (its rollout, step 2): ten runs on distinct pull requests with complete attribution open the quality review. Any pull request into a collector counts, a SYNC and a DO included, because this control sorts paths and does not judge an ACT. The review must have seen at least one SYNC, one pull request that mixes own and inherited paths, and one conflict-resolution edit (real or provoked), and each run's attribution is checked by a person against the diff; one wrong attribution is a Defect and restarts the count. READY, NOT READY and MORE EVIDENCE NEEDED, and the Owner's go for advisory, are as in decision 4. This line sets no flag and installs nothing.

### Cases (ids are taken at the DO, after the highest on main)

- the runner prints one record per judge with the six fields, and an incomplete attribution prints `missing`;
- `summarizeEvidence` counts a `missing` record as unobserved and not toward the trigger; nine ACT runs on nine distinct pull requests answer `trigger not reached`, ten answer `trigger reached`;
- a record with `applies` false ("not an ACT") is kept and shown as recorded, never counted; ten of them answer `trigger not reached`; two records of one pull request count once;
- a ledger of ten counted records that exercise no boundary beyond the plain PASS answers `trigger reached` and no boundary exercised, and the summary never answers READY;
- a non-PASS record marked `handled` by a Defect still open is reported unresolved, not as correct;
- the summary exercises-boundaries view lists PASS, FAIL and UNKNOWN as exercised only by applicable records, and lists the provoked violation only when its record is flagged as provoked;
- a review entry sets the outcome and a next trigger; without one the summary reports `no review`, and a count alone never produces a review outcome;
- the library imports no process and reads no history; the ledger is read as a file.
- the record of `isolate Changes` carries the line of decision 7 (T1360 reads the record: it keeps its flag and check name).
