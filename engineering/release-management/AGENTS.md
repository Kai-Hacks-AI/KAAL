# Agents in release-management

- Read `README.md` first: layout, identity, traces, Case naming and language rules.
- Write ids as `<capability>/<kind><n>` and name folders `<kind><n>-<slug>/`.
- Put each Case beside the artefact it tests, with a `tests:` list naming only that artefact.
- Write migration wording only under `00-changes/`. Write every other file as a standing target state.
