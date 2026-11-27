# release/D21: check 1 answers "does not apply" for a fast-forward synchronization

Owner: the release capability. Raised on 27 November 2026 from the Owner's ruling that a synchronization is always a merge commit.

## Record

```json
{
  "id": "release/D21",
  "context": "release (the entries of check 1, release/CTL42 and release/CTL23, through lib/report.mjs)",
  "expected": "A head that is already on the default branch is judged whole like any other change; a fast-forward synchronization is not a synchronization and is refused by the lineage verdict.",
  "observed": "The entries answer 'does not apply (the head is already on the default branch)' and write no record, so a fast-forward synchronization passes check 1 silently.",
  "where": "engineering/release-management/05-src/change-isolation/lib/report.mjs, changedPaths and cli",
  "reach": "main",
  "status": "confirmed",
  "tests": ["release/T1605"]
}
```

## What is shown, and what is not

Shown: T1605 builds a collector behind `main` and runs the entry on `main`'s tip, with the result printed. State: `main`; no package or production state is affected.

## Cases

| Identity | Role | File |
| --- | --- | --- |
| release/T1605 | RED on main: the skip answers does not apply; GREEN without it | T1605.test.mjs |
| release/T1606 | pins the lineage refusal of a fast-forward, green on main | T1606.test.mjs |
