# Pull Promotion: read the history of a synchronized collector (Change A to B)

This is `pull/C7`, a PLAN Change. It ships no code. It corrects a defect in pull/C4 found by the first qualification run on a synchronized collector, and it carries out the CPO's decision "FIX FIRST" (review on #1577). It authorizes preparation of the correction, not promotion or publication.

## A: the present

The host gatherer reads the collector's commits since the merge base (the host's three-dot comparison) and accepts them only as one first-parent line that starts at the merge base. After the collector merges `main` (the SYNC every promotion needs) the merge base moves to the new `main` head, and the comparison lists older collector commits whose first-parent chain starts at an older commit. The gatherer reports "could not order the history", so every synchronized collector is "not judged". `kaal/release/plan` at `e1077a1` shows it.

## B: the target

The history is the collector's first-parent ancestry from the head back to the first commit already contained in `main`. A SYNC merge commit may stand on that line, but what it merged from `main` is not collector work and is not read as evidence. Order stays the position on the line, never a time. A history that cannot be read as one complete line fails closed: the collector is not judged. See [requirements.md](requirements.md) and [testing.md](testing.md).

## Not in this Change

No weakening of any rule: scoped PLAN and DO, the exact-head CHECK, Case completeness and exactly one concluding collector-level ACT stay as approved. No hook, CI, ruleset or Guard change; read-only. No promotion of `kaal/release/plan` (#1577 stays in draft until this lands, the collector is synchronized again and the qualification is re-run).

## Order

PLAN (this), then DO (the gatherer's history rule and the revised assertion in T14), then ACT, then a fresh concluding ACT of `kaal/release/plan`, then live integration evidence on the synchronized collector.

## ACT: retrospective (4L)

Written by the agent that carried the Change.

### Liked

- The first live run on the synchronized collector was the right test: it turned "not judged" into a judged collector, and it found the real SYNC pull request shape that my first fix had missed.
- T35 uses a real Git repository with two SYNC pull requests and a direct merge of `main`, so the shapes are Git's own and not my reading of them. The CPO's negative Case (a development-branch merge) went into the same file without a rewrite.
- The reader still fails closed. The fix widened what is accepted only where the evidence is proven, and the live report stays honest about why the collector does not qualify.

### Learned

- Parent count is not identity. A merge with a second parent is not a SYNC unless the host confirms that `main` contains that parent; anything else is the collector's own work and must be accounted for or refused. I inferred a SYNC from the count, and the CPO caught it.
- A fix proven only on the shape I expected is half a fix. My first `historyOf` change failed on the real SYNC pull request shape, and the second change went too far in the other direction.
- A missing side commit cannot be told from a commit of `main` by ordering alone. The host's own commit count guards it, and a test that asserted otherwise was wrong.

### Lacked

- A fixture library of real Git histories (SYNC pull requests, direct merges, development branches), so that each reader Case starts from the same shapes.
- A way to run the gatherer against a recorded host history before the first live run.

### Longed For

- The remaining reasons the collector does not qualify closed by their own Changes: a fresh concluding ACT, the twelve bare-id plan Cases `T33` to `T44`, and `wire/T34` under its matching scope.
- One definition of a SYNC shared by the Branching rule and the gatherer, so they cannot drift.
