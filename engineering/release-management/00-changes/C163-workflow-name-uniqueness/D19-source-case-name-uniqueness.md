# release/D19: a source Case fails once its own WIRE is installed

Owner: the release capability. Raised on 27 November 2026 from the check 1 detective WIRE (#2787), red in Engineering and Workspaces.

## Record

```json
{
  "id": "release/D19",
  "context": "release (the Case release/T1581 of C160, the shape of the source change-isolation-plain.yml)",
  "expected": "Once the WIRE of the source installs its delivered copy under .github/workflows, the Case still passes: its workflow name is unique among other workflows.",
  "observed": "The Case leaves out only the wiring copy of its own file name. The delivered copy in .github/workflows has the same name and is counted as another workflow: it fails with 'the workflow name is not unique', and pull/T34 fails with it ('release/T1581 is logged but not as a success').",
  "where": "engineering/release-management/00-changes/C160-adapt-change-isolation-plain/T1581.test.mjs, the `others` list",
  "reach": "main; the same check holds in release/T1576 (C157, a collector) and was fixed in release/T1577 (C158, a collector)",
  "status": "confirmed",
  "tests": ["release/T1597"]
}
```

## What is shown, and what is not

Shown: the Engineering and Workspaces checks of #2787 fail on T1581, and T1597 reproduces it in a scratch repository with the delivered copy installed.

State: `main`. No package or production state is affected.

## Cases

| Identity | Role | File |
| --- | --- | --- |
| release/T1597 | RED on 4f85546: T1581 fails with the delivered copy installed; GREEN with the correction; another workflow of the same name still fails | T1597.test.mjs |
