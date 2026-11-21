# C123 change

## PLAN

A bounded, reusable attribution control. It answers one question, for each path a pull request changes: is the change the collector's own, inherited from main through a synchronization, or not established? Judges ask it and judge only what it attributes to the collector. It never says whether an ACT is valid.

### Boundary

- **In:** the origin of each changed path (own, inherited, unknown). Nothing else.
- **Out:** what an ACT may write (limit Act), whether the work is finished (demand Act), whether a retro reflects it (verify Act), Testing's observation (hold Act). No label, title, branch name or declared "SYNC" type is read: none is proof of origin.
- **A layer, not a process.** `05-src/phase/lib/attribution.mjs` is pure over evidence it is handed and reads no Git (T1314 keeps processes out of `lib`). The runner gathers the evidence (Git objects, the folder of main) and hands it in.

### The evidence of origin, per path, from independent sources

1. **Same as the main side of the SYNC.** When the head of the pull request is itself a merge, its parent that is not the collector's tip is main as it was at the SYNC. A path whose bytes in the merge result equal that parent's is `inherited`. This proof holds when main advances after the SYNC, because it compares with main at the SYNC and not with today's main.
2. **Same as the folder of main handed in** (the default branch the check already has). Equality is proof of `inherited`. Difference is not proof of anything, because main may have advanced.
3. **Differs from both sides of the SYNC** (a conflict resolution or an edit made in the merge): `own`. A novel edit is a genuine contribution.
4. **A path the head's first parent also changed** relative to the base is the collector's earlier work: `own`.
5. **Neither source can be read** (a shallow checkout without the SYNC's parents and a path that differs from the folder of main): `unknown`. Never `own`, never `inherited`.

### The consumer contract

`attribute(evidence)` returns `{ own: [paths], inherited: [paths], unknown: [paths], complete: boolean }`, `complete` being `unknown` empty.

- A judge judges `own` only. A FAIL on an `own` path stays a FAIL: a real contribution is never lost.
- With a non-empty `unknown` and no FAIL on `own`, the judge answers **UNKNOWN**, saying which paths could not be attributed. Uncertain origin is neither a definitive FAIL nor a free PASS.
- With `own` empty and `unknown` empty (a pure SYNC) the pull request changes nothing of its own: limit Act answers "not an ACT" (PASS, applies false), as for any pull request that touches no ACT folder.
- Judges call it through the runner; no judge reads Git or duplicates the rule (T1345's single reader stands).

### Checkout depth

The check fetches the merge result at depth 2, so the SYNC's parents are absent and source 1 is unavailable there. This PLAN does not change the workflow. In the check, paths equal to main's folder are `inherited` and the rest `unknown`: never a false FAIL, and a known UNKNOWN instead of a false PASS. Raising the depth (a one-line change of the installed workflow, fetch-depth 3 or 0) would let source 1 prove the rest, including after main advanced. It is a WIRE with Kai's go and is recorded here as the follow-up that closes the UNKNOWN; it is not assumed.

### Cases (independent of the fix; each with its own fixture)

Pure SYNC with the history (T1350, RED on main); pure SYNC in a depth-2 checkout with the folder of main (T1351); mixed contributions (own work and inherited in one pull request: only the own is judged); conflict resolution (a path differing from both sides is own); main advanced after the SYNC (with the history, still inherited; without it, unknown, not own and not FAIL); unavailable or ambiguous provenance (UNKNOWN, never PASS). Case ids are taken in the DO. They travel with the source, because the Engineering check runs every Case.

### Identifier

This Change keeps release/C123, which is already on the PLAN pull request and in the Defect record. The workflow-source against installed consistency control, queued earlier as C123, moves to release/C126 (C124 workflow names and C125 hold reads evidence are unchanged). Nothing of that scope is dropped; it is renumbered here and in release's queue, and C126 is used on no branch or pull request (checked 21 Nov).

### Records

The Defect is `D18-sync-judged-as-act.md` in this folder.
