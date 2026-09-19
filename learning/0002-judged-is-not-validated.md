# 0002 — Judged is not Validated

2026-09-19. Cycle run by an agent (Claude) on `claude/orders-next-message-26nkhk`,
in response to kaihacksai's review of PR #1 at `949a609`, which requested
changes and withheld authorization for that PR to become accepted `main`
experience.

This is the first failure the bootstrap actually hit, and the first judgement
of KAAL made by someone other than its producer.

## The failure

`learning/0001-bootstrap.md` declared every claim in its cycle
"Judged → Validated, by the agent that did the work." The same agent authored
the change, authored the record, and then declared the cycle validated. The
review pointed out that nothing in the bootstrap establishes that authoring a
judgement is sufficient to validate it, while MOVE's chosen boundary is
justified specifically because it is where someone other than the author sees
what crossed.

Underneath the mislabel sat a real gap. MOVE supplies two evidence kinds and an
arrow for each, but never says what performs the arrow or who may. The
bootstrap then used "Judged" as both the kind of evidence and the completed
disposition. Both readings are available in the text, and the producer
naturally took the one that flattered its own output.

Worth noting where the failure came from: not from a missing mechanism, but
from an ambiguity in the vocabulary the orders themselves supplied. The review
needed nothing but the repository's own words to expose it. So the orders could
perceive this failure but could not resolve it unaided — which, under the
bootstrap's own terms, is exactly the kind of evidence it asked to be given.

## Plan

Answer the ambiguity from the bootstrap's existing vocabulary, and change
nothing else.

Refusal conditions set before starting: refuse to add CI, branch protection,
approval machinery, a findings schema, a review ceremony, a skill or a script —
the review explicitly permitted record and guidance only, and none of those has
been earned. Refuse to rewrite 0001's Plan, Do or Check, which would make the
producer's original judgements look independently validated from the start and
destroy the finding. Refuse to resolve the question by asserting a rule; derive
it, or report that it cannot be derived.

## Do

The derivation that settled it: a test is separable from whoever ran it, and a
judgement is not separable from whoever made it. That asymmetry is already
implied by MOVE's two arrows, and it decides the question. A producer may run
their own test, because the program computes the same result regardless; a
producer cannot validate their own judgement, because the judgement carries
them. So producing a judgement is necessary and does not complete it.

Written: a *Who may validate* section in `AGENTS.md` naming the two states a
claim can stand in — Judged and awaiting independent judgement, or Judged →
Validated by a named other judge — and saying plainly that the integration
boundary is where that operation happens, which is what the boundary is for. A
sharpening of the Tested paragraph to cover the producer running their own
test, and the judgement hiding inside whether a test tests the right thing.

An amendment appended to `learning/0001-bootstrap.md`, leaving its body
untouched and stating what the standing of its claims actually was.
`learning/README.md` gained one sentence permitting exactly that narrow move,
since the first case for it has now occurred.

Not written: nothing else.

## Check

Every claim in this cycle is **Judged by the producer and awaiting independent
judgement**. The reviewer who found the original error has not yet judged the
correction, and by the semantics this cycle introduces, the producer cannot
supply that.

That sentence is the first real exercise of the new distinction, and the
cheapest available test of whether it is usable: the first thing it does is
forbid this record from calling itself validated. It held.

Still no program ran. Tested → Verified remains vocabulary with nothing behind
it, unchanged from cycle 0001.

## Act — what this cycle leaves for the next

Read through HAPTIC, this correction stayed where it belongs. The judgement was
Human and remains Human; what moved was a single repeated correction into
persisted Agent guidance, which is `AGENTS.md` doing the job BASS assigns it.
Nothing moved toward Program, because nothing here is computable: who may judge
what is a question about meaning, not a predicate. If producers keep
self-declaring validation despite the guidance now existing, that repetition is
what would earn something further right on the ladder. One occurrence does not.

What remains uncontrolled: nothing computes who judged what. A claim's standing
is only as accurate as the prose of the record asserting it, and this cycle's
failure was precisely a record asserting its standing wrongly. That is tolerable
while there is one producer and one reviewer who reads carefully. It will not be
tolerable if either number grows. The failure that earns a mechanism there would
look like a claim whose standing was misread because nobody could tell who had
judged it — and when that happens, the mechanism should be the smallest thing
that makes the judge and the judged legible, not a findings schema.

An open question this cycle did not settle: whether a judge can be an Agent
rather than a Human. MOVE says either may judge, and the semantics here only
requires that the judge not be the producer. Whether an independent Agent
judging another Agent's output actually supplies what this boundary needs, or
merely looks like it does, has not been tested and should not be assumed in
either direction.

Embed and External are still unexercised. Cycle 0001 left that as the next
cycle's obligation; this cycle was consumed by a review it could not defer, so
it now stands as 0003's, with the excuse used up.
