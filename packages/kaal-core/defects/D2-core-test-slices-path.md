# core/D2: a Core test slices a URL pathname's length off a host path and drops a letter on Windows

Owner: Core. Raised on 3 November 2026 from the same Windows run as core/D1 (run 41729719630). Classified by Core as a Core defect, the same kind as core/D1: a host path built from a file URL's `pathname`.

## Record

```json
{
  "id": "core/D2",
  "context": "core (tests)",
  "expected": "The test lists the source files of Core with their package-relative paths on any supported host.",
  "observed": "On Windows it opens packages\\kaal-core\\rc\\admitted.ts, the s of src missing, and fails with ENOENT.",
  "where": "packages/kaal-core/test/plan/love.test.mjs:39, in files(), used by core/T42",
  "status": "confirmed",
  "tests": ["core/T122"]
}
```

## Observed and cause

`e.parentPath.slice(new URL(PACKAGE).pathname.length)`. The pathname (`/D:/a/.../kaal-core/`) is one character longer than the real directory path (`D:\\a\\...\\kaal-core\\`) because of its leading slash, so the slice drops a letter. core/T123 shows the arithmetic.

## Case

| Identity | Role | File |
| --- | --- | --- |
| core/T122 | the RED Case: test/plan/love.test.mjs builds no host path from a URL's pathname | [windows-paths.red.mjs](windows-paths.red.mjs) |
| core/T123 | control, passes today (shared with core/D1) | same file |

**Case version:** blob `7a8bc2a8dc6162162913f4ba2061ef8199dcd2fa`, as for core/D1. **Answered** only by a Run in which core/T122 passes at that version, in the Change that fixes the line, with core/T123 still passing.

## Bounds and correction

Not a blocker for Hosting 0.0.1. Correction (a separate Change, travelling through `kaal/core`): derive the package directory once with `fileURLToPath` and slice that. It changes an existing test, so it needs an approved bounded amendment PLAN. This record changes no test, script or package. Both fixes are expected to be one Change.
