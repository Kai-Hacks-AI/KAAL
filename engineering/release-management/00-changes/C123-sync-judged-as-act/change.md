# C123 change

## PLAN

### The control: attribute Changes

A bounded control with one responsibility: attribute each changed path to the collector (`own`), to main (`inherited`) or to neither provably (`unknown`). It decides nothing about what an ACT may write, whether work is finished, or whether a retro reflects it; those stay with the judges. Its implementation is a pure library, `lib/attribute-changes.mjs`, over folders of files; it reads no Git. Its own control record, flag `KAAL_RELEASE_ATTRIBUTE_CHANGES` for any report of its own, and Cases are separate from the judges' (the CTO owns placement and the exact module). A label, a title, a branch name or a declared "SYNC" type is never evidence.

### The evidence: four folders of files

1. `before`: the collector before the pull request.
2. `after`: the merge result.
3. `contained`: **main as the merge result contains it**, that is main at the newest main commit already inside `after`. This is the key fact. It is the same folder as today's main when main has not moved, and it stays the same when main moves afterwards, so a later advance of main changes nothing. It is not branch currency: it says what main content the result holds, and nothing about whether the collector is behind.
4. `main`: the default branch now (kept for the judges that read the write map and the scripts from it, as today).

Git and GitHub only bring the folders: the check computes the merge-base of `after` and main and checks out that revision into `contained`, as it checks out the other folders. No judgement reads a commit, a parent or a history.

### The attribution, per path

A path is **changed** when its bytes differ between `before` and `after`, or it exists in only one.
- **inherited**: the path has the same bytes in `after` and in `contained` (or is absent from both: main made the same deletion). Content main already holds. Proof; main moving afterwards cannot change it.
- **own**: the path differs from `contained`. A collector contribution, including a conflict-resolution edit, which equals neither side. Proof by difference from what main holds in the result.
- **unknown**: `contained` (or `before` or `after`) is absent or unreadable. Never `own`, never `inherited`, never PASS.

The unit is the path. A file that mixes inherited and own lines is `own`: the control does not split a file.

### The consumer contract

`attributeChanges({ before, after, contained })` returns `{ own, inherited, unknown, complete }`, `complete` meaning `unknown` is empty.
- A judge judges `own` only. A FAIL on an `own` path stays a FAIL: a genuine contribution is never lost.
- A non-empty `unknown` with no FAIL on `own` makes the judge answer UNKNOWN, naming the paths. Uncertain origin is neither a definitive FAIL nor a free PASS.
- A pure SYNC has no `own` and nothing `unknown`: limit Act answers "not an ACT" (PASS, applies false), and so do demand, verify and hold, which ask limit first.
- The runner calls the control once and hands each judge its answer; no judge reads Git or repeats the rule.

### What this does not decide

Branch currency (is the collector behind main?) is Branching's judgement and stays so. A collector behind main is not made to look as if it had authored main's later changes, and a SYNC is not required for attribution to be right.

### Where the folders come from

The check already checks out main and the merge result. It needs two more folders: the collector before (the pull request's base sha) and `contained` (the merge-base of the merge result and main, which needs the history that the check does not fetch today, depth 2). That is a change of the workflow source in the DO and a WIRE to install it, on Kai's go. Until installed, the runner receives no `--before` or `--contained` and answers UNKNOWN naming the missing folder; the flags are unset, so it is a report only. The DO goes first (an older runner ignores the extra arguments), then the WIRE.

### Cases (file fixtures; no Git)

Pure SYNC (every changed path equals `contained`: `own` empty, limit Act PASS, applies false); mixed contributions (one own path, one inherited: only the own is judged and a FAIL on it stays); conflict resolution (a path equal to neither side is own); main advanced after the SYNC (`main` differs from `contained` on a path: the path stays inherited); unavailable provenance (`contained` absent: UNKNOWN, never PASS and never FAIL); ambiguous provenance (`before` unreadable: UNKNOWN). Each Case has its own fixture and is independent of the judges, plus one Case per judge that consumes the answer. They travel with the source in the DO, because the Engineering check runs every Case. T1350 and T1351 of the closed hotfix read Git and are not carried.

### Identifier

This Change keeps release/C123, already on the PLAN pull request and in the Defect record. The workflow-source against installed consistency control, queued earlier as C123, moves to release/C126 (C124 workflow names and C125 hold reads evidence are unchanged). Nothing of that scope is dropped; C126 is used on no branch or pull request (checked 21 Nov).

### Records

The Defect is `D18-sync-judged-as-act.md` in this folder.
