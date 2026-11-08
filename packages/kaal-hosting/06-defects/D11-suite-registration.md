# hosting/D11: the portability audit does not challenge the cases a platform-conditional suite encloses

Owner: Hosting. Raised on 8 November 2026 from Codex's P2 finding on #1030 at 68d5b28 (`boundary-core.ts`, `affected`), reproduced by Hosting. It is a Defect in the portability audit, of the same family as hosting/D5 and hosting/D10.

## Record

```json
{
  "id": "hosting/D11",
  "context": "hosting (portability, challenged cases)",
  "expected": "A platform finding that governs a suite registration (a skip option that queries the platform, or a conditional that picks the suite function) challenges every case the suite encloses, because none of them is registered on the excluded host (hosting/F29, hosting/F40).",
  "observed": "`describe(\"suite\", { skip: process.platform === \"win32\" }, () => { it(\"child\", ...) })` and `(process.platform === \"win32\" ? describe.skip : describe)(\"suite\", ...)` leave portability().challenged empty. The same skip written on an `it` challenges that case.",
  "where": "packages/kaal-hosting/05-src/skills/kaal-hosting/scripts/boundary-core.ts, affected (it recognises only it/test registrations)",
  "status": "open",
  "tests": ["hosting/T227", "hosting/T228", "hosting/T229"]
}
```

## Cases

| Identity | Role | File |
| --- | --- | --- |
| hosting/T227 to hosting/T229 | RED on 68d5b28: skip option on a suite, conditional suite selector, nested suites | [suite-registration.red.mjs](suite-registration.red.mjs) |
| hosting/T230 | control, passes before and after: a sibling case outside the suite is not challenged | same file |
| hosting/T231 | control, passes before and after: a suite with no platform condition challenges nothing | same file |

**Confirming Run (8 Nov, Node 24, Linux, 68d5b28):** T227, T228 and T229 fail; T230 and T231 pass. The fix is a separate Change; the Cases are not edited.
