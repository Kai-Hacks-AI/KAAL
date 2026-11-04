# hosting/D7: shipped guidance names Hosting's exports by the legacy unscoped package name

Owner: Hosting. Raised on 4 November 2026 from the CPO/Owner's finding 5 (legacy Hosting identity): the Hosting-owned piece, found by Hosting's own scan, is that `skills/kaal-hosting-boundary/HOSTS.md` tells a reader to import `kaal-hosting/conformance`, `kaal-hosting/fixtures` and `kaal-hosting/boundary`. The package is `@kaihacksai/kaal-hosting` (hosting/F15), so a consumer following the guidance gets a specifier that does not resolve. This record changes no source, test, script, guidance or package.

## Record

```json
{
  "id": "hosting/D7",
  "context": "hosting (shipped guidance)",
  "expected": "Guidance a consumer would follow names each Hosting export by its scoped specifier, @kaihacksai/kaal-hosting/<subpath>.",
  "observed": "HOSTS.md lines 3, 7 and 29 name kaal-hosting/conformance, kaal-hosting/fixtures and kaal-hosting/boundary.",
  "where": "packages/kaal-hosting/skills/kaal-hosting-boundary/HOSTS.md",
  "status": "confirmed",
  "tests": ["hosting/T108"]
}
```

## Case

| Identity | Role | File |
| --- | --- | --- |
| hosting/T108 | RED: no shipped Markdown names an export subpath without the scope | [unscoped-specifiers.red.mjs](unscoped-specifiers.red.mjs) |
| hosting/T109 | control, passes today: the package declares exactly the subpaths the Case checks | same file |

Host-fact and request identifiers such as `kaal-hosting/special-entries` and `kaal-hosting/<rule>@…` are not export subpaths and are not matched.

**Case version:** the Git blob id of `unscoped-specifiers.red.mjs`, `8cd5c5c007184123a20518eccf59ec76e1e98292`. Run by hand from the repository root: `node --test packages/kaal-hosting/defects/unscoped-specifiers.red.mjs`. **Confirming Run (4 Nov, Node 22 sandbox, 35df842):** hosting/T109 passes; hosting/T108 fails naming `HOSTS.md:3`, `:7` and `:29`.

**Answered** only by a later Run in which hosting/T108 passes, at this Case version, in the Change that corrects HOSTS.md, with hosting/T109 still passing.

## Bounds and correction

Nothing is fixed here. The correction is the three specifiers in HOSTS.md, in the one separate Hosting Change with hosting/D5, hosting/D6 and the digest interface; it changes a committed path, so the ledger is refreshed once. Engineering owns the overarching migration Defect and the remaining capabilities' inner-loop corrections; this record is only Hosting's own piece.
