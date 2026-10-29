# Ownership Claims as Markdown: Requirements

Each Requirement names, in brackets, the Intents it serves.

## Functional

- **testing/F35** [testing/I13]: A claim is a file named `ownership.kaal.md` in its owner's own tree, found by that name, and its scope is the directory holding it, as before. Its frontmatter has the Type `Testing/Ownership` and exactly these keys:
  - `kind`: an `enum`, one of Core's four CASE kinds, `capability`, `agent`, `skill` or `extension`, required;
  - `owner`: a `ref`, the exact `{ name, id }` of the owner's own Node, required;
  - `paths`: a list of `path`, required.

  Its body is the owner's own account of the claim, for people and Agents. The body never changes what the claim reads to or attributes. A claim that reads gives the same `{ claim: { path, owner: { kind, name, id }, paths } }` a JSON claim gives.
- **testing/F36** [testing/I13]: A path in a Markdown claim covers the file it names, or everything beneath the directory it names. It never covers a sibling that only shares its prefix: `alpha` covers `alpha/a.js`, not `alphabet/c.js`. Each path lies within the claim's scope, and may name the scope's directory itself. `F1`'s `path` has no empty segment, so a directory is written without a trailing `/`.
- **testing/F37** [testing/I13]: A Markdown claim that does not conform to `Testing/Ownership` is a verified failure naming the file. This includes no frontmatter, bytes that are not UTF-8, an undeclared or prose key, a missing key, a value outside its kind, and a path outside the scope. A file whose frontmatter names no Type, or another Type, is `unknown`, as `core/F6` makes it. Neither reads as a claim, and neither attributes anything.
- **testing/F38** [testing/I13]: The migration is a transition. Until the last claim on `main` has moved, a JSON claim is still found by its name, `ownership.kaal.json`, and reads exactly as before, with its own pattern rules. A directory holding both an `ownership.kaal.md` and an `ownership.kaal.json` is a verified failure for each, and neither attributes. A later Testing Change ends the transition and stops reading JSON claims.
- **testing/F39** [testing/I13]: Testing's reading is never looser than Core's (`core/F8`). Every Markdown claim it reads is `valid` under `kaal-core/frontmatter` with Testing's `Testing/Ownership` schema. Every one that Core finds `invalid` or `unknown`, Testing refuses.
