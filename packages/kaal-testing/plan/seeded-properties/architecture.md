# Seeded Property and Adversarial Testing: Architecture

Each element names, in brackets, the Requirements it answers.

- **testing/A57** [testing/F165, testing/F166, testing/N37]: **Skill-first guidance inside `## Testing loops` plus bounded A + C pilot; separated Defect/parked RED vs. passing suite checks.**
  - **BASS allocation upfront:**
    - **Skill (`SKILL.md`, `testing/C76`):** Choosing invariants over vacuous setups, pre-classifying `authoritative invariant` vs. `exploratory hypothesis`, choosing RED vs. Mutation vs. Property triggers, designing generators, and triaging counterexamples through the four finding kinds belong at the **Skill** level (`**Seeded property and adversarial testing.**` inside `## Testing loops`). Keeping all 8 top-level headings leaves `T156`, `T160`, and `T381`–`T383` intact.
    - **Script (`test/contracts.test.mjs`, `test/duplicates-inputs.test.mjs`, `testing/C77`):** Only **passing** fixed-seed checks and **passing** regression assertions go into existing suites run by `npm test`. Any contract-breaching product counterexamples (including the CTO's already-known `classify()` inherited-key `TypeError`) produce a **Defect** record and a **parked RED Case** outside `scripts.test` — never silently patched in `lib/` inside `testing/C77`, and never breaking `npm test`.
    - **Deferred Script (`skills/kaal-testing/scripts/`):** No PRNG or runner Script is added to the Skill in this collector. `testing/C77`'s BASS judgment decides whether a deterministic seeded Script in `skills/kaal-testing/scripts/` is earned for a separate future Change.
  - **Hold-visible planned Case (`testing/T392`):** Placed directly as plain `packages/kaal-testing/test/plan/seeded-properties/T392.test.mjs` with single-quoted `id = 'testing/T392'` and `tests = ['testing/F165', 'testing/N37']` so Hold recognizes it immediately; **never renamed** in `testing/C76`. In `testing/C76`, remove `run-red.mjs`, add aggregate `packages/kaal-testing/test/plan/seeded-properties.test.mjs`, and append `test/plan/seeded-properties.test.mjs` to `packages/kaal-testing/package.json` `scripts.test`.

## Carried Change Set (`kaal/testing/seeded-properties -> main`)

All Changes run strictly sequentially on `kaal/testing/seeded-properties` (no parallel branches off stale bases):

| PR / Change | Role | Scope | Depends on |
| --- | --- | --- | --- |
| `testing/C75` (this PR) | **Plan** | `packages/kaal-testing/plan/seeded-properties/` and planned Case `T392.test.mjs` + `run-red.mjs` | `d046b2d1` (`main`) |
| `testing/C76` | **Do (Skill)** | Add `**Seeded property and adversarial testing.**` paragraph to `SKILL.md` (`## Testing loops`), remove `run-red.mjs`, add `seeded-properties.test.mjs` wrapping `T392.test.mjs` into `package.json` `scripts.test` | `testing/C75` |
| `testing/C77` | **Do / Check (Pilot)** | Pre-classified A + C (`lib/duplicates.mjs` + `lib/contracts.mjs`) seeded property & adversarial run via scratch runner; route contract breaches (including CTO's known `classify()` inherited-key failure) to Defect + parked RED Case; add only passing fixed-seed/regression checks to `scripts.test`; record findings, consumer check, Skill-guidance assessment, and BASS judgment in `plan/seeded-properties/pilot.md` | `testing/C76` |
| **ACT** (`testing/RT<n>`) | **Act (Collector Retro)** | Combined collector verification + `packages/kaal-testing/02-learnings/retros/RT<n>.md` (`format: 4L`, `reflects: [testing/C75, testing/C76, testing/C77]`; settle `RT2` vs. `C74`'s collector and verify unique across `kaal/testing/*` before ACT) | `testing/C77` |
| **Promotion** (`kaal/testing/seeded-properties -> main`) | **Promote** | Raised automatically once collector Change set and ACT land | ACT landed |
