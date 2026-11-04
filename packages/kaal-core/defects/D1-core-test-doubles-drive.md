# core/D1: a Core test joins a file URL's pathname onto a path and doubles the drive on Windows

Owner: Core. Raised on 3 November 2026 from the one-off Windows run of Core's full suite at kaal/hosting 17c2173 (run 41729719630). Classified by Core as a Core defect: the test builds a host path by hand from a URL, where Node's `fileURLToPath` (node:url, which Core's tests may use) gives the host path. Not a Hosting defect: Hosting is not involved in this line.

## Record

```json
{
  "id": "core/D1",
  "context": "core (tests)",
  "expected": "The test finds the repository root on any supported host.",
  "observed": "On Windows it reads D:\\D:\\a\\KAAL\\KAAL\\.kaal and fails with ENOENT.",
  "where": "packages/kaal-core/test/core.test.ts:219, 'keeps the id, name and type of every Node in this repository, and only the genesis has no type'",
  "status": "confirmed",
  "tests": ["core/T121"]
}
```

## Observed and cause

`join(dirname(new URL(import.meta.url).pathname), "..", "..", "..")`. On Windows `pathname` is `/D:/a/KAAL/KAAL/packages/kaal-core/dist-test/core.test.js`, not a Windows path. Core control core/T123 shows it.

## Case

| Identity | Role | File |
| --- | --- | --- |
| core/T121 | the RED Case: test/core.test.ts builds no host path from a URL's pathname | [windows-paths.red.mjs](windows-paths.red.mjs) |
| core/T123 | control, passes today: why `pathname` is not a Windows path and `fileURLToPath` is | same file |

**Case version:** the Git blob id of `windows-paths.red.mjs`, `7a8bc2a8dc6162162913f4ba2061ef8199dcd2fa`. The Case reads the test file as text, so it is RED on any host. Run by hand: `node --test defects/windows-paths.red.mjs` from `packages/kaal-core`. Confirming Run: core/T123 passes, core/T121 and core/T122 fail, naming line 219 and line 39.

**Answered** only by a later Run in which core/T121 passes, at this Case version, in the Change that fixes the file, with core/T123 still passing.

## Bounds and correction

Not a blocker for Hosting 0.0.1; the fix belongs to Core 0.0.1 and travels through `kaal/core`. Correction (a separate Change): use `fileURLToPath(import.meta.url)` in that one line. It changes a test and so needs an approved bounded amendment PLAN. This record changes no test, script or package.
