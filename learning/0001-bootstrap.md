# 0001 — Bootstrap

2026-09-19. Cycle run by an agent (Claude), on the branch
`claude/orders-next-message-26nkhk`, from the bootstrap briefing that is now
`ORDERS.md`.

## Plan

The repository held one commit and a six-byte README. The intent was to
establish the smallest substrate in which the five orders can actually operate,
and nothing beyond it.

Four things had to exist, each because an order requires it and would otherwise
have nowhere to live once this conversation ended:

`ORDERS.md`, because the orders are the origin record and everything else has
to be traceable to them. `AGENTS.md`, because BASS level two is exactly the
control that keeps guidance from evaporating with the session, and the briefing
is guidance that must survive. `learning/`, because PDCA's Act step requires
that what was learned be preserved, which requires a place. A working
convention for the integration boundary, because MOVE requires candidate change
to cross an observable one, and an unwritten convention is not observable.

Refusal conditions set before starting: refuse to add any mechanism that could
not be traced to a specific order — no findings schema, no bug ledger, no
roadmap grammar, no evidence format, no review ceremony, no CI or release
machinery. Refuse to write a template for the learning records. Refuse to add
skills or scripts, since BASS says to ask for the least-rightward control
strong enough for what has been learned, and at bootstrap nothing has been
learned yet. Refuse to reconstruct anything from the previous KAAL from memory
of what such a system usually contains.

## Do

Written: `ORDERS.md` (the briefing preserved), `AGENTS.md` (the operating
guidance, deliberately short), `learning/README.md` (what belongs here and why
it has no format), this record, and a README pointing at them.

Not written, and deliberately: no CI workflow, no test harness, no skill, no
script, no issue or finding format, no roadmap, no release process, no
directory structure beyond `learning/`.

One thing was added that the briefing did not name: the pull request as the
concrete form of MOVE's "observable integration boundary". MOVE requires the
boundary; it does not say what it is. Naming it as the pull request is a
judgement, made because the alternative — leaving it unnamed — would have made
the requirement unobservable in practice. It is the weakest form of the
boundary that is still observable, and it is recorded here as a choice so a
later cycle can overturn it cheaply.

## Check

Every claim in this cycle is **Judged → Validated**, by the agent that did the
work. No program ran. There is no test in this repository, so there is nothing
that could have been Verified, and the distinction between the two kinds of
evidence has so far been asserted rather than exercised. That is the plainest
statement of where the bootstrap currently stands.

What the evidence supports: the files exist, are internally consistent, and
each traces to a named order. What it does not support: any claim that this
substrate is sufficient, that the orders are complete, or that an agent reading
`AGENTS.md` cold will actually behave as it describes. None of that has been
tested, and the first of those is expected to be falsified rather than
confirmed.

## Act — what this cycle leaves for the next

Three things are known to be missing and are deliberately left missing until a
failure earns them.

The integration boundary has no program on it. Nothing prevents a change from
crossing into `main` unexamined, and nothing computes anything about what
crossed. The first change that should have been stopped and was not is what
earns the gate, and it will also say what the gate should compute — which is
better information than guessing now.

Tested → Verified is currently vocabulary with nothing behind it. It becomes
real the first time there is something in this repository a program can
execute. Until then every record here will honestly say Judged, and if that
stays true for many cycles, that itself is the finding: a learning system whose
every claim is a judgement has not yet met anything that could contradict it.

Embed and External have not been exercised at all. EEE says not to wait for the
engine to look finished, and this cycle waited — there was nothing yet to
separate from its engineering context. The next cycle should not have that
excuse, and if it does, the reason belongs in its record.

One open tension, recorded rather than resolved: the briefing says to let
failures earn mechanisms, and simultaneously hands down five orders and their
vocabulary up front. That is a substantial inherited structure standing on the
same ground it tells everything else to earn. It is probably the right trade —
something has to be assumed for anything to be learnable — but it means the
orders are the least tested part of this system while being the most load
bearing. A later cycle that finds an order unable to perceive a failure should
say so directly here, and should expect that to be an ordinary outcome rather
than a crisis.
