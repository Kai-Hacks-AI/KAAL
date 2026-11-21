# Seeded Property and Adversarial Testing: Architecture

Each element names, in brackets, the Requirements it answers.

- **testing/A57** [testing/F163, testing/F164, testing/N37]: **Skill-first guidance inside `## Testing loops` plus bounded A + C pilot; BASS decides Script later.**
  - **BASS allocation upfront:**
    - **Skill (`SKILL.md`, `testing/C76`):** Choosing invariants/properties over tautologies, designing domain generators and adversarial edge inputs, deciding when RED/Mutation/Property applies, and classifying counterexamples across the four finding kinds belong at the **Skill** level as one paragraph (`**Seeded property and adversarial testing.**`) inside `## Testing loops`. Placing it inside `## Testing loops` preserves all 8 top-level headings and keeps `T156`, `T160`, and `T381`–`T383` intact.
    - **Script (`test/contracts.test.mjs`, `test/duplicates-inputs.test.mjs`, `testing/C77`):** Any shrunk counterexamples (or small fixed-seed assertions) discovered during the one-off pilot that correspond to documented contracts are promoted into ordinary deterministic regression tests executed by `npm test`.
    - **Deferred Script (`skills/kaal-testing/scripts/`):** No PRNG or `forAll` runner Script is added to the Skill in this collector. Whether repeated capability work now justifies extracting a deterministic seeded-runner script into `skills/kaal-testing/scripts/` is decided explicitly in `testing/C77`'s BASS judgment (for a separate future Change if earned).
  - **Case promotion in `testing/C76`:** Rename `T390.red.mjs` → `T390.test.mjs` inside `packages/kaal-testing/test/plan/seeded-properties/`, remove `run-red.mjs`, add `packages/kaal-testing/test/plan/seeded-properties.test.mjs` (matching `multi-loop-sensitivity.test.mjs`), and append it to `packages/kaal-testing/package.json` `scripts.test` (verifying `T390` + `T381`–`T383` + `T109` pass).

## Carried Change Set (`kaal/testing/seeded-properties -> main`)

All Changes run strictly sequentially on `kaal/testing/seeded-properties` (no parallel branches off stale bases):

| PR / Change | Role | Scope | Depends on |
| --- | --- | --- | --- |
| `testing/C75` (this PR) | **Plan** | `packages/kaal-testing/plan/seeded-properties/` and planned RED Case `T390.red.mjs` + `run-red.mjs` | `d046b2d1` (`main`) |
| `testing/C76` | **Do (Skill)** | Add `**Seeded property and adversarial testing.**` paragraph to `SKILL.md` (`## Testing loops`), promote `T390.red.mjs` → `T390.test.mjs` + `seeded-properties.test.mjs` into `package.json` `scripts.test` | `testing/C75` |
| `testing/C77` | **Do / Check (Pilot)** | Bounded A + C (`lib/duplicates.mjs` + `lib/contracts.mjs`) seeded property & adversarial run via temporary scratch script; promote justified counterexamples to `test/contracts.test.mjs` / `test/duplicates-inputs.test.mjs`; record seeds, findings, consumer check, and BASS judgment in `plan/seeded-properties/pilot.md` | `testing/C76` |
| **ACT** (`testing/RT2`) | **Act (Collector Retro)** | Combined collector verification + `packages/kaal-testing/02-learnings/retros/RT2.md` (`format: 4L`, `reflects: [testing/C75, testing/C76, testing/C77]`; verify `testing/RT2` unique across all `kaal/testing/*` branches before ACT) | `testing/C77` |
| **Promotion** (`kaal/testing/seeded-properties -> main`) | **Promote** | Raised automatically once collector Change set and ACT land | ACT landed |
