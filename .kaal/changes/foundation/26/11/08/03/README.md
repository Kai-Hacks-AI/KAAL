# Foundation 0.0.2: the final package layout, Cases beside Nodes

Capability owner: Foundation. Logical Change foundation/C20 (provisional number; rejudge against the collector when
this ordinary Change is integrated). It replaces the flat 0.0.2 candidate #838, which is closed as superseded.

DO. Foundation moves to Packaging's final layout (the one Hosting uses): `00-changes/` (from `plan/`), `01-intent`,
`02-requirements/{functional,non-functional}`, `03-architecture`, `04-test/{package-check,engineering-check}`, `05-src`
(the skill, its references and scripts), `06-defects`, `kaal/Foundation.md` (the Capability declaration, same bytes,
content id 649fbafb…c27c5). `dist/` is the only shipped thing (`files: ["dist"]`), built by
`04-test/engineering-check/build.mjs` as byte-for-byte copies. `./sha256`, `./capability` and the `kaal-foundation`
bin now resolve into `dist/`. The 0.0.2 declaration, ownership claim and `.gitattributes` of #838 are carried.

Test Cases (T-numbers unchanged) sit beside their Nodes. A small temporary Foundation-owned collector,
`04-test/package-check/collect.mjs`, finds `*.test.mjs` under the loop folders, sorted by path, until Testing's
mechanism (testing PLAN #1216) replaces it: delete that one file. `npm test` is `dist/test/package-check/verify.mjs`
(`pretest` builds `dist/` in source). Retired: `test/run.mjs` and `test:all`/`test:embedded` (foundation/T14 is removed
with them, T13 and T20 restated); foundation/N15 is amended: `prepack` builds `dist/` reproducibly, nothing else runs.

Held on purpose: the T51 acceptance scenario stays at `test/acceptance/` until Testing's discovery reads the new
layout (otherwise the Acceptance lane would silently drop it). C14 `check`/`boundary` and C18 follow as their own
Changes. Root `AGENTS.md` now names the new bin and skill paths.

Depends on Engineering first landing, on main, the read of the new `sha256.mjs` path in the Change Isolation judge
(`engineering/github/change-isolation.sh` and siblings). No promotion, publication or npm action is authorized by this
record. The 0.0.2 number matches #838 and is a collector value only.
