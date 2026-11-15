# hosting/D10: `couplings` classifies a multi-line platform-conditional registration as setup

Owner: Hosting. Raised on 5 November 2026 from Codex's P2 finding on #1030 at df4ae4c (`couplings.ts`, `classify`), reproduced by Hosting. It is a classification Defect in the portability audit, of the same family as hosting/D5.

## Record

```json
{
  "id": "hosting/D10",
  "context": "hosting (couplings, portability classification)",
  "expected": "A platform finding in a conditional expression that picks a test registration on either branch is `registration`, however the expression is laid out (hosting/F29, hosting/F40).",
  "observed": "`(process.platform === \"win32\"\\n  ? () => {}\\n  : it)(\"conditional\", () => {})` classifies both platform findings as `setup`, so portability().challenged is empty although the case is never registered on Windows. The same expression on one line is `registration`.",
  "where": "packages/kaal-hosting/05-src/skills/kaal-hosting/scripts/couplings.ts, classify (the line-based conditional test)",
  "status": "answered",
  "tests": ["hosting/T201", "hosting/T202", "hosting/T203"]
}
```

## Cases

| Identity | Role | File |
| --- | --- | --- |
| hosting/T201 to hosting/T203 | RED on df4ae4c, GREEN with the fix: registration on the false branch, on the true branch, and a skip branch, branches on later lines | [multiline-conditional-selector.mjs](multiline-conditional-selector.mjs) |
| hosting/T204 | control, passes before and after: the one-line selector | same file |
| hosting/T205 | control, passes before and after: a multi-line conditional that picks no registration stays `setup` | same file |

**Confirming Run (5 Nov, Node 24, Linux, df4ae4c):** T201, T202 and T203 fail; T204 and T205 pass. **Answering Run (same, with the fix):** all five pass and `npm run test:publisher` passes.
