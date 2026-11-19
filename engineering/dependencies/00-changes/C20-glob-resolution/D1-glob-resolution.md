# engineering/D1: main resolves a `glob` version inside the range of GHSA-3g3m-2fjr-6pw4

Owner: Engineering (the single root lockfile and its overrides). Raised on 19 November 2026 from Dependabot alert 1. The alert is a finding; it becomes this Defect because Case engineering/T384 proves the resolution on `main`. It is a deliberate exercise of the Hotfix path: the alert is real but normally too weak for a hotfix.

## Record

```json
{
  "id": "engineering/D1",
  "context": "engineering (root package-lock.json, dependencies of the kaal-testing workspace)",
  "expected": "No `glob` that package-lock.json resolves is inside the range of GHSA-3g3m-2fjr-6pw4 (>= 9.0.0, <= 14.0.1).",
  "observed": "package-lock.json resolves node_modules/glob 13.0.6, through kaal-testing, c8 12.0.0 and test-exclude 8.0.0 (`glob: ^13.0.6`), which no 13.x release can leave.",
  "where": "package-lock.json (node_modules/glob); package.json (no override)",
  "status": "confirmed",
  "tests": ["engineering/T384"]
}
```

## What is shown, and what is not

Shown: the lockfile of `main` resolves a `glob` inside the advisory range. Case engineering/T384 is RED on `main` at 07868a8 for that reason alone.

Not shown: that the vulnerable behavior is reached. The advisory concerns a cancellation through an `AbortSignal` that does not stop the traversal. test-exclude calls `glob` with `cwd`, `nodir`, `dot`, `posix` and `ignore`, and passes no signal, so the repository's own use does not exercise it. Lockfile presence is all this Defect shows.

State: `main` only. kaal-testing is not published (npm has no kaal-testing), so no production state is affected and none is claimed. A consumer of a later published kaal-testing would resolve `glob` through c8 itself; a root override does not travel with a package, and this correction does not address that.

## Cases

| Identity | Role | File |
| --- | --- | --- |
| engineering/T384 | RED on 07868a8: no resolved `glob` is inside the advisory range; also checks the range test itself on sample versions | T384.red.mjs |

**Confirming Run (19 Nov, Node 22, 07868a8):** T384 fails with `glob 13.0.6 at node_modules/glob`. **Answered** by a Run in which T384 passes unmodified with the correction.
