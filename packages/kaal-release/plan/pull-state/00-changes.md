# Pull Promotion: qualify a collector from its file state (Change A to B)

This is `pull/C4`, a PLAN Change. It ships no code. It answers the CPO's review of 13 Nov 2026 on #1527: the unit of Pull Promotion is the capability a collector represents, **pull requests are transport, not PDCA evidence**, and qualification is read from the collector's **file state and effective delta against `main`**. It replaces the basis of the capability of `pull/C3` (PR pieces reconstructed from titles and `Driven-by:` trailers). [../pull-v1/](../pull-v1/) and [../pull-integration/](../pull-integration/) stay as the record of what was approved and merged.

## A: the present

`walkCollectors(facts, declaration)` (pull/C3) reads `pieces`: landed and open pull requests, typed from commit titles and tied to a Change by a trailer. It says a phase is missing when the title convention or a trailer is. The review found that this is not an authoritative basis: history is provenance, not evidence of the state of the work.

## B: the target

The Script reads, for each declared collector, **what the collector contains relative to `main`** and judges four things, in this order (PDCA of the collector as a whole):

1. **PLAN**: one or more PLAN files in the collector's head tree.
2. **DO**: one or more implementation files in the head tree.
3. **CHECK**: every expected Test Case, including the unchanged ones, each with its latest execution **on the exact current head of the collector**, which must be green.
4. **ACT**: **exactly one** concluding 4L retrospective for the collected work, after the last PLAN, DO and Case change in the collector's history (any file of the history that matches those patterns).

A collector qualifies when all four hold. Missing or ambiguous evidence is reported as such and never read as a pass. It stays advisory: it reports eligibility, never authorization to promote, and the order of the collectors is the declaration's alone. See [requirements.md](requirements.md) and [testing.md](testing.md).

## Interpretation (refined after the CPO's review of 13 Nov, 14:58)

- **The unit is the collector at promotion time.** One or more PLANs, DOs and Changes with a complete CHECK, and exactly **one** concluding 4L ACT for the collected work, never one per Change.
- **Delta and head tree answer different questions (refined after the CPO's review of 13 Nov, 15:59).** The effective delta says what promotion changes, so an empty delta is nothing to promote. The head tree is the collector's authoritative state and says whether the collected work holds its PLAN and DO evidence: those files may already be present without differing from `main`, and still count. The one concluding ACT is new work of the collector, so it is a delta file.
- **"Effective delta against main"** is the set of files that differ between the collector's head and `main`, with their status. The capability also receives the **tree** at the head and the collector's **history** (its commits since it diverged from `main`, in order, with the paths each changed). The command computes them.
- **The expected Test Cases** are every Case file of the head tree that matches the declaration's pattern, so an unchanged Case is still required, plus any Case ids the declaration pins as required (so deleting a Case cannot shrink the set). Their executions are reported by the host, one per run, with the exact head it ran at; the latest one of each expected Case counts and must be green **at the head being qualified**. A run at another head never counts.
- **The ACT concludes the work by position, not by time.** It is the one 4L file; no PLAN, DO or Case file may change in a commit after the one that last changed it. Order is read from the history (ancestry), never from file times or modification times, and the history must end at the head that is qualified, so the final CHECK is the check of the head that includes the ACT. A later change to something else (a README) does not break it.
- All path patterns (PLAN, DO, Cases, ACT) live in the declaration, so the Script names no folder.

## Order and constraints

The capability Change comes first, with its own PLAN, DO and ACT. The command (`pull/C2`) then needs its own revision: its gatherer replaces the PR and trailer reading with the delta, the head tree, the collector history, the ACT text and the Case executions at the exact head. Pull requests stay readable as provenance but are not read by the capability. No hook, CI, ruleset or Guard change.

## Not in this Change

The command and the host reading (a revision of `pull/C2`, its own PLAN and DO); the order of the collectors (an Owner decision in `declaration.json`); promotion, which stays the Owner's.

## Amendment: scope and discovery (CPO review of 13 Nov, 17:40, on #1527)

The approved contract judges a collector from the whole head tree, so PLAN, DO and Cases inherited from `main` can qualify a collector for another capability, and the evidence patterns of one record shape miss the other shapes of the repository (`plan/<change>/...` of the packages and `00-changes/<change>/...` of the engineering work). Two requirements are added without relaxing any of F25 to F31:

- **pull/F32** gives a declared collector a `scope`, the work it owns; everything is judged inside it and delta files outside it keep it from qualifying.
- **pull/F33** lets `cases.files` and `act.files` be lists and enforces that every test file in scope is a Case or declared not to be one, so a Case shape cannot be silently left out. That the PLAN, DO and ACT patterns name every record shape is not enforceable by the qualifier: it is the declaration's review, said so explicitly.

Cases T31 and T32 are RED against the Script on the collector today and are moved to `test/pull/` by the DO ([#1527](https://github.com/Kai-Hacks-AI/KAAL/pull/1527)).

## ACT: retrospective (4L)

Written by the agent that carried the Change.

### Liked

- Running each RED Case against three Scripts (the collector's, the previous DO head and a throwaway reference) showed what each requirement really added: T31 and T32 failed on the earlier head for the right reasons, so the amendment was a PLAN and not a rewrite.
- The reviews narrowed the contract in the right order: collector as the unit, then delta against head tree, then scope, then completeness. Each HOLD named one gap and was fixed with a Case.
- Keeping all five real-host runs unedited made the limits visible: no collector qualifies, and each run says why, so nothing was inferred green.

### Learned

- The delta says what promotion changes and the head tree says what the collected work holds. Judging evidence from the delta alone fails work that is already in the tree. Judging it from the whole tree lets everything inherited from `main` qualify any collector, so a scope of owned work is needed.
- A rule that reads "every file is named" finds an incomplete declaration at once: 27 test files of `verify-plan` and 15 of `kaal/release/plan` matched no Case pattern. A multiple-pattern feature alone proves nothing about completeness.
- The engineering Cases (`00-changes/.../T<n>.test.mjs`) are not run by CI, so the host holds no execution for them. The reader must say not judged and never assume green.
- A squash merge of the PLAN re-adds its RED files to a DO branch that had moved them; the DO must remove them again after each sync.
- Checking each scope against the collector's recorded real delta found five owned files that a hand-written scope had missed.

### Lacked

- A real collector that qualifies, so the green path is shown on a host-shaped fixture and not on the real host.
- Case executions under a scoped id for the `pull` Cases at the head and for the engineering Cases, so their CHECK is not judged today.
- A reliable event channel while I worked: one CPO review of #1527 reached me hours late, which cost time.

### Longed For

- CI that runs the engineering Cases and logs them under a scoped id, so their CHECK can be GREEN on the host.
- One concluding ACT per capability collector instead of one per Change: `kaal/release/plan` holds six retrospectives, so it cannot qualify by the Script's own rule.
- The Owner's decision on the order of the collectors in `declaration.json`, and the revision of the `pull/C2` command PLAN to describe the gatherer as built.
