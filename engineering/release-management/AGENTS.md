# Agents in release-management

- Read `README.md` first: layout, identity, traces, Case naming and language rules.
- Write element ids as `<capability>/<kind><n>` and name folders `<kind><n>-<slug>/`.
- Place each Case where its identity says: beside the nearest shared ancestor of the targets named in its `tests:` list, then the common Intent, then the capability. One Case may name several targets.
- Write migration wording only under `00-changes/`. Write every other file as a standing target state.
