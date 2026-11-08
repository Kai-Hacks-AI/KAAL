# hosting/D18: the coupling audit reports process.platform written inside a string as a platform query

Owner: Hosting. Raised on 8 November 2026 from Codex's P2 finding on Foundation's synchronization PR #1204 (`couplings.ts`, already on main), reproduced by Hosting on Hosting 0.0.1 (2e45a5e). The coupling audit finds `process.platform` with a pattern over the source text, so the same words inside a string or template literal are found too, and a message that only names the API makes the Boundary Check fail on production code.

## Record

```json
{
  "id": "hosting/D18",
  "context": "hosting (coupling audit, platform queries)",
  "expected": "A platform query is a use of the API in code. Text in a string or template literal that only mentions the API is not a query (hosting/F27, hosting/F32).",
  "observed": "`throw new Error(\"do not read process.platform here\");` is reported as a platform-query finding on line 1, and so is a template literal that mentions it. Comments are not reported; strings are.",
  "where": "packages/kaal-hosting/05-src/skills/kaal-hosting/scripts/couplings.ts, the platform-query patterns over the source text",
  "status": "open",
  "tests": ["hosting/T264", "hosting/T265"]
}
```

## Cases

| Identity | Role (a role of an ordinary Test Case, not a kind of Case) | File |
| --- | --- | --- |
| hosting/T264 | RED role on 2e45a5e: a message that only mentions process.platform is reported as a platform query | [platform-query-in-string.red.mjs](platform-query-in-string.red.mjs) |
| hosting/T265 | passes before and after the fix, behavior that already works and must keep working: a use of process.platform is a platform query | same file |

**Confirming Run (8 Nov, Node 24, Linux, 2e45a5e):** the Case in its RED role fails and the other passes. The fix is a separate Change; the Cases are not edited. A platform literal such as `"win32"` is a different rule (platform-literal) and is not changed by this Defect.
