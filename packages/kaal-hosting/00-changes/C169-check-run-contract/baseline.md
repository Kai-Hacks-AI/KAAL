# C169 baseline

The baseline is `main` with hosting/C117.

- `postCheckRun(repo, check, { grant })` makes one POST and compares GitHub's answer with the request: name, revision, status, conclusion, the App and a numeric id.
- The returned fact carries `externalId` when the caller gave one, taken from the request, not from the answer.
- A key of the check outside `{ name, revision, conclusion, title, summary, externalId }` is `INVALID_CHECK` only when its value is not `undefined`.
- Cases T345 to T348 hold; none sets an external id the answer disagrees with, or a stray key whose value is `undefined`.
