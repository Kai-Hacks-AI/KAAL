# hosting/D15: the portability audit names a case with an escaped literal title by its source spelling

Owner: Hosting. Raised on 8 November 2026 from Codex's P2 finding on #1179/#1180 (`titles()` and `challenged` in `boundary-core.ts`), reproduced by Hosting on Hosting 0.0.1 (2e45a5e). It is a limitation the parsed-tree rewrite of `affected` did not change: the title of a registered case is read as the text between its quotes, so an escape sequence stays as written.

## Record

```json
{
  "id": "hosting/D15",
  "context": "hosting (portability, challenged cases)",
  "expected": "A challenged case is named by the title the program registers at run time, so it matches the name Testing sees in the runner's report (hosting/F29, hosting/F40).",
  "observed": "A case whose literal title contains an escaped quote, registered with a platform-dependent skip, is listed in challenged with the backslash of the source text, not as the title the program registers.",
  "where": "packages/kaal-hosting/05-src/skills/kaal-hosting/scripts/boundary-core.ts, the registered-title reading (`titles()` and the call collection in `affected`)",
  "status": "answered",
  "tests": ["hosting/T258", "hosting/T259"]
}
```

## Cases

| Identity | Role (a role of an ordinary Test Case, not a kind of Case) | File |
| --- | --- | --- |
| hosting/T258 | RED role on 2e45a5e: the escaped title is named by its source spelling | [escaped-titles.red.mjs](escaped-titles.red.mjs) |
| hosting/T259 | passes before and after the fix, behavior that already works and must keep working: a title without an escape is named by that title | same file |

**Confirming Run (8 Nov, Node 24, Linux, 2e45a5e):** the Case in its RED role fails and the other passes. The fix is a separate Change; the Cases are not edited. **Answered:** the Cases pass unmodified with the fix, which reads literal titles through the TypeScript scanner so escapes are resolved, in titles() and in the call collection of affected() (boundary-core.ts).
