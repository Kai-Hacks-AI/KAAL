# hosting/D20: the coupling audit drops the rest of a line after a regular expression that ends with an escaped slash

Owner: Hosting. Raised on 8 November 2026 from Codex's P2 finding on Testing's synchronization PR #1213 (`couplings.ts`, already on main), reproduced by Hosting on Hosting 0.0.1 (2e45a5e). The comment stripper reads `\/\/` at the end of a regular-expression literal as the start of a `//` comment, so the rest of the line is removed before the platform patterns run. The boundary gate and the scan both read the stripped source, so a platform decision on such a line passes without a finding.

## Record

```json
{
  "id": "hosting/D20",
  "context": "hosting (coupling audit, comment stripping)",
  "expected": "Only a comment is removed before the audit looks for platform couplings. A regular-expression literal, including one that ends with an escaped slash, is code and what follows it on the line is read (hosting/F27, hosting/F32).",
  "observed": "`const isURL = /https?:\\/\\//.test(url); if (process.platform === \"win32\") runWindows();` reports no coupling finding, while the same line with `/^https:/` reports the platform query and the platform literal.",
  "where": "packages/kaal-hosting/05-src/skills/kaal-hosting/scripts/couplings.ts, the comment stripping of the source text",
  "status": "open",
  "tests": ["hosting/T268", "hosting/T269"]
}
```

## Cases

| Identity | Role (a role of an ordinary Test Case, not a kind of Case) | File |
| --- | --- | --- |
| hosting/T268 | RED role on 2e45a5e: the platform query after a regular expression that ends with an escaped slash is not found | [regex-literal-before-comment.red.mjs](regex-literal-before-comment.red.mjs) |
| hosting/T269 | passes before and after the fix, behavior that already works and must keep working: the same line with a regular expression without an escaped slash is found | same file |

**Confirming Run (8 Nov, Node 24, Linux, 2e45a5e):** the Case in its RED role fails and the other passes. The fix is a separate Change; the Cases are not edited.
