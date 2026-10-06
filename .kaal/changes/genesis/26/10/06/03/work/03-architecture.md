# Architecture

## The process

```
allocate
  → work  ⇄  review (rounds)        the Work stays open while review has findings
  → review converged                derived, not recorded
  → seal work                       only once converged on exactly this Work
  → retro-work.md, retro-review.md, retro-owner.md   after the Work is sealed, any order
  → seal Change                     closure
```

The record of a Change:

```
<kaal-dir>/changes/<name>/YY/MM/DD/CC/
├── work/              Intent, Requirements, Architecture, evidence; open while review has findings
├── review/
│   ├── 01.md          one file per round, written by the Reviewer, never edited afterwards
│   └── 02.md
├── retro-work.md      the Worker's, from the Work's seat
├── retro-review.md    the Reviewer's, from the review seat
└── retro-owner.md     the Owner's, from the Owner's seat
```

`review/` sits beside `work/`, not inside it: a review inside the Work would change the identity of the thing it names.

## A round

```
# Review

Work: <identity of work/ as reviewed>
Result: findings | converged

## Findings

...
```

`Work` is the named-tree identity of `work/` that the Reviewer was reading, printed by the state command while `work/` is open. `Result` is one word. Findings are concrete matters that must be resolved, each stated against Intent, Requirements, Architecture or the evidence, each reconstructable by the Worker without asking. A converged round states `None.`. Broader architectural consequences and future work are not findings: they are the Reviewer's to put in its retrospective.

The evaluator reads two lines of a round, `Work` and `Result`, and nothing else; it does not judge the Findings text. Rounds are numbered `01`, `02`, … without a gap.

## Derived state

From `work/`, `review/`, the three retrospectives and the seals:

| Stage | Derived from | Next |
| --- | --- | --- |
| `WORK OPEN` | no round, or the latest round has findings, or the Work changed since the latest round | complete the Work, or resolve the findings, then have it reviewed (write the next round) |
| `REVIEW CONVERGED` | the latest round says converged and names the Work as it now stands | seal work |
| `WORK SEALED` | the Work is sealed (and a converged round names it) and a retrospective is missing | write the missing ones of `retro-work.md`, `retro-review.md`, `retro-owner.md` |
| `RETRO-WORK PRESENT` / `RETRO-REVIEW PRESENT` | one of them exists | write the other |
| `RETROS PRESENT` | all three exist | seal Change |
| `CHANGE CLOSED` | the Change's identity is sealed | none |

"Review has findings", "review converged" and "worker retrospective required" are derived. "Work ready for Review" is not: nothing in the artifacts distinguishes finished Work from Work still being written, and no file is added to say so. It is the Worker's statement when it stops, and the first round is the answer.

Problems the evaluator reports: a round that is malformed or out of sequence; an unknown file in `review/`; any retrospective before the Work is sealed; a sealed Work with no converged round naming exactly it; a later round with findings after the Work was sealed; the historical single `retro.md` in an open Change.

## What lives where

**ROWING** is a KAAL Definition, delivered by Changing KAAL's capability beside RATIFICATION, sealed by its own bytes. It states the mnemonic and what it restricts. RATIFICATION is the precedent: a named discipline delivered by the capability that uses it, not Core, claiming no relationship to the sealed Changing KAAL Node (which cannot be revised: changed bytes are another Node, and the installer cannot replace a registered Skill Node). The Skill and its references use the name; the Node does not name roles, rounds, files or retrospectives. ROWING is the discipline between realized Work and its review; the Owner, Worker and Reviewer, and the 2+1 shape they make, explain how Changing KAAL currently uses it. If the process later gains other roles, the Skill changes and ROWING does not.

**The roles and the process** live in the Agent Skill (`SKILL.md` steps and rules; `references/rowing.md` for roles, rounds and findings; `references/retro.md` for the three retrospectives). They are how-to, and they may change as the process is learned, which a sealed Node cannot.

**The evaluator** (`engineering/change-seal`, the one evaluator) learns rounds and the new stages. It remains provisional, ignorant of any host, and the only place that decides order.

## Answers to the twenty-five questions

1. **What is Review?** The Reviewer's judgment of the realized Work against Intent, Requirements, Architecture and its evidence, recorded as a round with one result. It is a step of the Change, between Work and retrospectives.
2. **What does ROWING require and forbid?** It requires judgment over the observed Work, anchored to the Change as intended, with deterministic checks as evidence. It forbids redoing or editing the Work, redesigning, widening scope, substituting a preferred solution, treating checks as the review, and ownership of the Intent.
3. **Where does the definition live?** As a KAAL Definition in `packages/kaal-changing/kaal/`, as RATIFICATION does. Not Core, not a revised Changing KAAL Node, not Skill text alone: a named discipline wants an immutable meaning and a reference by name and identity.
4. **Responsibilities.** The Owner establishes the Intent, stays out of the inner loop, observes the Change from outside and writes `retro-owner.md` after the Work is sealed, and only after the Change is sealed decides whether the completed, reviewed Change realizes the Intent. The Worker performs the Work, resolves findings, and writes the Work's inside view. The Reviewer judges the realized Work, writes rounds, and writes its own view of having reviewed. Worker and Reviewer row; the Owner steers.
5. **Local roles or ontology?** All local process roles, stated in the Agent Skill. No Role Node. If roles recur across independent capabilities they may earn ontology in another Change.
6. **Findings artifact.** A round in `review/` whose Result is `findings`.
7. **Convergence artifact.** None of its own. It is the latest round, saying converged and naming the Work as it now stands. If the Work changes afterwards, it no longer holds.
8. **Iterate without more Changes?** Yes. Rounds `01`, `02`, … inside the one Change.
9. **Worker with findings.** It resolves them by changing the open Work, or states in the Work why a finding should not stand, and stops for the next round. It writes no round and records no convergence.
10. **Reviewer after resolution.** It writes the next round on the Work as it now stands, saying whether each earlier finding stands, and any new finding in what changed. It stays anchored to the same Change.
11. **May the Reviewer modify Work?** No. If it did, the identity named by its own round would no longer be the Work's, and it would not converge. The structure makes the prohibition self-evident, though not who did it.
12. **Review challenges Intent, Requirements or Architecture.** A finding may say so. Requirements and Architecture are Work: the Worker revises them and review goes on. The Intent is the Owner's. If review shows the Intent itself is wrong, the Worker cannot resolve it; the Change does not converge, and the Owner either revises the Intent in the Work, or begins another Change. Nothing is deleted.
13. **Review result versus reviewer retro.** The result says whether the Work satisfies the Change, and is actionable. The retro says what the Reviewer learned by reviewing, and is not. A Reviewer may converge the Work and write a critical retro; a retro never approves, and a finding never lives only in a retro.
14. **`retro-observe.md` or `retro-review.md`?** Neither name is kept for the outer seat. Observation and review are different activities; the Reviewer's perspective is `retro-review.md`, which holds `review/` and the activity. The outer perspective is the Owner's, and it is named for the role, `retro-owner.md`: `retro-observe.md` is historical terminology from when that perspective was thought of as an Observer, and carrying it forward would imply a fourth Observer role. `retro-work.md` stays. Three perspectives, one retrospective each, named by role: the Work's (oar), the review's (oar), the Owner's (helm).
15. **Historical Changes.** A closed Change is judged by its own seal and is never re-evaluated. `retro.md`, and `retro-work.md` with `retro-observe.md`, and a Change with no `review/`, stay valid as sealed. An open Change reports `retro.md` and `retro-observe.md` as historical forms, a sealed Work with no converged review, and fewer than three retrospectives as not closed. Nothing historical is migrated.
16. **Worker retro.** After the Work is sealed, which is after review converged.
17. **Reviewer and Owner retros.** Also after the Work is sealed. The Reviewer's activity ended with convergence; the Owner's observation is of the sealed Work and the review. The three come in any order.
18. **Should either see the other first?** Recommended not. Each is its writer's own; the Reviewer's has no need of the Worker's, and the Worker's already has the findings. Not enforceable and not enforced; the order between them is free.
19. **What closure proves.** The Work and the Change are sealed by identity; review ended on a converged round naming exactly the sealed Work; rounds are contiguous; all three retrospectives exist; nothing historical was altered.
20. **What remains operational.** Who wrote what and whether the Reviewer was independent of the Worker; whether the review was good; whether the realization outside `work/` is what the Work describes; whether a retrospective is honest; the Owner's decision.
21. **Owner reflection and Owner decision.** Two acts. The reflection is `retro-owner.md`, inside the Change, written after the Work is sealed. The decision comes after the Change is sealed, outside the record: a closed Change is what the Owner receives, and the Owner decides whether to admit it. No approval artifact: it would put a decision inside the identity of what is decided on. The Owner's retro is not approval.
22. **One actor, several roles.** Valid. Roles are told apart by artifact, not by identity: rounds are the review seat's, `retro-work.md` the work seat's. The guarantee is weaker, not different.
23. **Required versus recommended.** Required by meaning, unprovable: while acting as Reviewer an actor writes only rounds and its retrospective and does not change the Work; each retrospective is from its own seat. Recommended: Worker and Reviewer in separate contexts, the Owner other than the Worker, no retrospective read before writing one's own. Required by KAAL's checks: structure and order only.
24. **How a host consumes it.** It runs the state command and sees a stage, and the closed Change's identity. KAAL says nothing about how those are realized or enforced. No host word appears in KAAL.
25. **Smallest implementation.** ROWING and its seal; Agent Skill steps and two references; the evaluator extended by rounds, stages and the third retrospective; acceptance; this Change's own record.

## Limits

Convergence binds the review to the Work record, `work/`; it does not bind it to the realization the Work describes, which lives elsewhere. Whether the two agree is for the Reviewer's judgment and for whatever admits the Change. Independence of the Reviewer is a requirement of the process that no check can establish.

## Rollout

Open Changes that sealed their Work before this process have no converged round and are reported until one exists: a Reviewer reads the sealed Work, and round `01` names it. Nothing sealed is touched.
