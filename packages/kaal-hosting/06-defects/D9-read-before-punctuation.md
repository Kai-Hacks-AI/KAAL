# hosting/D9: `couplings` misses a platform query read before a comma, colon or closing brace

Owner: Hosting. Raised on 5 November 2026 from Codex's P2 finding on #1030 at 29981d4 (`couplings.ts`, the token test in `identifierUses`), reproduced by Hosting. It is a detection Defect of the same class as hosting/D5 to hosting/D8.

## Record

```json
{
  "id": "hosting/D9",
  "context": "hosting (couplings, boundary detection)",
  "expected": "A platform query bound to an identifier is a finding wherever the identifier is read in production code (hosting/F28, hosting/F32).",
  "observed": "`const { sep } = require(\"node:path\"); module.exports = [sep, \"x\"];` and `flag ? sep : \"/\"` produce no finding; the same read as `= sep` is one. The scanner discarded any identifier followed by `,`, `:` or `}`.",
  "where": "packages/kaal-hosting/05-src/skills/kaal-hosting/scripts/couplings.ts, identifierUses",
  "status": "answered",
  "tests": ["hosting/T196", "hosting/T197", "hosting/T198", "hosting/T200"]
}
```

## Cases

| Identity | Role | File |
| --- | --- | --- |
| hosting/T196 to hosting/T198 | RED on 29981d4, GREEN with the fix: ESM reads before a comma, a colon and as a shorthand property | [binding-pattern-boundaries.mjs](binding-pattern-boundaries.mjs) |
| hosting/T200 | RED on 29981d4, GREEN with the fix: the CommonJS forms | same file |
| hosting/T199 | control, passes before and after: an object key and an export rename are not reads | same file |

**Confirming Run (5 Nov, Node 24, Linux, 29981d4):** T196, T197, T198 and T200 fail; T199 passes. **Answering Run (same, with the fix):** all 54 Cases in the file pass and `npm run test:publisher` passes (194 pass, 1 skipped, T135).
