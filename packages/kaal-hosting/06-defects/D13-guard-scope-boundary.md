# hosting/D13: the portability audit ends a returning guard's scope at the nearest block, not at the function it leaves

Owner: Hosting. Raised on 8 November 2026 from Codex's P2 finding on #1174 at c208f02 (`boundary-core.ts`, `affected`), reproduced by Hosting. It is a Defect in the portability audit, of the same family as hosting/D5, hosting/D10, hosting/D11 and hosting/D12. It is not caused by hosting/D12's exit test (that decides whether a guard leaves its scope); this Defect is where the scope ends.

## Record

```json
{
  "id": "hosting/D13",
  "context": "hosting (portability, challenged cases)",
  "expected": "A platform guard that returns from the function a case is registered in challenges every case registered after it in that function, however deeply the guard sits in blocks inside it, because none of them is registered on the guarded host (hosting/F29, hosting/F40).",
  "observed": "`describe(\"suite\", () => { try { if (process.platform === \"win32\") return; } catch {} it(\"after\", () => {}); })` leaves portability().challenged empty: the guard's range ends at the closing brace of the try block, not at the end of the suite callback, which the return actually leaves.",
  "where": "packages/kaal-hosting/05-src/skills/kaal-hosting/scripts/boundary-core.ts, affected (the enclosing block of a leaving guard)",
  "status": "answered",
  "tests": ["hosting/T243", "hosting/T244"]
}
```

## Cases

| Identity | Role | File |
| --- | --- | --- |
| hosting/T243, hosting/T244 | RED on 4d80a07: the guard in a try block, in a bare block | [guard-scope.red.mjs](guard-scope.red.mjs) |
| hosting/T245 | control, passes before and after: a guard in a block inside a case callback leaves only that case | same file |
| hosting/T249 to hosting/T254 | controls, added with the fix after Codex review: a caught throw skips the registrations to the end of its try block and no further; a function body with a return-type annotation is the boundary a return leaves; the finally block of the try a guard sits in still runs; a process exit runs no finally block; an exit guard in a never-called function challenges no module-level case; the other branch of an enclosing if is not challenged | [guard-scope.controls.mjs](guard-scope.controls.mjs) |

**Confirming Run (8 Nov, Node 24, Linux, 4d80a07, the collector head carrying the D12 fix):** T243 and T244 fail; T245 passes. The fix is a separate Change; the Cases are not edited. **Answered:** the Cases pass unmodified with the fix: the range of a leaving guard ends at the function it leaves, found on the parsed tree (a throw caught by an enclosing try ends at that try block), and `exitKinds`/`leavesScope` now also classify throwing and exiting guards (`couplings.ts`).
