# C12 baseline

The baseline is `main`. Work that is not on `main` is not delivered functionality, and this Change depends on nothing that is not on `main`.

- `main` at `8a4c5b70880e4ed605bacdcf1a3ab5f2daff0769` holds `packages/kaal-controls/` with the control shape, the `type` field and the finder (C8, C9), declared as `@kaihacksai/kaal-controls` (C11).
- A control declares `id`, `title`, `description`, `type` and `has`. The finder refuses any other field, so it refuses `status`.
- Kai asked for this Change on 17 Nov 2026 and chose the four words, designed, implemented, running and tested (DIRT).
