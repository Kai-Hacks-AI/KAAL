# Pull Promotion: qualify a collector from its file state (Change A to B)

This is `pull/C4`, a PLAN Change. It ships no code. It answers the CPO's review of 13 Nov 2026 on #1527: the unit of Pull Promotion is the capability a collector represents, **pull requests are transport, not PDCA evidence**, and qualification is read from the collector's **file state and effective delta against `main`**. It replaces the basis of the capability of `pull/C3` (PR pieces reconstructed from titles and `Driven-by:` trailers). [../pull-v1/](../pull-v1/) and [../pull-integration/](../pull-integration/) stay as the record of what was approved and merged.

## A: the present

`walkCollectors(facts, declaration)` (pull/C3) reads `pieces`: landed and open pull requests, typed from commit titles and tied to a Change by a trailer. It says a phase is missing when the title convention or a trailer is. The review found that this is not an authoritative basis: history is provenance, not evidence of the state of the work.

## B: the target

The Script reads, for each declared collector, **what the collector contains relative to `main`** and judges four things, in this order:

1. **PLAN**: one or more PLAN files in the delta.
2. **DO**: one or more implementation files in the delta.
3. **CHECK**: the Test Cases the PLAN expects, each with its latest execution **on the current head of the collector**, which must be green.
4. **ACT**: **exactly one** concluding 4L retrospective in the delta, changed after the last PLAN and DO file.

A collector qualifies when all four hold. Missing or ambiguous evidence is reported as such and never read as a pass. It stays advisory: it reports eligibility, never authorization to promote, and the order of the collectors is the declaration's alone. See [requirements.md](requirements.md) and [testing.md](testing.md).

## Interpretation I chose, for the CPO to confirm or correct

- **"Effective delta against main"** is the set of files that differ between the collector's head and `main`, each with its status and the time it was last changed on the collector. The capability receives it as data; the command computes it.
- **"Expected Test Cases"** are the Case files in the delta (declared by one file pattern whose first group is the id). Their **executions** are reported by the host, one per run of a Case: its id, the head it ran at, the conclusion and when. The latest execution of each expected Case counts.
- **"Exactly one ACT"** is one file in the delta that holds the four 4L headings (Liked, Learned, Lacked, Longed For). Zero is missing, two or more is not a conclusion. **"After PLAN, DO and CHECK"**: it was changed no earlier than any PLAN or DO file, and the CHECK is judged at the head that includes it.
- The patterns that say which paths are PLAN, DO, Case files and ACT files are part of the **declaration** (`evidence`), not of the Script, so the Script names no folder of this repository.

## Order and constraints

The capability Change comes first, with its own PLAN, DO and ACT. The command (`pull/C2`) then needs its own revision: its gatherer replaces the PR and trailer reading with the delta, the file times, the ACT text and the Case executions. Pull requests stay readable as provenance but are not read by the capability. No hook, CI, ruleset or Guard change.

## Not in this Change

The command and the host reading (a revision of `pull/C2`, its own PLAN and DO); the order of the collectors (an Owner decision in `declaration.json`); promotion, which stays the Owner's.
