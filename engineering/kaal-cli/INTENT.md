# Intent

A KAAL needs a CLI, so that an installed KAAL (a host such as Enercon that holds only `.kaal/` and a wired `AGENTS.md`) can list the capabilities it could take and install them, without a clone of this repository.

Why: today `list-kaal-capabilities` and `install-kaal` are root scripts of the source repo (`engineering/kaal-install`). A host with Core only has no way to discover or add a capability, and nothing in it says where to go. The knowledge of what is installable should come from Nodes, and the delivery target is npm packages.

## Do

- Provide a `kaal` command, delivered as an npm package, that lists what can be installed and installs it into a KAAL directory.
- Read what is installable from Nodes (Skills and Extensions are Nodes typed by Core's own Node), not from a list, lock file or registry.
- Install through Core's existing `registerSkill()` / `registerExtension()`, so Core's admission still decides.
- Take capabilities from npm packages that carry the same `payload()` shape the packages deliver today.

## Do not

- Do not grow `kaal-core`, or give Core knowledge of npm, packages or paths.
- Do not select a capability by name; a name is refused, the exact Node ID selects.
- Do not add a registry, lock file or remembered selection.
- Do not change a sealed Node, a seal or a closed Change.
- Do not modify Enercon.

## Done when

An agent in a host that holds only Core can run `kaal` to list what npm packages offer, install one capability by its Node ID, and have `installedSkills()` report it, with no clone of the source repository and with Core unchanged.

## Open design questions (answers go on the PR)

1. **Where it lives.** Its own npm package (`kaal`, or `kaal-cli`)? That keeps `kaal-core` untouched and each deployable unit independent. It then depends on `kaal-core` for `registerSkill()` / `installedSkills()`.
2. **Relation to `install-kaal`.** Same logic, shipped: the CLI would take over what `engineering/kaal-install` does (admission by exact ID, unmet `compatibility` dependencies refused, sealed bytes append-only), and `install-kaal` either becomes a thin caller of it or stays as the source repo's own projection of itself. Which?
3. **"Installable from Nodes alone."** A Node refers by `{name, id}` and never by storage location, so a Node cannot name its npm package. Something must still answer "which package carries the Node with this ID". Options: the CLI is given package names by the caller and reads the Nodes inside them (no state kept); a convention where a capability package declares itself in its own `package.json` keywords; or an npm scope the CLI queries. Which one, given no registry?
4. **Discovery versus install.** Is `kaal list` allowed to hit the npm registry, or only to read packages already resolved on disk (for example via `npx`)?
5. **Agent wiring.** Does the CLI also run `wire-kaal-agent` and the `check-kaal-*` commands, or are those separate commands in the same package?
6. **Process.** Is this one Change, or a Request first for the missing way to say where capabilities come from (the briefing in the thread)?

Nothing here is built. This is a draft Intent for Kai to answer, not a Change.
