# change-seal

Provisional engineering machinery that seals the Work of a KAAL Change and closes the Change. It is not shipped, and it is not a Skill; it decides which directory is a Change and which is a named tree. How any directory tree is given an identity, and what a seal marker is, are the Sealing capability's (`packages/kaal-sealing`), which these helpers consume and never reimplement.

A Change is the directory `changes/<name>/YY/MM/DD/CC/` of a KAAL directory. Its ID is the SHA-256 of a canonical stream over the whole tree (`packages/kaal-sealing/skills/kaal-sealing/scripts/artifact-id.mjs` states the format; `helpers/change-id.ts` only says which tree is a Change): relative paths are identity-bearing, only regular files participate, and anything ambiguous (symlinks, empty directories, non-NFC or case-colliding paths, backslashes, control characters) is refused. A Node's identity is unchanged: its bytes alone.

A Change is **closed** when the ID of its current tree has a seal, the empty marker `seals/changes/<Change-ID>` in the KAAL directory, outside the tree it seals. There is no status metadata. Bare `seals/<ID>` markers remain Node seals.

## The process

A Change is taken through exactly: work and review (rounds, until one converges), seal work, retro-work and retro-review in either order, seal Change.

```
changes/<name>/YY/MM/DD/CC/
├── work/              open while review has findings; sealed once review has converged on it
├── review/            rounds, NN.md, by the Reviewer; each names the Work it reviewed and its result
├── retro-work.md      from the Work's seat, by the Worker, after work/ is sealed
└── retro-review.md    from the review's seat, by the Reviewer, after work/ is sealed
```

`work/` is scaffolding for learning this boundary, not a permanent KAAL concept; it is the first consumer of a **named tree**. A named tree's ID (`KAAL Tree v1`, Sealing's `artifact-id.mjs --named`) is the SHA-256 of a canonical stream over its own root name, its relative paths and exact bytes. Its parent and location are excluded: `A/work/` moved to `B/work/` keeps its identity, `work/` renamed to `evidence/` does not, and any edit, addition, deletion or inner move changes it. Its seal is the empty marker `seals/trees/<ID>`, outside what it seals. The Change identity (`KAAL Change v1`) is deliberately unchanged: it excludes the Change's own name, exactly as genesis `01` was sealed. `review/` and the retros sit outside `work/`, so adding them never disturbs the Work seal, and the final Change seal covers all of it. There is no round seal, no Retro seal, no role or writer-identity metadata and no status metadata: where a Change is, is derived from `work/`, `review/`, the two retros and the seals (`helpers/process.ts`, the one evaluator):

- `WORK OPEN`, next: complete the work or resolve the findings of the latest round, then have it reviewed (any retro here is reported as an invalid step)
- `REVIEW CONVERGED`, next: seal work
- `WORK SEALED`, next: write `retro-work.md` and `retro-review.md`
- `RETRO-WORK PRESENT` or `RETRO-REVIEW PRESENT`, next: write the other
- `RETROS PRESENT`, next: seal Change
- `CHANGE CLOSED`

**Review.** A round is the file `review/NN.md`, numbered `01`, `02`, … without a gap. The evaluator reads two of its lines, `Work: <identity>` and `Result: findings` or `Result: converged`, and nothing else; whether the findings are good is not its business. Review has converged exactly when the latest round says `converged` and names the identity of `work/` as it now stands, which `state` prints as `work:` while `work/` is open. Changing `work/` after a round therefore undoes convergence by itself, and a Reviewer who edits the Work invalidates its own round. Sealing Work is refused unless review has converged, and a sealed Work without a converged round naming exactly it is reported as a problem. "Work ready for review" is not derived: nothing in the artifacts tells finished Work from Work being written, and no file is added to say so.

The retros may come in either order: each is written after the Work is sealed, from its own seat, and presence cannot show who wrote a file or whether either read the other. That, and the independence of the Reviewer from the Worker, stay a convention of Changing KAAL.

**The historical forms.** Changes closed before review (genesis `01`, `05/01` with the single `retro.md`, `05/02` with `retro-work.md` and `retro-observe.md`) stay valid exactly as sealed: a closed Change is judged by its own seal, whatever files it holds, and nothing is rewritten. `retro.md` and `retro-observe.md` are not steps of an open Change: each is reported as a problem there and never stands in for the two, so no new Change can close with them.

## Commands (from the repository root)

- `npm run state-kaal-change -- changes/<name>/YY/MM/DD/CC`: print the stage, what is next, the identity of `work/` as it now stands (`work:`, while the Change is not closed) and any problem (exit 1 when there is a problem).
- `npm run seal-kaal-work -- changes/<name>/YY/MM/DD/CC`: seal the Work; refused unless review has converged on it, if any retro exists, or the Work is already sealed.
- `npm run close-kaal-change -- changes/<name>/YY/MM/DD/CC`: seal the Change; refused unless the Work is sealed on a converged review and both `retro-work.md` and `retro-review.md` are present.

- `npm run check-kaal-admission -- <baseline-kaal-dir> <candidate-kaal-dir>`: admission into the lineage, below.

The primitives beneath them are unchanged:


- `npm run seal-kaal-change -- changes/<name>/YY/MM/DD/CC`: seal one Change of `.kaal`, with no regard for the process.
- `npm run list-sealed-changes -- <kaal-dir>`: print `<path> <id>` for each closed Change.
- `npm run check-kaal-changes`: exit 1 if a Change or named-tree seal matches nothing (sealed history was altered or removed), or a closed Change's Work is no longer sealed.

This knows nothing of Git, GitHub, CI, branches, commits or pull requests. Repository controls consume `list-sealed-changes`; they do not hash anything themselves.

## Admission

`helpers/admission.ts` is one predicate over two KAAL directories: the **baseline** (already admitted) and the **candidate** (proposed). It admits exactly when

- the candidate introduces exactly one **new** Change, one for which the baseline has neither a Change at its address nor a closed Change of its identity;
- that Change is `CHANGE CLOSED` with no problems, as the one evaluator in `process.ts` says (Work sealed, both retrospectives, Change sealed); and
- every Change closed in the baseline is still closed in the candidate with the same identity.

Zero new Changes, more than one, a new Change that is not closed, and any closed history altered or removed are each refused, with the reason on stderr. The new Change is found by content alone. Changes that are in the baseline and not closed are not judged: the predicate judges what an admission introduces and makes no exception for anything. Closure is the evaluator's verdict, identity is `changes.ts`'s, and nothing here hashes or decides either. Like everything in this directory it knows nothing of Git, GitHub, branches, PRs or CI: whatever hosts the lineage extracts the two directories, runs the command and enforces the exit code (0 admitted, 1 refused, 2 usage). `preserve-sealed-changes` remains the host's history control and consumes the same identities.

Change numbering stays optimistic: a new Change takes the next free `CC` visible in the lineage it was staged from, and nothing reserves it. Two staged Changes may take the same address; the collision is resolved at admission, when the later one refreshes against the lineage and allocates the next free number before its Work is sealed. Admission is the serialization point.
