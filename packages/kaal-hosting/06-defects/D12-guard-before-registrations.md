# hosting/D12: the portability audit does not challenge the cases registered after a platform guard that leaves the scope

Owner: Hosting. Raised on 8 November 2026 from Codex's P2 finding on #1171 at 1189f31 (`boundary-core.ts`, `affected`), reproduced by Hosting. It is a Defect in the portability audit, of the same family as hosting/D5, hosting/D10 and hosting/D11. A module-level `process.exit` guard is classified `setup` by `couplings` and is not part of this Defect. It is not caused by hosting/D11: `affected` only ever looked inside the guarding `if` statement itself.

## Record

```json
{
  "id": "hosting/D12",
  "context": "hosting (portability, challenged cases)",
  "expected": "A platform guard that returns from the suite callback a case is registered in challenges every case registered after it in that callback, because none of them is registered on the guarded host (hosting/F29, hosting/F40).",
  "observed": "`describe(\"suite\", () => { if (process.platform === \"win32\") return; it(\"case\", () => {}); })` leaves portability().challenged empty. The same guard inside a case challenges that case.",
  "where": "packages/kaal-hosting/05-src/skills/kaal-hosting/scripts/boundary-core.ts, affected (the if-statement scope)",
  "status": "answered",
  "tests": ["hosting/T235", "hosting/T236", "hosting/T237"]
}
```

## Cases

| Identity | Role | File |
| --- | --- | --- |
| hosting/T235 to hosting/T237 | RED on 1189f31: early return in a suite callback, as a block, in a nested suite | [guard-before-registrations.red.mjs](guard-before-registrations.red.mjs) |
| hosting/T238 | control, passes before and after: a case registered before the guard is not challenged | same file |
| hosting/T239 | control, added with the fix after Codex review: a return inside a guarded case's own callback (arrow or function) leaves only that callback and does not challenge the cases after the guard | guard-before-registrations.controls.mjs |

**Confirming Run (8 Nov, Node 24, Linux, d4feaba, the collector head carrying the D11 fix):** T235, T236 and T237 fail; T238 passes. The fix is a separate Change; the Cases are not edited.
