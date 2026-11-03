# One SHA-256 for Graph: Intent

This is `graph/C16`, a PLAN Change. It ships no code. `graph/C17` is the DO Change that turns its planned test GREEN. It answers the CPO's handover on EEE dependency boundaries (3 Nov) and the Owner rule that an Embedded package takes only Foundation and Hosting as hard dependencies (`engineering/package-vs-engineering-dependencies.md`). It does not touch Graph's release candidate path (C5, C6) and stays out of the Hosting promotion.

`skills/kaal-graph/scripts/node.mjs` computes every Node id with its own `createHash("sha256")` from `node:crypto`. Foundation is KAAL's one SHA-256, and Foundation's own plan says adopting it changes no digest (foundation/I2). Graph's digest is Embedded runtime code with no recorded exception, so it is Graph's to correct.

- **graph/I12. Graph has no SHA-256 of its own.** Every Node id comes from Foundation's `sha256`, and no Node id changes.

## A conflict this PLAN returns rather than decides

`node.mjs` is copied byte for byte by Core (core/C32), and graph/N7, graph/T14 and graph/A-copy say it may import only `yaml`, `node:` built-ins and `form.mjs`. Importing Foundation breaks that sentence, though not the purpose behind it: Core already depends on Foundation, so a copy of `node.mjs` works there. The PLAN therefore proposes amending graph/N7 to name one more allowed import, and asks the Owner to confirm (graph/Q3). It does not weaken T14 silently: graph/T20 below replaces it only if the Owner confirms.
