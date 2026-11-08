# hosting/D12: the portability audit does not challenge the cases registered after a platform guard that leaves the scope

Owner: Hosting. Raised on 8 November 2026 from Codex's P2 finding on #1171 at 1189f31 (`boundary-core.ts`, `affected`), reproduced by Hosting. It is a Defect in the portability audit, of the same family as hosting/D5, hosting/D10 and hosting/D11. It is not caused by hosting/D11: `affected` only ever looked inside the guarding `if` statement itself.

## Record

```json
{
  "id": "hosting/D12",
  "context": "hosting (portability, challenged cases)",
  "expected": "A platform guard that returns from or exits the scope a case is registered in (a suite callback or the module) challenges every case registered after it, because none of them is registered on the guarded host (hosting/F29, hosting/F40).",
  "observed": "`describe(\"suite\", () => { if (process.platform === \"win32\") return; it(\"case\", () => {}); })` and the module-level `if (process.platform === \"win32\") process.exit(0); it(\"case\", ...)` leave portability().challenged empty. The same guard inside a case challenges that case.",
  "where": "packages/kaal-hosting/05-src/skills/kaal-hosting/scripts/boundary-core.ts, affected (the if-statement scope)",
  "status": "open",
  "tests": ["hosting/T235", "hosting/T236", "hosting/T237"]
}
```

## Cases

| Identity | Role | File |
| --- | --- | --- |
| hosting/T235 to hosting/T237 | RED on 1189f31: early return in a suite callback, as a block, a module-level exit | [guard-before-registrations.red.mjs](guard-before-registrations.red.mjs) |
| hosting/T238 | control, passes before and after: a case registered before the guard is not challenged | same file |

**Confirming Run (8 Nov, Node 24, Linux, d4feaba, the collector head carrying the D11 fix):** T235, T236 and T237 fail; T238 passes. The fix is a separate Change; the Cases are not edited.
