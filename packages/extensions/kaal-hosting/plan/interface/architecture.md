# Package Interface Contract: Architecture

Each element names, in brackets, the Requirements it answers.

- **hosting/A15** [hosting/F35]: Hosting's package interface is the table below, between the `kaal-hosting:interface` markers. It is the one authoritative declaration, and hosting/T41 reads it from this file. An entry is added only by an approved Architecture: hosting/A1–hosting/A11 for the delivered and `hosting/C12` entries, and hosting/A13 (#650) for the `hosting/C14` entries. `Target` is the default condition of an export or the path of a command; an export may also name `types`, which must then ship as well.

<!-- kaal-hosting:interface -->
| Kind | Entry | Target | Status |
| --- | --- | --- | --- |
| export | `.` | `./dist/index.js` | delivered |
| export | `./conformance` | `./dist/conformance.js` | delivered |
| export | `./package.json` | `./package.json` | delivered |
| export | `./boundary` | `./dist/boundary.js` | planned hosting/C14 |
| bin | `kaal-hosting-boundary` | `bin/kaal-hosting-boundary.mjs` | planned hosting/C14 |
| files | `dist` |  | delivered |
| files | `!dist/.tsbuildinfo` |  | delivered |
| files | `payload` |  | delivered |
| files | `docs` |  | planned hosting/C12 |
| files | `test/acceptance` |  | planned hosting/C12 |
| files | `test/unit` |  | planned hosting/C12 |
| files | `test/verify.mjs` |  | planned hosting/C12 |
| files | `test/verify.json` |  | planned hosting/C12 |
| files | `bin` |  | planned hosting/C14 |
| files | `skills` |  | planned hosting/C14 |
<!-- /kaal-hosting:interface -->

## Change graph

| Change | Owner | Depends on |
| --- | --- | --- |
| `hosting/C15` PLAN correction: I9, F35, A15; hosting/T41; hosting/T21 and hosting/T24 narrowed | Hosting | the Owner's ruling on #657 (comment 6533937580) |
| `hosting/C11` DO (#657), unchanged | Hosting | `hosting/C10` |
| hosting/T41 joins Hosting's `npm test`, beside hosting/T21–T24 | Hosting | `hosting/C11` and `hosting/C15` |
| `hosting/C12` and `hosting/C14` DOs: each marks its own entries `delivered` and edits no Test Case | Hosting | `hosting/C15` |
