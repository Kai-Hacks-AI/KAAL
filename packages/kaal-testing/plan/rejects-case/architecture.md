# Reject-a-Case Enforcement: Architecture

Each element names, in brackets, the Requirements it answers.

- **testing/A48** [testing/F134, testing/F135, testing/F136, testing/N29]: A second trial under `plan/rejects-case/trial/do/`, beside the first, with its own key, prompts, runs and comparison. Its Cases are `test/plan/rejects-case/T360` to `T362`, run by `test/plan/rejects-case.test.mjs` once GREEN. They reuse the read-only helpers of `test/plan/testability/lib.mjs` for reading, hashing and the answer checks, and add the rule for `rejectsCase`. Nothing in `lib/`, `capability/`, `payload/` or `skills/` changes.

## What owns what

| Concern | Owns |
| --- | --- |
| The owner of the real Case in the trial | the Case and its key. The trial never edits or tunes them |
| Whoever judges the delivery | whether a rejection is right, and the independence of the key |
| Testing, by the Skill | the decision to reject a Case |
| Testing, by the Script | only the shape and integrity of the answers and the comparison |

## Change graph

| Change | Owner | Depends on |
| --- | --- | --- |
| `testing/C61` PLAN, this Change | Testing | `testing/C60`, on main |
| `testing/C62` DO: the trial under `plan/rejects-case/trial/do/`, T360 to T362 GREEN | Testing | `testing/C61` |
| A change to the Skill, only if the trial shows the Skill arm leaves `rejectsCase` out | Testing | `testing/C62` |
