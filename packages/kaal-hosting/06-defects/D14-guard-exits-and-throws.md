# hosting/D14: a platform guard that throws or exits the process is not treated as a registration guard

Owner: Hosting. Raised on 8 November 2026 from Codex's P2 finding on #1174 at c208f02 (`couplings.ts`, classification), reproduced by Hosting. It is a Defect in the portability audit, of the same family as hosting/D12, whose fix decides in `affected` whether a guard leaves its scope. That decision is never reached for these guards, because `couplings` classifies them `setup` and `portability` only asks `affected` about `registration` and `dilution` findings. D12's record excluded the module-level `process.exit` guard; this Defect covers it.

## Record

```json
{
  "id": "hosting/D14",
  "context": "hosting (portability, challenged cases)",
  "expected": "A platform guard that throws or exits the process is a registration guard like one that returns: every case registered after it in the scope is challenged, because none of them is registered on the guarded host (hosting/F29, hosting/F40).",
  "observed": "`describe(\"suite\", () => { if (process.platform === \"win32\") { process.exit(0); } it(\"after\", () => {}); })` and the same guard with `throw new Error(...)` classify the platform finding as `setup`; portability().challenged is empty.",
  "where": "packages/kaal-hosting/05-src/skills/kaal-hosting/scripts/couplings.ts, the if-condition branch of the classification (returnsFromBranch)",
  "status": "open",
  "tests": ["hosting/T246", "hosting/T247"]
}
```

## Cases

| Identity | Role | File |
| --- | --- | --- |
| hosting/T246, hosting/T247 | RED on 4d80a07: the guard exits the process, the guard throws | [guard-scope.red.mjs](guard-scope.red.mjs) |
| hosting/T248 | control, passes before and after: a throw caught by a try/catch around the guard challenges nothing after it | same file |

**Confirming Run (8 Nov, Node 24, Linux, 4d80a07, the collector head carrying the D12 fix):** T246 and T247 fail; T248 passes. The fix is a separate Change; the Cases are not edited.
