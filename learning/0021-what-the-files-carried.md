# 0021 — What the files carried, and what they did not

2026-09-19. Cycle run by an agent (Claude) on `external/khai-cultures`, which is
PR #5's branch. This cycle harvests two records written by other sessions —
`0019` and `0020` — and reports the experiment they were arms of. It did not
produce them, and it changed nothing in them but one ordinal.

Written under `skills/learning/SKILL.md`.

## What was run

Eight analyses of `ChBrain/khai-cultures` at `67979c7`, on the Human's
instruction *use KAAL to analyze ChBrain/khai-cultures*:

- **Claude with KAAL bound as project instructions**, twice. Those runs are
  `0019` and `0020` in this candidate, written by their own producers.
- **Claude with no KAAL.**
- **Codex with KAAL fetched**, in a session with no prior context.
- **Codex with KAAL fetched**, in a session that had already analysed the subject.
- **Perplexity with KAAL fetched.**
- **Perplexity with the KAAL files pasted**, no framing.
- **Perplexity with the KAAL files pasted**, told it was operating *under* KAAL.
- **Perplexity with no KAAL.**

Two further runs are void and are recorded as such: one Codex and one Perplexity
read `ChBrain/KAAL`, a different repository, rather than the one named.

## What the arms established

**Naming a repository does not establish which files loaded, and the
substitution is invisible.** The void Perplexity run attributed `agents/`,
`evals/`, `waivers/`, `retros/`, `plan/` and `kaal.config.json` to KAAL. Every
one is absent from `main` and present in the other repository. Its analysis was
confident, well-structured and factually accurate about the subject. Nothing in
the text signalled it; only diffing the claim against the file listing did.

**For Claude, the care is native.** The arm with no KAAL ran the house's own
instruments, invented one of its own — hashing every prose line over eighty
characters across 6,967 content files, to test whether the corpus was written or
templated — stated its own limits unprompted, carried a methodology note about
running on npm 10 with `engine-strict` off, refused to prescribe, and closed with
a question to the owner rather than a backlog.

**What KAAL added for that model is narrower than this repository assumed.**
Against the two bound arms, the difference is standing vocabulary, refusal
conditions set before reading, a recorded BASS decision including a decision to
*stay*, an explicit refusal to adopt from the subject, and a record committed to
a repository rather than terminal output. Legibility, attribution and durability
— not care.

**For an engine without that discipline, the files supplied it, and the
delivery mattered.** Three Perplexity arms separate two effects. Fetched and
unguided, it produced an agent-lanes table, a seven-item backlog and an
exception-ledger schema for someone else's repository. With the same files
pasted and no framing, the evidence discipline appeared — standing marked, an
establishes/does-not-establish split, and the observation that a merged pull
request demonstrates a merge event and not an independent judgement — and it
still ended in recommendations. With the files pasted *and* the mode named, it
produced a BASS decision refusing to propose machinery.

So the files carry the evidence discipline; the mode framing carries the
ownership boundary. The line *observing something external does not make it
KAAL's to own* is in `AGENTS.md` in every one of those arms. It binds only when
the agent is told it is working under KAAL rather than with it — because absent
that, holding a governance framework while being asked to analyse something
reads as an invitation to apply it.

**The value of the scaffolding is inversely proportional to the model's own
discipline.** That is the clearest reading across the set, and it is a judgement
over eight runs with one run per condition.

## The cost, stated plainly

The arm with no KAAL produced the best analysis of the subject in the set: a
release jammed three weeks behind what it reads as an expired token, with the
reasoning shown and the confirmation explicitly not available; the tongue queue
identified as the throughput governor, with the date the queue stopped matching
the date the entry price rose; and a drift between what `khai-cultures`'
`AGENTS.md` says about its own gates and what its CI runs.

The bound arms spent effort on standing sections and found less about the
subject. A discipline that makes claims legible also costs the attention that
would have produced more of them. Nothing here says that trade is wrong; it says
it is real and was not previously measured.

## What was verified before harvesting

The Human's instruction was to harvest `0019` and `0020` only if their claims
could be shown correct. What this cycle could check, it checked.

**Tested → Verified**, and no further than this: the subject clone is at
`67979c7`, the commit both records name. `packages/` holds 119 migrated culture
packages, the figure `0020` reports exactly. `management/orders/order_a_plot_line_runs_forwards.md`
says "23 of 255 units" and "twenty-three plot lines renumbered in an afternoon to
clear a counter would be twenty-three lines nobody read", both verbatim.
`tests/plot_line_audit.mjs --culture denmark` emits a prompt addressed to a
second reader rather than a count, which is the structure `0019`'s finding about
unanswered audits depends on. And the presence check `0020` builds a BASS
decision on was reimplemented here independently: 25 markdown files on `main`,
3 findings, all 3 false positives — `CLAUDE.md` and `PERPLEXITY.md` named in
prose in `0014`, `SKILL.md` in `0016`. Different code, same result.

**Not verified here, for want of access rather than doubt:** the house-wide
counts both records report — 22 plot lines out of order, 767 unused cast
entries, 217 cultures missing a bracket, 47 region ids, 416 of 420 tests — come
from instruments that need the private `@chbrain` packages, which return 401
without a token in this environment. And `0019`'s count of 67 audit comments
across 200 merged pull requests is a read of GitHub state on a repository this
session's tools are not scoped to.

Those numbers cross as their producers' claims, on their producers' standing,
and this record says so rather than borrowing confidence from the checks that
did pass.

## The collision, and what it is evidence of

Both records were numbered `0019`. Two sessions read `main`, saw `0018` as the
last accepted record, and took the next number, eight minutes apart. Neither
could have seen the other.

That is not an error by either. The numbering is a function of accepted state,
so two producers reading the same accepted state necessarily collide, and
`learning/README.md`'s *one file per cycle, numbered in order* was written when
one producer was the only case. It is the first structural failure this
repository has had that no amount of care by a producer could prevent, which is
a different kind from the eighteen before it.

The resolution comes from MOVE rather than from this cycle: nothing is accepted
until it crosses, so a number is claimed at crossing and not at writing.
`0019` keeps its number because it is the record already on this branch; `0020`
was renumbered here, by this producer, with its body untouched. That penalises
the session that finished first, and is still right, because under the orders
writing earns nothing.

`learning/README.md` now says so. That is a clarification of an existing rule
under a condition it did not anticipate, not a new mechanism.

## Check

Judged by the producer, awaiting independent judgement, apart from the
verification results above and within the limits stated there.

Two predictions in this experiment were made before the runs and both were
wrong in the same direction. Before the control arm: *without KAAL it produces a
competent analysis that ends in recommendations*. It did not — it refused to
prescribe. Before the guided Perplexity arm: *partial, it will still finish with
recommendations*. It did not. Both errors overestimated the files and
underestimated the model. That is a bias with a sign, and it belongs in the
record because the producer is the party least able to correct for it.

No program of KAAL's ran. The checks above ran the subject's programs and one
reimplementation written here.

## HAPTIC

Reading what eight arms produced stays with human judgement: whether an analysis
overreached, whether restraint was discipline or ignorance, whether one run per
condition means anything. None of it is computable and this cycle produced
nothing suggesting otherwise.

One thing was computed and is worth keeping computed: whether a path this
repository names exists in it. It returns three false positives on the current
corpus, as `0020` found and as this cycle independently confirmed, so it remains
below the threshold where a Program would help.

## BASS

**One move, and one stay, both recorded.**

*Move:* `AGENTS.md` gains a paragraph on being used rather than worked in. The
evidence is the three Perplexity arms — the ownership line present and not
binding in two of them, binding in the one where the mode was named — plus the
same drift in milder form from Codex, which offered a "KAAL integration delta"
for the subject. This is the least-rightward control that addresses it: the file
that scopes itself to *working in KAAL* now says what to do when KAAL is the
instrument. **Human-supplied context, cycle 0021** — the Human named this
direction, and this repository's rendering of it is its own.

One run per condition. If a later contact under the new paragraph prescribes
anyway, the paragraph is not the fix and something quieter is wrong.

*Stay:* the learning skill. No failure of it occurred in this cycle, the script
candidate nearest to hand is wrong every time it fires, and `0020` reached the
same decision independently on measured grounds. Recorded because a decision to
stay leaves no other trace.

## Act — what this cycle leaves for the next

`0019` names a gap this cycle did not close: khai-cultures measured two counters
against all 322 plots before refusing to build them, and **KAAL has never tested
its learning skill against the failures it has already recorded.** Twenty
findings sit in `learning/` as a corpus that has never been used as one. That is
available now, needs no new contact, and would be the first evidence about the
skill that is not a self-report.

`0019` also found that the navigation invariant from `0012` does not carry: it
nearly misjudged a plot because the caveat lived in a separate references file,
where *read to the end of the record* would never reach. That is a limit on a
rule this repository accepted, found from outside, and nothing here addresses it.

And the experiment has one arm nobody has run: KAAL handed to Claude as a
subject rather than bound as project instructions. Engine and delivery moved
together across the whole set, so that one separates them.
