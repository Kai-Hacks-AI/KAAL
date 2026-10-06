# Reference: review by ROWING, and the roles

`ROWING` (a Node of the installed KAAL, a KAAL Definition) names the discipline: Review Observed Work, Intelligent Not Generalized. Read it there; this file only says how a change is reviewed and who does what. It describes roles of a process, not a number of actors, models or contexts: whoever holds a role does what it says, and one actor may hold several.

## The roles

- **Owner.** Owns the Intent. Establishes what the change is to achieve, and finally decides whether the completed and reviewed change realizes it. The Owner is not in the inner loop of work and review, and does not redo the Reviewer's work. The Owner's decision is the decision to admit the closed change; it is not an artifact of the record.
- **Worker.** Performs the Work, keeps `work/` (Intent as given, Requirements, Architecture, evidence), resolves findings, and writes `retro-work.md`. The Worker does not review its own Work as the Reviewer and does not write rounds.
- **Reviewer.** Reviews the Work as realized and writes rounds in `review/`, and `retro-review.md`. The Reviewer does not perform, edit or re-perform the Work and does not own the Intent.

Reviewer and Owner differ even when one actor holds both: the Reviewer judges whether the observed Work conforms to the change as intended; the Owner judges whether the intended change was what was wanted.

## What ROWING asks of a round

- **Review the observed Work.** Read what was realized and its evidence, not the Work you would have produced. Run what can be run; read what is there.
- **Judge.** Deterministic checks are evidence for the review, never the review. A green check does not converge a round, and a red one is a finding only if the Reviewer judges it so.
- **Stay anchored.** A finding is stated against the Intent, a Requirement, the Architecture or the evidence, and says what must be resolved. Do not use the review to redesign, to widen the change, or to put a preferred general solution where the intended one is. Broader architectural consequences and future work are observations: they go in `retro-review.md` or a later change, not in a finding.
- **Do not edit the Work.** A Reviewer who changes `work/` changes the identity its own round names, and its review no longer holds.

## A round

One file per round, `review/01.md`, `review/02.md`, … without a gap, each never edited once written:

```
# Review

Work: <identity of work/ as reviewed>
Result: findings | converged

## Findings

...
```

`Work` is the identity `npm run state-kaal-change -- changes/<name>/YY/MM/DD/CC` prints as `work:` while `work/` is open; name exactly that. `Result` is `findings` or `converged`. Under Findings, each finding is concrete and resolvable by the Worker without asking the Reviewer what it meant. A converged round says `None.`. After findings were resolved, the next round says whether each earlier finding stands. The evaluator reads the `Work` and `Result` lines and does not judge the rest.

## Iterating

```
Work → Review ─ findings → Work continues → Review again
                converged → seal work → retros → close
```

- Findings are resolved by changing `work/`, which stays open until a round converges. If the Worker disagrees with a finding, it says why in `work/`; the next round, not the Worker, decides whether the finding stands. Nothing is deleted, and no further change is allocated.
- A round converges when the Reviewer judges the Work satisfies the change sufficiently to proceed. Review has converged exactly when the latest round says so and names the Work as it now stands: change the Work afterwards and it has not.
- If review shows the Requirements or Architecture are wrong, they are Work: the Worker revises them and review continues. If it shows the Intent itself is wrong, the Worker cannot resolve it: the change does not converge, and the Owner either revises the Intent in `work/` or leaves the change and begins another.
- A review that approves can still have a critical retro, and a retro never approves. A finding that exists only in a retro is not a finding.

## Separation: required, recommended, and unprovable

- **What KAAL's checks require**: the structure and order above. Nothing about who.
- **What the process requires and no check can show**: the Reviewer writes only rounds and `retro-review.md`; each retro is from its own seat, its writer's own; the Reviewer did not perform the Work. A single actor who holds both seats keeps the process valid and weakens what it shows.
- **Recommended**: Worker and Reviewer in separate contexts; the Owner other than the Worker; neither retro read before writing one's own.
- **Beyond the record**: how a realization comes to hold these roles, how the closed change is handed on and accepted, and whether a given review was independent or good are operational, outside what a closed change proves. A closed change shows that review ended on a converged round naming exactly the sealed Work, and that both retrospectives exist; it does not show that the realization outside `work/` is what the Work describes.
