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

## What this record first claimed, and why that was wrong

This record's first draft stated the comparisons below as findings, under
assertive headings, with a concluding rule about where scaffolding helps. Review
found that they are this producer's interpretation of eight outputs that are not
in this repository, at one run per condition, with engine, delivery method and
subject-access all varying together. A file-only reader cannot inspect any of
it. Under the provenance discipline of `0012` and `0013` they cannot enter as
durable knowledge, and the first draft did exactly what those cycles forbid.

They are not deleted, because the observations are real and the next cycle
should be able to see what was seen. They are relabelled, confined, and no rule
is derived from them.

## The measurement that replaced a judgement

The first draft's most quotable claim was that the arm with no KAAL produced the
*best analysis*. That is an aesthetic comparison over outputs not in the brain,
and the Human named the better question: not linguistic quality, but how much of
what an arm asserts survives checking.

That is computable, and it was computed. Every countable claim the no-KAAL arm
made about the subject, checked against `67979c7`:

| claim | checked |
|---|---|
| 9,026 files | 9026 |
| 319 cultures | 319 |
| 119 migrated packages | 119 |
| 51 US states | 50 `us_*` in the umbrella, plus Arizona migrated |
| 26 Swiss cantons, 16 German Länder, 19 Spanish regions | 26, 16, 19 |
| 151 tongue varieties | 151 `position_language_*.md` |
| its `AGENTS.md` says eleven gates; config and CI have fifteen | "eleven"; 15; 15 |

Nine of nine held.

Against that, the arm that read the wrong repository asserted eight directories
for KAAL — `agents/`, `evals/`, `waivers/`, `retros/`, `plan/`,
`kaal.config.json`, `DESIGN.md`, `SURFACE.md`. All eight are absent from `main`
and present in the other repository, while that same output's claims about the
subject held, including a registry size of 1.26 MB against an actual 1,257,979
bytes.

So its failure was not fabrication. It was **substitution**: it read something
else and reported it faithfully. Nothing in its text marked the swap, and the
only thing that exposed it was checking a claimed file listing against the real
one. That is a different failure from hallucination as usually meant, and it is
the one this experiment actually demonstrated.

Two of the checks above first came out against the arm, and both times the fault
was this producer's enumeration: counting `khai-cultures-us-*` packages while
fifty US states sit in the umbrella, and counting language directories while a
variety is a file. That is the mechanical family `0020` named — an absence or a
count is only as good as the instrument behind it — now at its third and fourth
instance, both of them here.

## What this producer observed but cannot carry

Everything in this section is the producer's account of outputs that are not in
this repository. One run per condition. Engine, delivery and subject-access
varied together across the set, so no single cause is isolated. None of it is
durable KAAL knowledge, and nothing in `AGENTS.md` or the skill rests on it.

The no-KAAL arm ran the subject's own instruments, wrote one of its own, stated
its limits unprompted and closed with a question rather than a backlog. The two
bound arms did the same and additionally marked standing, set refusal conditions
before reading, recorded a BASS decision including a decision to stay, and
committed a record. Whether that difference is what KAAL adds, or an artefact of
two runs, this cycle cannot say.

Three arms of one engine differed in delivery: KAAL fetched and unguided
produced an operating model for someone else's repository; the same files pasted
produced standing marks and still recommended; the same files pasted with the
mode named produced a refusal to propose machinery. That is the observation
behind this cycle's `AGENTS.md` move. The move itself rests on the Human's
distinction, not on these three runs, and the paragraph says so.

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

This cycle's first draft answered it with *a number is claimed at crossing, not
at writing*. Review showed that is not realisable: filenames exist before review,
two candidates can both be approved carrying the same ordinal, and renumbering
immediately before a crossing changes the body a judge validated, which `0009`
forbids. The collision earned a concurrency problem; it did not establish that
mechanism.

What it did earn, and what `learning/README.md` now says: concurrent producers
must resolve a duplicate ordinal **before the candidate is judged**, so that what
was validated is what crosses, and nothing already accepted is ever renumbered.
Here `0019` kept its number as the record already on this branch and `0020` was
renumbered by this producer with its body untouched — before any judgement of
this candidate, which is why it is admissible.

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

*Move:* `AGENTS.md` gains a paragraph on being used rather than worked in. Its
authority is split in the file and here: **the Human supplied the distinction**
between working in KAAL and using KAAL on a subject, and the contamination
concern behind it; **the rendering is this repository's**, and the three arms
that motivated it are producer-paraphrased observation, not evidence the file
brain carries.

The first draft of that paragraph also said *what the encounter teaches comes
home; nothing goes the other way*. That was wrong and would have disabled the
thing KAAL exists for. Findings about a subject may be exactly what was asked
for, and a concept met outside may come home as an attributed candidate,
scrutinised before it becomes KAAL. The boundary is no unauthorised ownership or
installation, not one-way traffic. Corrected in `AGENTS.md`.

If a later contact under the new paragraph prescribes anyway, the paragraph is
not the fix and something quieter is wrong.

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
