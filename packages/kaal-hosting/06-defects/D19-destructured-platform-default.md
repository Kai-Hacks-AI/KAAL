# hosting/D19: the coupling audit misses a platform name destructured from process with a default value

Owner: Hosting. Raised on 8 November 2026 from Codex's P2 finding on Foundation's synchronization PR #1204 (`couplings.ts`, already on main), reproduced by Hosting on Hosting 0.0.1 (2e45a5e). For `const { platform = "unknown" } = process`, the part is split on the colon only, so the name read is `platform = "unknown"` and not `platform`; the query is never recorded and no later use of the bound name is found. The same destructuring from `os` or `path` strips a default and is found.

## Record

```json
{
  "id": "hosting/D19",
  "context": "hosting (coupling audit, platform queries bound to a name)",
  "expected": "A platform name destructured from process is a platform query with or without a default value, and so is each later use of the bound name (hosting/F27, hosting/F32).",
  "observed": "`const { platform = \"unknown\" } = process;` followed by a use of `platform` reports no platform-query finding at either place, only a platform-literal for the string. Without the default, both places are reported.",
  "where": "packages/kaal-hosting/05-src/skills/kaal-hosting/scripts/couplings.ts, the destructuring of process (`const { platform } = process`)",
  "status": "open",
  "tests": ["hosting/T266", "hosting/T267"]
}
```

## Cases

| Identity | Role (a role of an ordinary Test Case, not a kind of Case) | File |
| --- | --- | --- |
| hosting/T266 | RED role on 2e45a5e: with a default value, neither the destructuring nor the later use is reported as a platform query | [destructured-platform-default.red.mjs](destructured-platform-default.red.mjs) |
| hosting/T267 | passes before and after the fix, behavior that already works and must keep working: without a default, both are reported | same file |

**Confirming Run (8 Nov, Node 24, Linux, 2e45a5e):** the Case in its RED role fails and the other passes. The fix is a separate Change; the Cases are not edited.
