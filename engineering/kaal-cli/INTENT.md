# Intent

A KAAL needs a CLI, so that an installed KAAL (a host such as Enercon that holds only `.kaal/` and a wired `AGENTS.md`) can list the capabilities it could take and install them, without a clone of this repository.

Why: today `list-kaal-capabilities` and `install-kaal` are root scripts of the source repo (`engineering/kaal-install`). A host with Core only has no way to discover or add a capability, and nothing in it says where to go. The knowledge of what is installable should come from Nodes, and the delivery target is npm packages.

## Do

- Provide a `kaal` command, delivered as an npm package, that lists what can be installed and installs it into a KAAL directory.
- Read what is installable from Nodes, not from a list, lock file or registry.
- Install through Core's `registerSkill()` / `registerExtension()`, so Core's admission still decides.
- Take capabilities from npm packages that carry the `payload()` shape the packages deliver today.
- Keep two options live, and decide between them with Kai (see below): the CLI may be part of `kaal-core`, and Core may gain Nodes that carry information about the install surface.

## Do not

- Do not select a capability by name; a name is refused, the exact Node ID selects.
- Do not add a registry, lock file or remembered selection.
- Do not change a sealed Node, a seal or a closed Change.
- Do not modify Enercon.
- Do not mix a Core part with anything else in one PR.

## Done when

An agent in a host that holds only Core can run `kaal` to list what is installable, install one capability by its Node ID, and have `installedSkills()` report it, with no clone of the source repository.

## The two live options and what each does

**A. The CLI inside `kaal-core`.** A host that has Core then has the CLI, with no second install. This closes the chicken-and-egg problem in the briefing, since the host never needs anything else first.
- Isolation: a `kaal-core` change travels alone, so this is its own Change and its own PR, with no `.github`, engineering or other part in it. Core is protected, so it needs your go and the bridge dance if a consumer breaks.
- Sealed-Node rules: none broken, since a CLI is a script and not a Node. But it grows Core's public API and shipped bytes, which cuts against "avoid expanding Core". Core would then need an `engineering/kaal-core` acceptance for it.
- Package question: untouched. Core still cannot say which package carries a Node ID.

**B. Core Nodes that carry install-surface information.** A KAAL Definition states meaning, not implementation, so a Core Node can say what it means for a capability to be installable and how a package declares what it delivers.
- Isolation: also a kaal-core Change, alone, with its own seal, so it needs a PR of its own and cannot ride with A.
- Sealed-Node rules: a Node refers only to Nodes born before it and never changes, so a Core Node cannot list capabilities that come later. The listing has to come from the capabilities' own Nodes, and the Core Node can only define what they declare. A Node also refers by `{name, id}` and never by location, so a Core Node cannot hold an npm package name for a capability; it can only define the shape of such a declaration.
- Package question: this is the only option that can answer it from Nodes, but only in a split form: Core defines the install surface, each capability's Node (typed by `Skill`) declares its surface under that definition, and the CLI reads those. Whether a declaration naming a package counts as "a storage location" is the open point.

**Neither option excludes the other.** The CLI could live in its own npm package (the previous draft), in Core (A), and read the install surface from Core Nodes (B) or from the packages given by the caller.

## Open design questions (answers go on the PR)

1. **Is the CLI in `kaal-core` (A) or its own package?** My lean: A only if you accept the Core growth, since it is the one way to have it already in the host; otherwise its own package, run once by `npx`.
2. **Do you want the install-surface Nodes (B)?** My lean: yes as a small `Install` KAAL Definition born before any capability declares, since it is the only route to "installable from Nodes". It is a Core Change of its own, ahead of or beside A.
3. **May a capability's Node name its npm package in its text?** If yes, "which package carries this Node ID" is answered by Nodes. If no (location never lives in a Node), the caller must name packages.
4. **Order.** If both: B first (a Node and its seal), then the CLI against it, then retiring or thinning `install-kaal`. Each Core part is its own PR.
5. **Relation to `install-kaal`.** The CLI carries the same logic (exact-ID admission, unmet `compatibility` refused, sealed bytes append-only); `install-kaal` becomes a thin caller or stays as the source repo's self-projection.
6. **May `list` query the npm registry**, or only packages already on disk?
7. **Does the CLI also wire the agent and run the `check-kaal-*` commands?**
8. **Process.** One Change per Core part, or a Request first?

Nothing here is built. This is a draft Intent for Kai to answer, not a Change.
