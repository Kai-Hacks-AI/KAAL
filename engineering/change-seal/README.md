# change-seal

Provisional engineering machinery that seals the Work of a KAAL Change and closes the Change. It is not shipped, and it is not a Skill; it decides which directory is a Change and which is a named tree. How any directory tree is given an identity, and what a seal marker is, are the Sealing capability's (`packages/sealing`), which these helpers consume and never reimplement.

A Change is the directory `changes/<name>/YY/MM/DD/CC/` of a KAAL directory. Its ID is the SHA-256 of a canonical stream over the whole tree (`packages/sealing/skills/sealing/scripts/tree-id.mjs` states the format; `helpers/change-id.ts` only says which tree is a Change): relative paths are identity-bearing, only regular files participate, and anything ambiguous (symlinks, empty directories, non-NFC or case-colliding paths, backslashes, control characters) is refused. A Node's identity is unchanged: its bytes alone.

A Change is **closed** when the ID of its current tree has a seal, the empty marker `seals/changes/<Change-ID>` in the KAAL directory, outside the tree it seals. There is no status metadata. Bare `seals/<ID>` markers remain Node seals.

## The process

A Change is taken through exactly: work, seal work, retro, seal Change.

```
changes/<name>/YY/MM/DD/CC/
├── work/      open while it evolves; sealed once complete
└── retro.md   written only after work/ is sealed
```

`work/` is scaffolding for learning this boundary, not a permanent KAAL concept; it is the first consumer of a **named tree**. A named tree's ID (`KAAL Tree v1`, Sealing's `tree-id.mjs --named`) is the SHA-256 of a canonical stream over its own root name, its relative paths and exact bytes. Its parent and location are excluded: `A/work/` moved to `B/work/` keeps its identity, `work/` renamed to `evidence/` does not, and any edit, addition, deletion or inner move changes it. Its seal is the empty marker `seals/trees/<ID>`, outside what it seals. The Change identity (`KAAL Change v1`) is deliberately unchanged: it excludes the Change's own name, exactly as genesis `01` was sealed. `retro.md` sits outside `work/`, so adding it never disturbs the Work seal, and the final Change seal covers both. There is no Retro seal and no status metadata: where a Change is, is derived from `work/`, `retro.md` and the seals (`helpers/process.ts`, the one evaluator):

- `WORK OPEN`, next: complete and seal work (a `retro.md` here is reported as an invalid step)
- `WORK SEALED`, next: write `retro.md`
- `RETRO PRESENT`, next: seal Change
- `CHANGE CLOSED`

A Change that predates Work, such as genesis `01`, is closed by its own seal and is judged as it always was.

## Commands (from the repository root)

- `npm run state-kaal-change -- changes/<name>/YY/MM/DD/CC`: print the stage, what is next, and any problem (exit 1 when there is a problem).
- `npm run seal-kaal-work -- changes/<name>/YY/MM/DD/CC`: seal the Work; refused if there is a `retro.md` or the Work is already sealed.
- `npm run close-kaal-change -- changes/<name>/YY/MM/DD/CC`: seal the Change; refused unless the Work is sealed and `retro.md` is present.

The primitives beneath them are unchanged:


- `npm run seal-kaal-change -- changes/<name>/YY/MM/DD/CC`: seal one Change of `.kaal`, with no regard for the process.
- `npm run list-sealed-changes -- <kaal-dir>`: print `<path> <id>` for each closed Change.
- `npm run check-kaal-changes`: exit 1 if a Change or named-tree seal matches nothing (sealed history was altered or removed), or a closed Change's Work is no longer sealed.

This knows nothing of Git, GitHub, CI, branches, commits or pull requests. Repository controls consume `list-sealed-changes`; they do not hash anything themselves.
