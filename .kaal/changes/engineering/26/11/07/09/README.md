# Engineering: Cases for the approval-event handler under deferred attestation (B1 F5)

Capability: Engineering. Target: kaal/engineering-b1-f5cases. Record number is provisional until integration (08 holds the activation Cases).

## Intent

The third trial window found that the approval-event handler (`change-isolation-review.yml`) re-judged a ledger-bearing pull request in strict mode on every approval and wrote a failing `Change Isolation` run over the pull request job's deferred pass. An unattested promotion could therefore never reach the merge queue and `Change Isolation (review)`. F5 is a `.github` only Change (one literal in the handler's judging step), so it travels without Cases. This Change gives it its Cases, so the properties the CPO set for it are held by a test: no line is judged by deferred structural validation with a pending attestation, a correct line for the exact entry is verified strictly, an incorrect or stale attestation fails closed and is never converted into deferred admission, a malformed or over-claiming entry fails closed, `.github`, the checker and the ledger are never admitted through an entry, and the handler cannot override or weaken `Change Isolation (review)`.

## Content

`engineering/github/handler-deferred.red.mjs`, hand-run (no suite or lane names it), six Cases T162 to T167. The executable ones read the environment the handler's judging step really sets and run the real judging script on a scratch repository that holds the real checker.

- T162: the deferred literal is set once, in the handler's judging step env, with no expression, and nowhere else in the handler.
- T163: no line passes with the pending line printed; a correct line is verified and not deferred.
- T164: a wrong digest and a line for another entry id fail and are not deferred.
- T165: a post blob that is not the candidate's, and a path the entry does not list, fail with no line.
- T166: `.github` and checker paths are refused through an entry, with and without a correct line.
- T167: only the pull request job, the handler and the group's `Change Isolation` job name the flag; the handler never names `Change Isolation (review)` or a merge group; the review, admission and relay workflows stay strict.

No ledger entry is carried.

## Check

Against `main` (no F5): T162, T163 and T167 RED; T164 to T166 GREEN as regression guards. With F5: 6 of 6 GREEN. Mutations on the F5 tree: deferred taking precedence over an explicit attestation turns T163 and T164 RED; an expression for the literal turns T162 and T163 RED; the flag in a review workflow turns T167 RED. The Cases do not show GitHub's behaviour; Case 6 is the live proof.

## Act

Hand-run until the trial. No queue, ruleset, promotion or publication beyond the runbook.
