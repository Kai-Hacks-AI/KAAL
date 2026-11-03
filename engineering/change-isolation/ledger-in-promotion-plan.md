# PLAN: a promotion carries its own transition ledger entry

Date: 2026-11-03. Engineering PLAN for CPO review and an Owner decision. It is Markdown only. It changes no checker, workflow, ruleset or ledger, and authorizes no promotion or publication. Inspected on `main` 7fa02ac and `kaal/engineering` a487139; reacquire before use.

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

R2 to R10 are controls: they pass today and must keep passing, which guards against a design that admits everything.

## Order

1. CPO review of this PLAN, then the Owner's decision on rule 3's form.
2. Owner enables Code Owner reviews on `main` after #1017 reaches `main`.
3. RED Cases in Engineering's context (a separate Change), then the implementation in `check.mjs` and `change-isolation.sh`, each a separate Change to `kaal/engineering` and a normal promotion.
4. Until it is on `main`, Hosting 0.0.1 keeps the agreed two-PR route (#1018). Nothing waits for this.

No promotion or publication is authorized by this document.
