Nothing is retired. The location of the completed Cases changes; no control is removed and no Case is dropped.

Amended in the DO: the two hand runners `plan/coordination/red.mjs` and `plan/coordination-review/red.mjs` are retired. They ran the `T<n>.(red|test).mjs` files of their own folder, which have moved to `test/coordination/`; `test/show-wip.test.mjs` now runs every one of them in CI and reports each under its id, so no Case is left without a runner.
