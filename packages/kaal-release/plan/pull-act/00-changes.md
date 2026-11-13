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
