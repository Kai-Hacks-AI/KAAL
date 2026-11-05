# PLAN: a promotion carries its own transition ledger entry

Date: 2026-11-03, revised 2026-11-04 for the CPO's review (trusted attestation, canonical digest, fail-closed re-evaluation). Engineering PLAN for CPO review and an Owner decision. It is Markdown only. It changes no checker, workflow, ruleset or ledger, and authorizes no promotion or publication. Inspected on `main` 7fa02ac and `kaal/engineering` a487139; reacquire before use.

## Intent

Today a multi-owner transition takes two promotions to `main`: first a focused, ledger-only promotion (#958 and #959 for the flat packages move, #1018 for Hosting 0.0.1), then the migration itself. The Owner called the extra PR junk and asked for a design that is still safe and sound: let one promotion carry its own entry, with no way for a change to authorize itself.

## Why the second PR exists

The checker reads the ledger from the **target's tip**, never from the candidate (`engineering/change-isolation/README.md`, "Why a candidate cannot authorize itself"). Without that, anyone could write an entry that admits their own bytes and so void "Core travels alone" for a change nobody else agreed to. The extra PR is the cost of one real property: **the commitment to the bytes is reviewed and merged separately from, and before, the migration that depends on it.** Removing the PR must not remove that property. It has to be replaced by an equivalent that does not depend on the author.

## Design

A candidate may carry an entry **in its own change to `transitions.json`** when all of the following hold. The checker is still read from the target, and the candidate can never change it.

1. **The ledger diff is one appended entry.** Compared with the target's `transitions.json`, the candidate's file differs only by one added entry at the end. No existing entry is edited, reordered or removed, and there are no two additions. The file stays `{ version: 1, transitions: [...] }` and passes `readLedger` unchanged.
2. **The entry is exactly the rest of the change.** The entry's `paths` equal the changed paths **minus the ledger file itself**. Every `pre` blob equals the target's blob and every `post` blob equals the candidate's, as for any entry today. It still never admits `.github`, the ledger or the checker, so the ledger's own change is the only exception, and only as the entry's addition.
3. **An independent attestation names the entry.** The adapter passes the checker one extra fact, `--attested <id>:<sha256 of the entry's canonical JSON>`. It takes the fact from a GitHub review that is **not the author's**: an approving review by a code owner of the file (`.github/CODEOWNERS`, #1017) **at the candidate's head SHA**, whose body carries the line `ledger-entry: <id> sha256:<digest>`. A new push dismisses the approval (the ruleset already dismisses stale approvals), so the attestation is bound to exactly these bytes. Without that fact, an entry in the candidate admits nothing and the change is judged by the default rules.
4. **Spent by adoption, as today.** After the merge the target holds the post blobs, so `pre` no longer matches and the entry cannot admit a second change.

Why this is as safe as the two-PR route: the author alone can no longer authorize anything (rule 3), the reviewed commitment is bound to the exact bytes (rule 3, the digest and the head SHA), an edit to history or to a sibling entry is refused (rule 1), and the entry cannot reach beyond what was changed (rule 2). What it gives up is the **separate merge** of the entry; what replaces it is a **separate, author-independent attestation** in the same PR.

## The gate must be re-evaluated when the attestation changes

`.github/workflows/change-isolation.yml` runs only on `opened`, `synchronize`, `reopened` and `edited` of the pull request. An approval is a **review** event, so as the workflow stands the check would stay failed after the attestation arrives, and would stay passed after the attestation is dismissed. Both are wrong: a late approval must admit the change, and a withdrawn one must stop admitting it. The implementation scope therefore includes trusted review-event handling:

- **Trusted dispatch path.** A `pull_request_review` workflow runs the definition found on the pull request's merge ref, so a candidate that edits workflow YAML could change or remove its steps; adding the trigger to `change-isolation.yml` would not keep today's trusted-execution model. Instead: (1) an untrusted **relay** on `pull_request_review` (`submitted`, `edited`, `dismissed`) does nothing but upload the event's identifiers (PR number, review id) as an artifact and is trusted for nothing; (2) a **`workflow_run` handler** triggered by the relay's completion runs the definition from the default branch, which a candidate cannot change, and independently reacquires every fact from the API (PR, current head, reviews, author, the target's CODEOWNERS, `attesters.json` and ledger) before recomputing the verdict. It ignores the relay's payload beyond the PR number, and it reports the required check on the PR's head SHA. Review events from a fork or an unexpected repository are ignored.
- Only the head SHA the review was recorded against counts, as in rule 3. A review on an older head never admits a newer one.
- Fail closed: if the reviews cannot be read, the result is "cannot judge", not "admitted", and a stale pass is not left standing.
- This is a `.github` change. It is its own `.github`-only Change and promotion, not part of the checker Change, and it travels alone like #949.

## Trusted attestation: who, at which head, and what counts

Revised 2026-11-04 after the CPO's review of this PLAN (trust of review identity and exact head SHA, canonical digest, fail-closed re-evaluation). Everything below is judged by trusted code from the target's tip, with the candidate treated as data.

**Who counts.** A review is an attestation only when all of these hold at the moment of judging:

1. It is read from the GitHub reviews API (never from a comment, never from the candidate's files), and its `state` is `APPROVED`. A `COMMENTED` review carrying the line counts for nothing.
2. Its `commit_id` equals the pull request's **current** head SHA, read from the API in the same run, and equals the **judged candidate SHA** the adapter fetched as Git data and passes as `GUARD_HEAD`. (The job's checkout is the trusted default branch, never the candidate, so the checkout is not the comparand.) The pull request's head is read again at the end of the run and must still equal that judged SHA. If the head moved while the job ran, the verdict is "cannot judge" (exit 2) and is not attached as a pass.
3. The reviewer is a code owner. The owner list is read from `.github/CODEOWNERS` **at the target's tip**, never the candidate's, so a candidate cannot add itself as an owner. The authorized numeric GitHub user id is **pinned in trusted target-held data**, not derived from the login at judging time (a recycled login would resolve to the new account on both sides of the comparison): `engineering/change-isolation/attesters.json`, read from the target's tip like the ledger, lists `{login, id}` for each code owner, and every login in CODEOWNERS must have a pinned entry or the result is "cannot judge". The review counts only when the reviewer's numeric id equals the pinned id; the login is informational. Adding or changing a pinned attester is an ordinary reviewed Change and promotion, never part of a candidate that relies on it. Only a plain user entry is understood; a team entry, a pattern other than `*`, or an unreadable file is "cannot judge".
4. The reviewer is not the pull request's author (author id read from the API). Self-approval counts for nothing.
5. It is that reviewer's **latest** review on the pull request. A later review by the same person (approval without the line, a changes-requested review, a dismissal) supersedes it. GitHub's own per-user latest state is used, not an earlier approval found by scanning.
6. Its body holds exactly one line that matches `^ledger-entry: ([a-z0-9][a-z0-9-]*) sha256:([0-9a-f]{64})$`. Zero lines, two lines or a line that does not match fully means no attestation. The body is read as it is now, so an edited review body is judged as edited.

The attested id must equal the id of the single appended entry, and the digest must equal the one the checker computes itself (below). The checker never accepts a digest from the author or from the workflow's inputs.

**Canonical digest.** One byte form per entry, so two honest implementations cannot disagree:

- The entry has exactly the keys `id`, `paths`, `pre`, `post`. Any other key, a duplicate key at any level, or a non-string value where a string belongs is refused, not normalized.
- `id` matches `^[a-z0-9][a-z0-9-]*$`. `paths` is an array of unique strings, already in ascending order of their UTF-8 bytes (the checker refuses an unsorted or duplicated list instead of sorting it, so there is no second spelling of the same entry). `pre` and `post` map each path in `paths` to a lowercase 40-hex Git blob id or to `null`, and have no other keys.
- Serialization is JSON Canonicalization Scheme (RFC 8785): keys sorted by UTF-16 code unit, no whitespace, minimal string escapes, encoded as UTF-8 with no byte order mark and no trailing newline.
- The digest is the lowercase hex SHA-256 of those bytes. The checker computes the digest with Foundation's SHA-256 (`@kaihacksai/kaal-foundation/sha256`), as AGENTS.md requires for any KAAL digest; the checker does not use `node:crypto` for it. The Case pins test vectors (a fixed entry, its canonical bytes and its digest) computed once with an external tool (`sha256sum`) and held as constants, so the vectors stay independent of the implementation and a change in the algorithm turns a Case RED. If Foundation's SHA-256 is not reachable from the checker where it runs on `main` when this is implemented, that is an Owner question to raise first, not a reason to fall back to `node:crypto`.

**Fail closed on a withdrawn approval, without trusting a stale pass.** A successful check is a status on a head SHA and a dismissal does not remove it, so the design never relies on the old pass:

- Ordering inside the job: the first step sets the check to `in_progress` (not success) for the head SHA, before any reading. Every review event (`submitted`, `edited`, `dismissed`) therefore revokes any earlier pass immediately, and the job then completes it with the verdict from a read taken **at the end** of the run, after the checkout and the computation. If any read fails, the job ends "cannot judge", and the check is never left green.
- Runs for one pull request share a concurrency group and are not cancelled mid-flight, and each run reads current state itself, so the last run to finish never reports an older state than an earlier one.
- Ruleset as the second line: with "Require review from Code Owners" on, a withdrawn or replaced approval also leaves the pull request without the code-owner approval it needs, independent of this check.
- **Residual window: decided (Owner, 5 November 2026, option A).** Between a review event and the job's first step (the seconds GitHub takes to start the workflow) the earlier pass can still stand. The Owner accepted that window and keeps auto-merge on for every pull request, including one that carries its own entry. No exception to the auto-merge rule is made. Why it is acceptable:
  1. **Exploiting it needs the code owner.** The window is only open when the code owner withdraws or replaces the very approval that authorizes the merge, in the same seconds auto-merge fires. Nobody else can create it, and the author cannot.
  2. **What can merge is bound to the bytes.** Whatever merges in the window carries an entry that was attested at that exact head: the approval is tied to the head SHA and to the entry's canonical digest, a push dismisses it, and the checker recomputes both from the target-held ledger, so no other bytes ride on the old pass.
  3. **A second line holds independently.** The ruleset requires a code owner approval to merge, and a withdrawn or replaced approval removes it; the check is not the only gate.
  4. **It is the same trust as any approval.** A code owner who withdraws an approval in the instant auto-merge fires can equally approve and merge a change they should not; the window adds no power the owner does not already hold.
  5. **It is short and visible.** The first workflow step sets the check `in_progress` on every review event, and the end-of-run read re-verifies the head and the reviews, so the pass is not left standing after the window closes.

  What is not accepted is a silent gap: any failure to read the reviews, or a head that moves during the run, is "cannot judge", never a pass. If the window is ever judged too wide, the tighter form (no auto-merge on a pull request that carries an in-PR entry, a person presses merge after the check is current) remains available as its own Owner decision.

**Scope and gating.** The checker and adapter Change and the review-event trigger stay two separate Changes. The trigger is a `.github`-only Change and promotion that travels alone (like #949) and is explicitly Owner-gated. Nothing in this section is implemented, and the attestation line is a proposal, not an Owner-authorized form.

## Consequences to decide

- **The pre-push hook cannot see the attestation.** It would refuse an in-PR entry (fail closed), the same shape as D2. That is acceptable only if documented, and it must never admit more than CI does. The agreement test T83/T89 pattern applies.
- **Dependence on CODEOWNERS.** The attestation is meaningful only if the Owner has turned on "Require review from Code Owners" for `main` and `kaal/*` and the file is on `main` (#1017 and its promotion). Until then the two-PR route stays the only route.
- **Trust anchor.** The adapter reads reviews through the GitHub API as the workflow token. That is a new dependency of the gate on an external service. If it fails or is rate limited the result is "cannot judge" (exit 2), never "admitted".
- **Alternative not recommended:** keep the entry in the PR and have the CPO's plain approval suffice. It is simpler, but then nothing ties the approval to the entry, so a later push that swaps the entry can slip past a reviewer who only checked the migration.
- **Alternative out of scope:** replacing "Core travels alone" with another rule. This PLAN keeps the rule and changes only how an exception is authorized.

## Cases, RED first

Each Case is written and shown RED against today's checker before any implementation, and answers the design only when the same unchanged Case turns GREEN. Placement: Engineering's own context, `engineering/change-isolation/`, with controls beside each.

| Case | Setup | Expected | Today |
| --- | --- | --- |  --- |
| R1 admitted | a change touching Core and other owners plus its own appended entry and a matching attestation | admitted | RED (refused) |
| R2 no attestation | R1 without the attestation | refused | passes |
| R3 wrong digest | attestation for a different entry digest | refused | passes |
| R4 stale head | attestation recorded for another head SHA | refused | passes |
| R5 commitments off | the entry's blobs do not match the change | refused, naming the path | passes |
| R6 two additions or an edited, removed or reordered entry | ledger diff is not one appended entry | refused | passes |
| R7 reach | entry names `.github`, the checker or an extra path | refused | passes |
| R8 spent | the same entry after its post state is on the target | refused | passes |
| R9 candidate checker | the change edits `check.mjs` | still refused | passes |
| R10 ledger-only | a change that only appends an entry (#958 route) | unchanged | passes |
| R11 agreement | pre-push and CI on R1 and R2 | the hook refuses wherever CI would, and never admits what CI refuses | planned |
| R12 late approval | R1 where the attestation arrives after the first refusal | admitted after re-evaluation, with no new push | RED (stays refused) |
| R13 withdrawn approval | R1 admitted, then the review is dismissed | refused again, the earlier pass not left standing | RED (stays passed) |
| R14 canonical digest | published vectors: key order, whitespace, unsorted or duplicate paths, duplicate key, extra key, non-ASCII path | one digest per entry; every non-canonical spelling refused | RED (no digest exists) |
| R15 wrong reviewer | the author's own approval; an approval by a non-owner; a candidate that adds itself to CODEOWNERS or to `attesters.json`; a pinned login whose account id differs from the pinned id (recycled login); a CODEOWNERS login with no pinned entry | refused | passes |
| R16 not an approval | a `COMMENTED` or `CHANGES_REQUESTED` review carrying the line; the line in a plain comment | refused | passes |
| R17 superseded | owner approves with the line, then approves again without it | refused | RED (stays passed) |
| R18 two lines or edited body | two attestation lines; a body edited to another digest | refused | passes |
| R19 cannot read | reviews API fails, rate limited, or the head moves during the run | cannot judge (exit 2), no pass left standing | RED |
| R20 pending first | the workflow's first step on any review event | the check is `in_progress` before anything is read | RED |
| R21 trusted dispatch | a candidate that edits or removes the relay or handler workflow steps, or forges the relay artifact's payload | the verdict is unchanged: the handler runs from the default branch and reacquires every fact | RED |

R2 to R10 and R15, R16, R18 are controls: they pass today and must keep passing, which guards against a design that admits everything.

## Order

1. CPO review of this PLAN, then the Owner's decision on rule 3's form.
2. Owner enables Code Owner reviews on `main` after #1017 reaches `main`.
3. RED Cases in Engineering's context (a separate Change), then the implementation in `check.mjs` and `change-isolation.sh` (a Change to `kaal/engineering` and a normal promotion), and the review-event trigger (a `.github`-only Change and promotion).
4. **Sequence decided (Owner, 5 November 2026, option B):** this lands on `main` before Hosting 0.0.1, and the Hosting promotion carries its own entry, derived once from its final head. It is built as three Changes: the RED Cases (#1098), the checker and adapter, then the `.github`-only review-event workflows, each promoted in order with the Owner's go and the CPO's approval at the head. The earlier statement that Hosting keeps the two-PR route and nothing waits for this no longer holds.

No promotion or publication is authorized by this document.
