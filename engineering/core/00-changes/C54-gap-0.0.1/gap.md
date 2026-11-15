# C54 gap

Baseline read on 2026-11-15 from the GitHub contents API only: `main` @ 888ce0f and `kaal/core` @ 57ae58c (last commit 2026-11-05). File lists and `package.json` were compared; no tests were run and file contents were not diffed, so every row is a candidate until the first DO step confirms it.

| Item | `main` (kaal-core 0.0.1) | `kaal/core` | Candidate decision |
| --- | --- | --- | --- |
| Hosting dependency name | `@kaihacksai/kaal-hosting` 0.0.1 | `kaal-hosting` 0.0.1 (pre-hotfix name) | main is right; do not bring the old name back. Open #968 (C51 DO, "behind") exists to mirror this; likely close |
| `src/initialization.ts`, `src/contribution.ts` | absent | present | land by small Change (C49 to C52 line) |
| `capability/` (Core.md, Registration.md) shipped in `files` | absent | present (C52) | land by small Change |
| `skills/` shipped in `files` | absent | present (C49 navigation, C50 composition) | land by small Change |
| Scripts `test:skill`, `test:navigation`, `test:composition` | absent | present | land with the matching Cases |
| Initialization tests (`initialization-preflight`, `initialization-bindings`, plan T98, T99, T112 to T120) | absent | present | land with the code they test |
| `defects/` D1 to D3 and RED Cases T121, T122, T124 | absent | present | check whether main's tests already carry the D1 to D3 fixes (#1025, #1033 were applied on `kaal/core`) |
| `packages/kaal-core/.gitattributes` | present | present | confirm equal (C52 byte-exactness rule) |
| Foundation pin | 0.0.1 | 0.0.1 | core/C53 PLAN #1236 targets 0.0.2; decide with Foundation's thread |
| `test/verify.json` | main's tree | kaal/core's tree | regenerate from a clean build after each Change; never merge by hand |

## Order proposed

1. Confirm the table by a checkout and a full run of every suite (count all `fail` lines).
2. D1 to D3 fixes if main lacks them (smallest, pure test lines).
3. Initialization with Core installed, then registered (C52), including `capability/` and `.gitattributes`.
4. Skill navigation and optional composition (C49, C50).
5. Foundation 0.0.2 pin, when Foundation publishes.

Publication is a separate step after any number of these.
