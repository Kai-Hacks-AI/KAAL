# hosting/D16: a case registered through a platform-dependent local name is not challenged

Owner: Hosting. Raised on 8 November 2026 from Codex's P2 finding on #1179/#1180 (`registers(callee)` in `boundary-core.ts`), reproduced by Hosting on Hosting 0.0.1 (2e45a5e). The registration function is recognised by its own name (`it`, `test`, `describe` and their `.skip`/`.only` forms), so a function bound to a local name that depends on the platform is never recognised as a registration.

## Record

```json
{
  "id": "hosting/D16",
  "context": "hosting (portability, challenged cases)",
  "expected": "`const run = process.platform === 'win32' ? it.skip : it; run('x', …)` registers `x` as a skipped case on one host and a live one on the other, so `x` is challenged like a case registered with a platform-dependent selector (hosting/F29, hosting/F40).",
  "observed": "`portability().challenged` is `[]` for the capability above.",
  "where": "packages/kaal-hosting/05-src/skills/kaal-hosting/scripts/boundary-core.ts, `registers(callee)` and the call collection in `affected`",
  "status": "answered",
  "tests": ["hosting/T260", "hosting/T261"]
}
```

## Cases

| Identity | Role (a role of an ordinary Test Case, not a kind of Case) | File |
| --- | --- | --- |
| hosting/T260 | RED role on 2e45a5e: the case registered through the local name is not challenged | [local-registration.red.mjs](local-registration.red.mjs) |
| hosting/T261 | passes before and after the fix, behavior that already works and must keep working: a local name that does not depend on the platform challenges nothing | same file |

**Confirming Run (8 Nov, Node 24, Linux, 2e45a5e):** the Case in its RED role fails and the other passes. The fix is a separate Change; the Cases are not edited. **Answered:** the Cases pass unmodified with the fix, which follows a registration function bound to a local name in affected(): calls of the name register like the function it was bound to, and a platform finding inside the binding governs them (boundary-core.ts).
