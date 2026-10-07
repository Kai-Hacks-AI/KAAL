# Intent

Make Review an explicit part of the Change process, and name the discipline of that review ROWING:

```
R  Review
O  Observed
W  Work
I  Intelligent
N  Not
G  Generalized
```

Carry this as one coherent Change through intent, requirements, architecture and implementation, then through the review it introduces, the three retrospectives and closure. ROWING lands by being ROWED: the review discipline this Change introduces is the one used to review it.

## Why

Change `genesis/26/10/05/02` showed two things. Requiring a second retrospective does not create a second perspective: nothing in the process stopped the worker from supplying the observer's retrospective itself. And observation and review are different activities. Observing is looking; reviewing is judging the realized Work against what it was meant to realize. Review is therefore a perspective of its own, the Reviewer's, and a Reviewer's judgment is not a retrospective. It does not replace the outer perspective: the Owner, who holds the Intent and stays out of the inner loop, still observes the Change from outside.

The ordering defect has since repeated: across Changes `06/03` to `06/09` and `07/01` the worker followed the installed process literally (complete Work, seal Work, retro-work, then independent review), so architectural findings arrived only after the Work was immutable. That persistence shows the process governs agent behaviour, so the fix must change the handoff structurally: the independent Reviewer is pulled in at Review, while the Work is still mutable, and is not first introduced after the Work seal as a retrospective actor. The observer-handoff part of #41 pulled toward seal-before-review and is superseded by this ordering.

## What the owner wants

Changing KAAL describes process roles and responsibilities, not a number of agents, models, providers, humans or execution contexts. The generic process is:

```
Intent → Work ⇄ ROWING → seal Work → WORK → seal Change → host and admission mechanics outside KAAL
```

Three roles: the Owner owns the Intent and, once the Work is sealed, judges whether the sealed Work answers it; the Worker performs the Work and writes the Work's inside view; the Reviewer judges the realized Work and writes its own view of having done so. Two row and one steers: Worker and Reviewer go round with Work and review; the Owner holds the target and steers from the helm. Three perspectives follow, each with a retrospective: the Work's, the Owner's and the review's, in that order. The Owner's judgment of the Work against the Intent and the Owner's retrospective are two acts, and the first is no artifact. These are roles, not necessarily separate actors. A realization may separate them strongly or not at all, and that choice is outside KAAL.

ROWING is not that topology. It is the durable discipline between realized Work and its review, and it must stay workable if the process around it later gains other roles; the three roles explain how Changing KAAL currently uses it.

Review is anchored to the fixed Intent, and to Requirements, Architecture, the realized Work and its evidence. A Reviewer does not redesign the system, expand the Change or put a generalized preferred solution in place of the Change that was intended. Broader consequences are retrospective evidence or future Changes.

A review result (does the observed Work satisfy the Change, or what must be resolved) and a reviewer retrospective (what the Reviewer learned by reviewing) are different artifacts and stay so. Findings are actionable work. Review may iterate until it converges; only then does the Change move to its retrospectives and closure.

## The outer loop

```
Intent → [ Work ⇄ Review → sealed Work ] → Owner's judgment against the Intent
```

The Owner gives the Intent; Worker and Reviewer row against that target; once the Work is sealed the Owner judges whether it answers the Intent. The Intent is the fixed target of the Change. Review judges the realization against the Intent: it does not challenge, redesign or renegotiate it. Neither the Worker nor the Reviewer changes the Intent, and the Owner does not enter the inner loop to revise it. A review may establish that the Intent cannot be delivered as stated; then the Change cannot converge as a successful realization, and it is not resolved by editing the Intent inside the same Change. What the Owner does with an undeliverable or unsuccessful result, including establishing a different Intent in another Change, is outside the Change. The Change realizes the target; it does not negotiate the target.

## ROWING and WORK

Two disciplines divide the lifecycle at the Work seal. **ROWING** governs the mutable inner loop: `Work ⇄ Review → convergence → seal Work`. **WORK** governs retrospective learning after the Work is fixed:

```
W  Worker      retro-work.md, first: the inside experience of performing the sealed Work
O  Owner       judges the sealed Work against the fixed Intent (no artifact, no approval metadata), then retro-owner.md
R  Reviewer    retro-review.md, last, with the earlier perspectives available
K  Knowledge   the accumulated result; then the Change can be sealed
```

The three retrospectives are not interchangeable and their order is meaningful, because knowledge accumulates: a later one may read the earlier ones. The Owner's retrospective is written after the judgment, so it carries no approval or verdict; it is deliberately shaped by the Owner's position, what the Work as it stands taught the Owner about the product and the Intent. That may inform a future Intent and cannot revise this Change's. Host admission mechanics, such as accounts, approvals and checks, stay entirely outside KAAL; the Owner's process judgment is distinct from whatever a host uses to authorize or admit the closed Change.

## Not wanted

- Roles, Owners, Workers or Reviewers as Nodes, unless the need is independently shown.
- A workflow engine, a ticket system, status files, or phase metadata. State is derived.
- Any provider, tool, host or hosting concept in what KAAL says. A host may observe KAAL's derived state and map it onto its own mechanisms; KAAL does not know it.
- A change to Core, or to any sealed Change, Node or seal.

## Done when

ROWING is a sealed vocabulary of Changing KAAL's capability; the Change process includes review rounds, derived convergence and three retrospectives in the order of WORK (the Worker's, the Owner's and the Reviewer's); the evaluator derives state from those artifacts; historical Changes remain valid exactly as sealed; and this Change has itself been through ROWING.
