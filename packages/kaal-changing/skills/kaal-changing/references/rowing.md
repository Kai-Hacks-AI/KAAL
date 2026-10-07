# Reference: review by ROWING, and the roles

`ROWING` (a Node of the installed KAAL, a KAAL Definition) names the discipline: Review Observed Work, Intelligent Not Generalized. Read it there; this file only says how a change is reviewed and who does what. It describes roles of a process, not a number of actors, models or contexts. What a role may and may not do is said of the actor while it is acting in that role; nothing here forbids one actor from holding several roles.

ROWING is the discipline between realized Work and its review, and it stays that if the process around it gains other roles. The three roles below, and the shape they make, explain how Changing KAAL currently uses it; they are not what ROWING means.

## The roles

The whole lifecycle is compact: `Intent → work ⇄ ROWING → seal work → WORK → seal Change → host and admission mechanics outside KAAL`. ROWING governs the mutable inner loop of work and review up to the Work seal. **WORK** governs what comes after it: the ordered retrospectives, Worker, Owner, Reviewer, then Knowledge (`references/retro.md`). The Owner gives the fixed Intent, stays out of the inner loop, and after the Work is sealed judges whether it answers that Intent; how a host authorizes or admits the closed change is outside KAAL.

```
             TARGET / INTENT
                   ↑
                 OWNER           steers: holds the target, observes from the helm
                   │
          WORKER ⇄ REVIEWER      row: Work and review go round inside
             ROWING
```

Three perspectives follow from it, one retrospective each, written in this order after the Work is sealed: the Work's (`retro-work.md`), the Owner's (`retro-owner.md`) and the review's (`retro-review.md`).


- **Owner.** Owns the Intent. Establishes what the change is to achieve, and the Intent is then the fixed target of the change: the Owner stays out of the inner loop of work and review, does not redo the Reviewer's work and does not revise the Intent inside it. Once the Work is sealed and the Worker has written `retro-work.md`, the Owner judges whether the sealed Work answers the Intent, which is a judgment and no artifact, and then writes `retro-owner.md`, which carries no approval or verdict. Judgment and retrospective are two acts, and the retrospective is not approval. Host admission mechanics are outside KAAL.
- **Worker.** Performs the Work, keeps `work/` (Intent as given and never changed by the Worker, Requirements, Architecture, evidence), resolves findings, and writes `retro-work.md` first. While acting as Worker it does not write rounds.
- **Reviewer.** Reviews the Work as realized and writes rounds in `review/`, and `retro-review.md`, last. While acting as Reviewer it does not change `work/`, and it neither owns nor changes the Intent.

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
- If review shows the Requirements or Architecture are wrong, they are Work: the Worker revises them and review continues. The Intent is the fixed target and is not renegotiated in review. If review shows the Intent cannot be delivered as stated, the change cannot converge as a successful realization, and it is not resolved by editing the Intent in the same change. What the Owner does with that result, including establishing a different Intent in another change, is outside the change.
- A review that approves can still have a critical retro, and a retro never approves. A finding that exists only in a retro is not a finding.

## Separation: required, recommended, and unprovable

- **What KAAL's checks require**: the structure and order above, including the order of the three retros. Nothing about who.
- **What the process requires and no check can show**: while acting as Reviewer, an actor writes only rounds and `retro-review.md` and does not change `work/`; each of the three retros is from its own seat, its writer's own, and they follow the order Worker, Owner, Reviewer. A single actor who holds several seats keeps the process valid and weakens what it shows.
- **Recommended**: Worker and Reviewer in separate contexts; the Owner other than the Worker; and each later retro written with the earlier ones read.
- **Beyond the record**: how a realization comes to hold these roles, how the closed change is handed on and authorized or admitted by a host, and whether a given review was independent or good are operational, outside what a closed change proves. A closed change shows that review ended on a converged round naming exactly the sealed Work, and that all three retrospectives exist; it does not show that the realization outside `work/` is what the Work describes.
