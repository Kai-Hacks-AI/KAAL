# hosting/D17: the special-entry fixture resolves a relative directory against the temporary directory

Owner: Hosting. Raised on 8 November 2026 from Codex's P2 finding on #1179/#1180 (`attempt` in `fixtures.ts`), reproduced by Hosting on Hosting 0.0.1 (2e45a5e). `mkfifo` runs with its working directory in `tmpdir()`, while the check that follows resolves the same path against the process's own working directory.

## Record

```json
{
  "id": "hosting/D17",
  "context": "hosting (fixtures, special entries)",
  "expected": "`specialEntries(dir)` places a FIFO at `dir/fifo` and a socket at `dir/socket` for a relative `dir` as it does for an absolute one, the paths resolved against the process's working directory (hosting/F38).",
  "observed": "specialEntries called with the relative directory here, in a working directory that holds it, throws a SetupFailure: mkfifo cannot create fifo here/fifo, no such file or directory.",
  "where": "packages/kaal-hosting/05-src/skills/kaal-hosting/scripts/fixtures.ts, `attempt` (the `mkfifo` call)",
  "status": "open",
  "tests": ["hosting/T262", "hosting/T263"]
}
```

## Cases

| Identity | Role (a role of an ordinary Test Case, not a kind of Case) | File |
| --- | --- | --- |
| hosting/T262 | RED role on 2e45a5e: a relative directory gets no FIFO | [special-entries-relative.red.mjs](special-entries-relative.red.mjs) |
| hosting/T263 | passes before and after the fix, behavior that already works and must keep working: an absolute directory gets its FIFO and socket | same file |

**Confirming Run (8 Nov, Node 24, Linux, 2e45a5e):** the Case in its RED role fails and the other passes. The fix is a separate Change; the Cases are not edited.
