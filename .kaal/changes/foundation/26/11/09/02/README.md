# Foundation 0.0.2: the Boundary Check (DO)

Capability owner: Foundation. Logical Change foundation/C14 (DO) of the PLAN merged in #1292 (CPO-approved at 135f168).
It authorizes no promotion, version bump on main, SYNC, ledger entry, release dispatch or npm publication.

Delivered:
- `04-test/boundary-check/scan.mjs --target <path>...` and `boundary-check.md` (Applicable), shipped under
  `dist/test/boundary-check/`. Three rules (`copy`, `implementation`, `crypto`); Hosting-shaped output; exit 0 or 2;
  owner from the nearest `ownership.kaal.json`; Foundation-owned directories skipped and reported; read only; no
  target and no role named.
- The PLAN's Requirements, Intent and Architecture carried into the Nodes (`01-intent`, `02-requirements`, `03-architecture`).
- Documents: `references/operations.md`, the skill, `05-src/AGENTS.md` and the root `AGENTS.md` Foundation section.
- Planned Cases T54-T62 moved unchanged in behaviour to `04-test/engineering-check/publisher/boundary.test.mjs` and
  now GREEN (9 of 9); added to `test:publisher`. Delivered Case T63 in `02-requirements/functional/requirements.test.mjs`.
- The manifest `verify.json` regenerated.

Two disclosed departures from the approved PLAN, both mechanical:
1. **Identifiers renumbered.** The PLAN's provisional numbers collided with ids already used in the Nodes and in other
   Changes (F25, N15, A15, T46, T52, T53). Mapping: I9 to I14; F22-F25 to F34-F37; N13-N15 to N20-N22; A13-A15 to
   A19-A21; T37-T45 to T54-T62; T46 (delivered) to T63. Nothing else in the Cases changed; the PLAN documents in
   `00-changes/boundary/` carry the new ids.
2. **Delivered Case location.** The PLAN said `04-test/boundary-check/scan.test.mjs`. The temporary collector reads
   only the loop folders beside the Nodes, so the delivered Case sits beside the Requirements Node
   (`02-requirements/functional/requirements.test.mjs`), as the layout's rule for Cases requires.

Evidence: all nine publisher Cases GREEN; `npm test` verified (T63 pass); `npm run test:publisher` 46 of 46.
First run of the scan over `packages` and `engineering` (audit, not decided here): complete, 341 source files read,
62 findings, all `crypto`; no `copy` and no `implementation`. See the project file `foundation/boundary-scan-repo-2026-11-09.md`.

Open and not part of this Change: where findings and decisions live in the repository; the layering wording
(Hosting is the bottom) that is a Change of its own.
