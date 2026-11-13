# Pull Promotion: tell the concluding ACT from the Change-history retrospectives (Change A to B)

This is `pull/C5`, a PLAN Change. It ships no code. It carries out the Owner's direction for collector qualification, relayed with the CPO's approval of the pull/C4 ACT: keep the existing per-Change retrospectives as Change history and add one concluding collector-level ACT as the qualification retrospective.

## A: the present

Pull Promotion (pull/C4) counts every file that matches `act.files` as an ACT and requires exactly one. `kaal/release/plan` holds six retrospectives (one per Change), so it can never qualify, and adding a collector-level one would make seven.

## B: the target

The declaration says which retrospectives are Change history (`act.history`) and which file is the concluding one (`act.files`). Change-history retrospectives are never candidates and are not read; exactly one concluding 4L ACT is required, after every PLAN, DO and Case change and after every Change-history retrospective by the position in the commit history. Without `history` the approved behaviour is unchanged. See [requirements.md](requirements.md) and [testing.md](testing.md).

## Mechanism proposed (CTO side; the CPO decides on the PR)

- The concluding ACT of a collector is a file named `concluding-act.md` inside the collector's scope. The name is the declaration's, so it can change by changing a reviewed file.
- The two record shapes of the repository (`plan/<change>/00-changes.md`, `00-changes/<change>/act.md`) are declared as `act.history`.
- The concluding ACT is the **qualification retrospective for the whole collected work**, written by the agent that carried the collector, with the four 4L headings.
- A collector with one Change still needs its concluding ACT: the Change retrospective is history, not the conclusion.

## Order and constraints

PLAN first (this), then its DO (the Script, the declaration of this repository and the Case moved to `test/pull/`), then the concluding ACT of `kaal/release/plan` itself, written when its collected work is complete. No hook, CI, ruleset or Guard change; read-only.

## Not in this Change

The concluding ACT file of any collector; the collector order; the host gatherer (`pull/C2` revision, separate).

## ACT: retrospective (4L)

Written by the agent that carried the Change.

### Liked

- The Owner's direction arrived as one sentence and became one requirement (F34) with one Case (T33) that failed on the collector's Script and passed on a throwaway reference before any DO code existed. The DO was then a small patch of two lines of judgment and a declaration change.
- Keeping the history retrospectives unread removed a whole class of noise: a stale or incomplete old retrospective can no longer make a collector ambiguous.
- Re-running the real host after the change showed the effect in one line: `kaal/release/plan` stopped reporting six retrospectives and started reporting the truth, that no concluding ACT exists yet.

### Learned

- Telling two kinds of records apart needs two names in the declaration, not a smarter pattern: `act.history` for what happened and `act.files` for the conclusion. Anything cleverer would have guessed.
- Ordering has to include the history retrospectives too. A conclusion written before the last Change retrospective is not a conclusion, so the ordering rule covers them by commit position, and one the history never places is not judged.
- Moving the ACT shapes into `act.history` broke the host-shaped fixture of T14 at once, because its qualifying collector used a Change-style ACT. That is the Case doing its job, and it shows how much the old shape had been taken for the conclusion.
- The command PLAN revision needed no new Case: T14 and T18 already covered what shipped. Saying so in the PR was clearer than inventing a RED Case.

### Lacked

- A concluding ACT for `kaal/release/plan` itself. The mechanism exists, but no collector holds a `concluding-act.md`, so no real collector can qualify, and the green path is still shown only on fixtures.
- A decision on who writes a collector's concluding ACT and when: the agent that carried the last Change, at the moment the collected work is complete, is my assumption, not a recorded rule.

### Longed For

- A first real concluding ACT on a real collector, to show a qualifier on the host and not only on fixtures.
- CI that runs the engineering Cases and the Cases in the `plan/<change>/` folders under a scoped id, so their CHECK can be GREEN on the host.
- The Owner's order of the collectors in `declaration.json`.
