# C153 change

## Reason

From 2 December 2026 the four required checks below stop reporting. Each needs a replacement that decides from files and git content on plain `pull_request`, with its evidence gathered before enforcement and before any ruleset is touched.

## The four checks, in order, and what each needs

1. **Change Isolation** (`change-isolation.yml`). **Correction of this PLAN's first reading:** `isolate Changes` (CTL33) is not its replacement. `isolate Changes` only attributes a pull request's own paths so the ACT judges can judge them; it does not judge what Change Isolation judges (Core travels alone, `.github` travels alone, the transition ledger, a verified synchronization), which is `engineering/change-isolation/check.mjs` run through `engineering/github/change-isolation.sh`. Replacement: the same checker, the target's own copy read from Git at the target's tip, run by a plain `pull_request` workflow that fetches the head as Git data from `refs/pull/<n>/head` (the mechanism of release/C90), with `contents: read` and no secret. During the detective phase it runs under its own job name; at the swap it takes the name `Change Isolation`, so the ruleset context is unchanged. Needs: the checker's inputs re-supplied without the base token, then run evidence read and the Owner's go for the swap. **The head read is bound to the revision of the triggering event**: the fetched `refs/pull/<n>/head` must equal `github.event.pull_request.head.sha`, and a mismatch or an unreadable ref is refused (cannot judge), never passed; a pull request that moved is judged by its own newer event. The Case is **release/T1571**, established here (`05-src/wiring/T1571.red.mjs`, parked, red until the DO installs the source): it resolves and compares the actual facts both workflows supply (head, base, target, default branch, attestation, and the command), runs the fetch step against a scratch origin for a match, a mismatch and a missing ref, and runs the existing checker's properties through the same script for each workflow (outside `.github`, `.github` alone, `.github` with another path, deletion and rename out of `.github`, an already-admitted head, a target without the checker, a missing fact). The DO satisfies it without changing it. The ledger and the verified synchronization stay with the checker's own Cases (engineering/change-isolation); this one does not weaken them. Trusted execution of the workflow is the proof held before any enforcement, not this Case. Still first, because the checker exists and only the trigger changes.
2. **Branching** (`lineage-synchronization.yml`). Replacement: its promotion-freshness verdict retires into the merge queue (release/I63, CTL32, the `promoting` ruleset's queue rule), and the lineage part is judged from git by verify Sync (release/C152) and the Dispatcher (release/C136). Needs: the queue rule loaded by the Owner, C152 and C136 DOs on the line, evidence.
3. **Change Isolation (review)** (`merge-group-admission.yml`). Replacement: the same checker as 1, on the merge group, plain `merge_group`. Needs: check 1 proven, then the same checker wired for the queue event.
4. **Promotion Source** (`promotion-source.yml`). Replacement: a promotion source judged from the pull request as Git data, with the host adapter supplying trustworthy bytes (the one item the CPO and CTO hold). Last, because it guards `main` and needs the CTO's trust-boundary proof before DO.

## Dependencies on the Inspector (the owner-agreed trusted relay)

- **Checks 1 to 3 have no Inspector dependency.** They decide from files and git content on plain `pull_request` or `merge_group`, need no token, and go first.
- **`approve Sync` and `review Sync` wait on the KAAL Approver App (the Owner's ruling: an App).** They hold a token that a plain `pull_request` run does not have. The Owner ruled that an App, not a person or a bot account, is the answer. The Inspector (release/C102) signs checks and never approves, so the approval is a separate third App, KAAL Approver (the Owner's name, for now), with its own key (release/C102 records the split: Inspector, Dispatcher, KAAL Approver). `verify Sync` itself moves to plain `pull_request` in release/C152 and does not wait.
- **Check 4 (Promotion Source) waits on three things:** the Inspector App, the host adapter that supplies trustworthy bytes of the source and the preimage from `main` (Hosting), and the CTO's trust-boundary proof. By the ownership cut proposed to the Owner, Release owns the Promotion Source control and Hosting owns the adapter; this is not settled until the Owner rules.
- **Status, read at this time:** release/C133 (required workflows run from the ruleset's ref) has its revised PLAN (#2494) merged into `kaal/release/delivery-ruleset-gates` and authorizes no DO, WIRE, ruleset change or flag. release/C102 (the Inspector App) is a PLAN under CPO review on `kaal/release/inspector-app`. None of the three Apps exists yet and the Inspector's trust-boundary proof is outstanding, so nothing here may assume them by 2 December.

## Who owns which App (the Owner's ruling)

- **KAAL Inspector** (signs checks) and **KAAL Approver** (approves) are owned by **review**. C102 is handed over to the review thread.
- **KAAL Dispatcher** (raises pull requests) stays with **release**. It raises PROMOTIONs today and may later dispatch other pull request types, so release does not hard-wire it to PROMOTION only.
- **Hosting** owns the GitHub App adapter for all three: manifests, token minting, API calls and the logo slots. Release and review consume it and do not carry their own App plumbing.
- This Change depends on the Approver (owned by review) for `approve Sync` and `review Sync`, and on the Inspector for check 4; Release asks, Review delivers.

## Per check, the same steps

The CPO's sequence, per check:

1. Implement and test the replacement before installing it (its own Change: DO behind its flag, detective, with its Cases).
2. The Owner-authorized detective WIRE installs it. No flag live as a requirement, nothing required.
3. Gather operational evidence from its real runs. Evidence comes after the detective installation, not before it.
4. Evidence is read, then the Owner authorizes enforcement and the ruleset swap of the required context.
5. Retire the old workflow; the ratchet falls by one.

Evidence is required before enforcement, never before the detective installation. Dropping a check is the fallback only: if a check has no evidence by 2 December, the Owner decides on dropping it, and a drop is an explicit Owner decision per check and its own listed step.

## Amendment: the evidence before enforcement, per control

Steps 3 and 4 above leave open how much evidence a check needs and where it is kept. This chapter settles both. It adds no step and changes none. Four kinds of evidence are kept apart, and each is counted only for what it is.

**1. Verification run (V).** A real run (`x: real`) of the delivered job of a control, written as a record through the controls adapter and collected by release/C162, with the verdict PASS or REPORT (FAIL when the control is preventive). It is identified by the control, the run id and the revision judged: the head revision of the pull request. A fixture run, a hand-written record, a pull request body and a run that says the verdict does not apply are not a V. The DIRT Running fact (controls/C158, `judgeRunning`) reads the same records; a missing proof is UNKNOWN, never permission.

**2. Agreement (A).** A V on a revision on which the old check also ran, with the same verdict: the old check green is PASS, red is FAIL. The old check counts only for the same revision of the same pull request. A V on a revision the old check did not run on is not an A and not a disagreement. A disagreement blocks enforcement until the Owner decides it, and the decision is recorded.

**3. Provoked demonstration (P).** A throwaway pull request made on purpose and closed after its run, to show a verdict that real pull requests do not produce. It is a V of the expected FAIL. The old check need not have run on it: when it did, the verdicts are compared as an A; when it did not, the P counts as a demonstration only, never as an A. A provoked run that does not give the expected verdict is a defect of the control, not a miss to be repeated.

**4. Coverage of a situation that does not apply (N).** The run says the verdict does not apply, with the reason, for a situation that must not be judged (a head already on the default branch, an ordinary Change in the synchronization verdict, auto-merge off, a pull request that is not a promotion). It proves that applicability was decided correctly in that situation, once per situation, and nothing else: it is never a V, never an A, and never counts toward any total.

**Counting.** One distinct revision of one pull request counts once for each control and situation, however often it ran. At least 5 comparable runs (A) of each situation that yields a verdict on real pull requests, and no fewer than 15 A in all for the check. At least 3 P for each verdict that is a FAIL, as a demonstration. At least 1 N for each situation that must not be judged. There is no minimum span: the counts matter, not the time they take.

| Check | Controls | Situations (A: agreement; P: provoked; N: not applicable) |
| --- | --- | --- |
| 1 Change Isolation | release/CTL42, release/CTL23 | A: PASS on an ordinary change; PASS on a WIRE (`.github` alone); a verified synchronization judged by its own resolutions only. P: FAIL on `.github` mixed with another path. N: a head already on the default branch |
| 2 Branching | release/CTL37, release/CTL38, release/CTL39 | CTL37 A: fresh PASS; P: stale FAIL. CTL38 A: valid synchronization PASS; P: invalid synchronization FAIL; N: an ordinary Change. CTL39 A: right method PASS; P: wrong method FAIL; N: auto-merge off |
| 3 admission | release/C157, not a control | Admission evidence below, not V, A, P or N |
| 4 Promotion Source | release/CTL40, release/CTL41 | A: valid source PASS. P: invalid source FAIL. N: a pull request that is not a promotion |

**Check 3 is admission, not verification.** It is not a control: it has an entry-free `notControls` row, it runs no adapter verdict and it supplies no PASS or FAIL record. Its evidence is a demonstration, kept as files and counted by itself: at least 5 admitted pull requests shown admitted, at least 3 pull requests shown refused (provoked is allowed), each bound to its run id and revision; and, for the preservation of the merge-group judgement, at least 5 merge-group runs of the Review check whose verdict is unchanged by the admission (read from the runs, with the revision each judged). The old check is compared on the same revisions where it ran.

**Where it is kept.** In files, never in pull request bodies: one file per check, `00-changes/C153-replace-pull-request-target/evidence/check-<n>.md`, with one table per kind (V and A with the old check's verdict, P, N, and for check 3 the admission and preservation runs), each row giving the control, the run id, the revision, the pull request and the verdict. The Owner's decisions (enforcement, the swap, the retirement of the old workflow, and a drop on 2 December) are recorded in this Change's record, one line each. The trusted-execution proof is kept apart and is required as before, not replaced by run evidence.

## Not in this Change

No replacement is built here, no WIRE, flag, required check or ruleset change. The live rulesets are read, not assumed, before the first swap. Whether `approve Sync` and `review Sync` keep working is not decided here.

## Cases

The existing target Case release/T1123 (held RED until the count is 0) is this Change's measure. Each replacement's own Change carries its Cases.
