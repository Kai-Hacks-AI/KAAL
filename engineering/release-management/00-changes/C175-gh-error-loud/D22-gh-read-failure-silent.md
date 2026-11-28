# release/D22: a failed `gh` read of the Promotion Source entries does not say why it failed

Owner: the release capability. Raised on 28 November 2026 from Operations' diagnosis of the blocked promotion of release/C168 (#3005).

## Record

```json
{
  "id": "release/D22",
  "context": "release (the entries of Promotion Source, engineering/release-management/05-src/promotion-source/lib/run.mjs, gh)",
  "expected": "A read that fails names the reason of the failure: the exit status and the first line of what gh printed, so a rate limit is told apart from a rules problem.",
  "observed": "gh() throws `<path> cannot be read` for any non-zero exit and discards the error text, so `HTTP 403: API rate limit exceeded` and a missing rule give the same message.",
  "where": "engineering/release-management/05-src/promotion-source/lib/run.mjs, gh",
  "reach": "main",
  "status": "confirmed",
  "tests": ["release/T1740"]
}
```

## What is shown, and what is not

Shown: T1740 runs `gh()` with a stub `gh` that exits 1 and prints `HTTP 403: API rate limit exceeded`, and reads the thrown message. State: `main`; no package or production state is affected.

Not shown: the rate limit itself, which only the live API shows. The answer for the check stays UNKNOWN.

## Cases

| Identity | Role | File |
| --- | --- | --- |
| release/T1740 | RED on main: the thrown message carries the exit status and the first error line; GREEN with the correction | T1740.test.mjs |

**Confirming Run (28 Nov, Node 22, Linux, b37d70b):** T1740 fails with `the exit status is named`. **Answered (28 Nov, Node 22, Linux):** T1740 passes unmodified with the correction.
