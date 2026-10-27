# Guard: Requirements, Engineering's part (what)

Guard's product Requirements are authoritative in the package: [`packages/kaal-guard/docs/requirements.md`](../../packages/kaal-guard/docs/requirements.md). This page holds only the obligations of KAAL Engineering's own use and delivery of Guard. Each names, in brackets, the Intent it serves, and the product obligations it relies on are cited, never restated.

## Functional (F)

**guard/F25 External delivery.** [guard/I6, guard/I7] An External delivery puts its own variant of the Skill at `.agents/skills/kaal-guard/` in the target, as part of the same Change. Where Engineering's delivery tooling uses Core at delivery time, Core adds the deployments the target's declared providers need. Either way the delivered files are plain and self-contained. That variant describes the delivered hook and runner, not the package, and names no KAAL element and no npm package. The target owns it afterwards, and a later update is a new External Change. A Skill already at a location is kept and reported. The delivery writes no instruction file.

## Nonfunctional (N)

- **guard/N5** [guard/I6] An External delivery is a handful of readable files that the target can maintain on its own, with no KAAL element in them.
  - **The External delivery's existing files.** An External delivery follows guard/F8's rule for the target's existing files: it never overwrites one.
  - **The External delivery's workflow.** The workflow an External delivery writes has the same obligations as Guard's own: `actions/checkout`, and `actions/setup-node` where the delivery sets up Node, at current major versions pinned by commit SHA, and every GitHub expression passed to its `run:` lines through `env:`, quoted, so no branch name, SHA or check name is ever read as shell.

- **guard/N7** [guard/I4] Adopting Guard in KAAL keeps every check identity, OS matrix entry and the coverage of KAAL's existing CI.

- **guard/N8** [guard/I4, guard/I5] KAAL's development dependency stays `file:packages/kaal-guard`, and KAAL's hook, workflows and check declarations stay KAAL's own. A published version is accepted as a consumer would use it only in a disposable clone of KAAL (guard/A12), never by switching KAAL's own dependency.

- **guard/N9** [guard/I5] Consumer acceptance evidence names its candidate's source: `packed`, the package at a commit before publication, which is simulated; or `registry`, the published version with its registry integrity. Only `registry` evidence counts toward a Release. Neither claims anything about KAAL's real GitHub enforcement.

- **guard/N14** [guard/I9] **One authority, no drift.**
  - **Definitions.** Each Guard identifier is defined exactly once. A product identifier is defined only in the package's `docs/`. `engineering/guard/` cites product identifiers and never restates them, and it defines only Engineering's own (guard/A20).
  - **Reuse.** Engineering runs the product's Test Cases where they live and copies none of them.
  - **Derived assets.** An asset Engineering derives from a product asset, such as External's variants of the hook, the workflow and the Skill, is produced from the product asset by a declared transformation and checked against it.
