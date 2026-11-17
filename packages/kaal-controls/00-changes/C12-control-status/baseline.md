# C12 baseline

The baseline is `main`. Work that is not on `main` is not delivered functionality, and this Change depends on nothing that is not on `main`.

- `main` at `42e5b2aadf835c4b426292cd69c30708fa1e30bb` holds `packages/kaal-controls/` with the control shape, the `type` field and the finder (C8, C9), declared as `@kaihacksai/kaal-controls` (C11).
- A control declares `id`, `title`, `description`, `type` and `has`. The finder refuses any other field, so it refuses `status`.
- Kai asked for this Change on 17 Nov 2026 and chose the four words, designed, implemented, running and tested (DIRT).
- `engineering/controls` on `main` holds one old README and no numbered folder. `release/CTL1` and `release/CTL2` are on `main` without a `status`.
- The CPO's review of the PLAN on 17 Nov 2026 asked for the Product and Engineering split, a state-based migration and no GitHub wiring.
