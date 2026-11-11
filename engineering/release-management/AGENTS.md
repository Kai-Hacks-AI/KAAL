# Agents in release-management

- Read `README.md` first: layout, identity, traces, Case naming and language rules.
- Write every node id, Cases included, as `<capability>/<kind><n>` and name folders `<kind><n>-<slug>/`.
- A Case id never encodes where the Case sits. List the targets in `tests:` and place the Case where they derive it: nearest shared ancestor, then the common Intent, then the capability. One Case may name several targets.
- Write migration wording only under `00-changes/`. Write every other file as a standing target state.
