# One SHA-256 for Graph: Intent

This is `graph/C16`, a PLAN Change. It ships no code. `graph/C17` is the DO Change that turns its planned test GREEN. It answers the CPO's handover on EEE dependency boundaries (3 Nov) and the Owner rule that an Embedded package takes only Foundation and Hosting as hard dependencies (`engineering/package-vs-engineering-dependencies.md`). It does not touch Graph's release candidate path (C5, C6) and stays out of the Hosting promotion.

`skills/kaal-graph/scripts/node.mjs` computes every Node id with its own `createHash("sha256")` from `node:crypto`. Foundation is KAAL's one SHA-256, and Foundation's own plan says adopting it changes no digest (foundation/I2). Graph's digest is Embedded runtime code with no recorded exception, so it is Graph's to correct.

- **graph/I12. Graph has no SHA-256 of its own.** Every Node id comes from Foundation's `sha256`, and no Node id changes.

## The conflict, and the Owner's answer

`node.mjs` is copied byte for byte by Core (core/C32), and graph/N7 and graph/T14 said it may import only `yaml`, `node:` built-ins and `form.mjs`. Importing Foundation broke that sentence. The Owner answered graph/Q3 (3 Nov): Graph can of course use Foundation's `sha256`, so N7 may be void.

I checked what N7 still protects. It has two parts:
- **Which external packages the copied files may import.** The EEE rule now covers this: Embedded code takes only Foundation and Hosting as hard dependencies. This part of N7 is retired as a Graph-specific list. Of the four copied files only Foundation's `sha256` (and the declared `yaml`) is allowed, and never Hosting, which only the CLI uses.
- **No other Graph file beside them.** The EEE rule does not cover this: it limits a package's dependencies, not how its files depend on each other. A copy of `node.mjs` that imported `edges.mjs` or `structure.mjs` would break in Core. This part stays.

So N7 is amended, not voided, and T14 is revised in place to test exactly that, with the Owner's confirmation recorded in its title. graph/T20 still turns RED to GREEN with the DO.
