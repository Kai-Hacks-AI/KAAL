# release/D20: verify Sync picks what it applies to from the pull request title

Owner: the release capability (`05-src/sync-review`, `sync-review.yml`). Raised by Kai through the coordinator on controls' #2575 to #2579.

## Record

```json
{
  "id": "release/D20",
  "context": "release (verify Sync: workflow sync-review.yml and 05-src/sync-review/cli.mjs)",
  "expected": "Whether a pull request is a SYNC is read from the git content of its head against its base and the default branch: the head is a merge commit, one parent is the tip of the base and the other is a commit of the default branch that the base does not hold. Any other head is not a SYNC, verify Sync says so (PASS, applies false, nothing to verify) and judges nothing. The title and the body decide nothing.",
  "observed": "The three jobs of sync-review.yml run only when the title starts with `SYNC:`, and cli.mjs `isSync` tests the same prefix. Controls' pull requests #2575 to #2579 titled `SYNC: ...` were not merges of main and failed verify Sync until they were retitled DO; a real SYNC titled otherwise is not judged at all.",
  "where": "engineering/release-management/05-src/wiring/workflows/sync-review.yml (the if: of verify, approve and review), engineering/release-management/05-src/sync-review/cli.mjs (isSync)",
  "reach": "every pull request into a kaal/*, hotfix/* or wire/* base: its SYNC status follows a label and not the content",
  "tests": ["release/T1556"]
}
```

## State

The record holds no stored status. Confirmed is derived from the Case's observed verdict.

## Not decided here, and the remedy's

- The requirement that a SYNC body states a Reason is a pull request convention, not a file or git fact. It is a separate Finding for review and for verify Envelope, not for this control; `verify Sync` stops reading the body for it in this Change's remedy only if the CPO agrees, and is otherwise left as is.
- `approve Sync` and `review Sync` take their applicability from the same function afterwards, in the same DO, so no job of the workflow reads a title.
