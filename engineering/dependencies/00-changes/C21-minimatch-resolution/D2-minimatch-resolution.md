# engineering/D2: main resolves a `minimatch` version inside the range of GHSA-g3hv-75wg-m249

Owner: Engineering (the single root lockfile and its overrides). Raised on 19 November 2026 from Dependabot alert 3. The alert is a finding; it becomes this Defect because Case engineering/T385 proves the resolution on `main`. It is a deliberate exercise of the Hotfix path: the alert is real but normally too weak for a hotfix.

## Record

```json
{
  "id": "engineering/D2",
  "context": "engineering (root package-lock.json, dependencies of the kaal-testing workspace)",
  "expected": "No `minimatch` that package-lock.json resolves is inside the range of GHSA-g3hv-75wg-m249 (>= 7.0.0, < 11.0.1).",
  "observed": "package-lock.json resolves node_modules/minimatch 10.2.6, through kaal-testing, c8 12.0.0 and test-exclude 8.0.0 (`minimatch: ^10.2.2`), and again through glob 13.0.6, which no 10.x release can leave.",
  "where": "package-lock.json (node_modules/minimatch); package.json (no override)",
  "status": "answered",
  "tests": ["engineering/T385"]
}
```

## What is shown, and what is not

Shown: the lockfile of `main` resolves a `minimatch` inside the advisory range. Case engineering/T385 is RED on `main` at 07868a8 for that reason alone.

Not shown: that the vulnerable behavior is reached. The advisory concerns a denial of service from a crafted glob pattern. test-exclude passes minimatch only the include and exclude patterns of the c8 configuration, which this repository writes itself, so no pattern comes from outside. Lockfile presence is all this Defect shows.

State: `main` only. kaal-testing is not published (npm has no kaal-testing), so no production state is affected and none is claimed. A consumer of a later published kaal-testing would resolve `minimatch` through c8 itself; a root override does not travel with a package, and this correction does not address that.

## Cases

| Identity | Role | File |
| --- | --- | --- |
| engineering/T385 | RED on 07868a8: no resolved `minimatch` is inside the advisory range; also checks the range test itself on sample versions | T385.test.mjs |

**Confirming Run (19 Nov, Node 22, 07868a8):** T385 fails with `minimatch 10.2.6 at node_modules/minimatch`. **Answered (19 Nov, Node 22):** T385 passes unmodified with the correction: the lockfile resolves minimatch 11.0.1.
