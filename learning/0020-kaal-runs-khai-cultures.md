# 0020 — KAAL runs khai-cultures

2026-09-19. Cycle run by an agent (Claude) on `claude/festive-hopper-5pf6fq`,
restarted from accepted `main` at `9fdb124`. External in the outward direction,
on the Human's instruction: *Use KAAL to analyze ChBrain/khai-cultures*. The
second outward contact; the first was `0014`, on `ChBrain/khai`.

Read and run at `ChBrain/khai-cultures` commit `67979c7`, a public repository, so
every claim here about it can be checked by anyone against that commit.

## Refusal conditions, set before reading

Written to a scratch file outside this repository before any content was opened,
because `AGENTS.md` asks for the refusal conditions while they still cost
nothing, and restated here in full because that file does not survive the
session and this one does.

No proposals for khai-cultures, and no scoring of it against KAAL's vocabulary:
a system that does not use these words is not failing to. Guard against the four
errors `0013` catalogued in KAAL's own observers — inverting a self-describing
file, proposing machinery the subject refuses, reading titles for content,
guessing a remedy from one encounter. Take `0015`'s narrowed Act seriously and go
past self-description and contract surfaces; if a program can be run, run one and
report exactly what it computes. Do not claim a result for `0015`'s attention
finding, because that test is spoiled here — see below. Stop rather than conclude
if the only support left is a sentence of the form *this is sufficient because*.
Amend rather than add if the cycle teaches nothing `0014` or `0015` already say.

The stated back-out: if the content turned out to be unreachable and the
encounter collapsed onto contract surfaces again, say so plainly rather than
dress a second governance read as a content read. It did not collapse, and the
partial version of that failure is recorded below anyway.

## The first External in which a program ran

`0014` admitted its own limit in one line: *this cycle read khai's contract, not
khai*, and no command of khai's was run. Both directions of External had tested
documents rather than systems. This cycle ran khai-cultures' own gate scripts.

**Tested → Verified**, with the instrument stated before the results, because the
instrument is not the house's own:

- `npm ci --ignore-scripts --engine-strict=false`. The house declares
  `"engines": {"npm": ">=11"}` and sets `engine-strict=true` in `.npmrc`; this
  environment has npm 10.9.7, and a plain `npm ci` refuses. The install happened
  only because the producer overrode a constraint the house declares for itself,
  and `--ignore-scripts` skipped its husky hooks. What ran below is therefore
  *not* khai-cultures' configuration, and a reader reproducing it must carry the
  same two overrides. The `@chbrain/*` dependencies resolved anonymously from
  `npm.pkg.github.com`; no token was supplied.
- The scripts were run bare, in their report mode, not in the
  `--gate --base <sha> --head <sha>` mode the gates invoke. These are different
  programs on the same file.

What the runs printed at `67979c7`:

- `node tests/plot_sequence.mjs` — `plot lines out of order: 22 of 255 with dated
  plots`, naming all 22.
- `node tests/diacritic_conformance.mjs` — `flat files: 11 in 3 language(s)`.
- `node tests/link_resolution.mjs` — `links: 0 unit(s) owing, 0 finding(s)`.
- `node tests/staging.mjs` — `staging: 0 finding(s)`.
- `plot_zero`, `persona_wiring`, `culture_conformance`, `group_coverage`,
  `company_coverage` — no output, exit 0.

**What that last line does not establish, stated because it is the whole point.**
Exit 0 with no output is not *passed*. Those five scripts are modules whose gate
is behind `--gate`; run bare they printed nothing because that mode had nothing
to print. Reading those five as green would be exactly the move KAAL's evidence
rule forbids — the program computed almost nothing and a naive reader collects
five passes from it.

## The number in the file and the number the program returns

`management/orders/order_a_plot_line_runs_forwards.md` states, in a table and
again in prose: *23 of 255 units with dated plots run backwards somewhere*, and
names `es_canary_islands` as the case the wall was written for — a line running
1496 then 1492.

The program at `67979c7` answers 22, and `es-canary-islands` is not among them.

Neither number is wrong. The file records what was measured when the order was
written; the program is the live answer, and one case was repaired in between.
Both live in the same repository and either can be checked by anyone. This is the
sharpest thing this cycle saw, and it is about carriage rather than about counts:
a house can write a number into a file *and* keep the program that re-derives it,
and then the file is a dated claim rather than the authority.

KAAL holds a constraint next to this — **files know; Engines carry and enforce**,
Human-supplied, cycle 0008 — which was argued out over whether commit topology or
a file is the store. khai-cultures is not an answer to that question and is not
treated as one here: it does not have KAAL's problem, because for the part that is
arithmetic it keeps both the claim and the means to recompute it. Nothing is
adopted. What KAAL gets is a distinction it had not drawn: a number in a file and
a number a program returns are not two copies of one fact, and which one a later
reader should believe depends on whether the program still exists to be run.

## What KAAL observed, attributed and adopted nowhere

**A green house with counted, named, unfixed defects.** The same order says it
plainly: *Twenty-three units are out of order today and the house is green,
because the ratchet fires on what a pull request opens*, and gives the reason —
*twenty-three plot lines renumbered in an afternoon to clear a counter would be
twenty-three lines nobody read*, and some would be renumbered the wrong way,
because in several the open question is whether the date is wrong rather than the
number. The gate does not demand a clean house; it demands that what a change
touches improves. The backlog is not hidden from the gate — it is outside what
the gate is for, and the count is printed by the same script in its other mode.

**What a counter may decide, settled in advance and written down.** `0014`
recorded that khai marks, per rule, whether a program or a reviewer enforces it.
khai-cultures goes a step further in the same direction, and the increment is
what is new here: each wall states what it may decide and what it must hand back
to a reading. *Whether 1492 comes after 1496 is arithmetic. This wall holds the
arithmetic and nothing else.* And its exclusions are enumerated — the brackets
`plot_00` and `plot_99` never take part, an undated plot is skipped rather than
failed, two plots may share a year — with a reason for each. Under it sits a rule
protecting the undecidable: *what defines this culture, and does the play stage
it?* is a dialogue, *never a counter's*, and `order_the_defining_question.md`
holds it out of reach of the counters on purpose.

**Failures written into the source of the thing that now prevents them.**
`tests/link_resolution.mjs` opens with the defect it exists for: a link that
pointed at an emptied directory survived two pull requests with twelve walls
green over it, because the group was outside one wall's reach and no wall asked
whether an address resolves at all. It closes that paragraph with a sentence KAAL
has no equivalent for: *It was found by reading, which is not a wall.*
`tests/culture_sources.mjs` carries the same shape — three ratchets that went
quiet rather than red when a path moved, and *a gate that still sees 289 of 290
looks exactly like a gate that sees all of them.*

**PDCA, in a second house, as a different artefact.** `management/management_instructions.md`
stages a debate as a discussion play whose four plots are Plan, Do, Check, Act,
and the Act plot emits a management order. At `67979c7`, `management/discussions/`
holds only `.gitkeep` and `management/orders/` holds fifteen orders. What survives
in the tree is the decision, not the debate that produced it.

KAAL arrived at a similar place from the other side: the Human refused review
transcripts twice and asked instead that the substance survive in the files.
**That is not independent corroboration and must not be read as any.** khai-cultures
is the same Human's other house, under the same owner stamp. Two houses of one
owner agreeing is one person's answer twice, and the last five cycles were spent
learning not to promote that kind of agreement into evidence.

## What KAAL learned about itself

**Two findings died on a second look, and both instruments were the producer's
own.** First: `find management -maxdepth 2 | head -30` truncated, and
`management/management_instructions.md` — a file `AGENTS.md` links in its opening
— appeared to be missing. A full listing shows it present. Second: the local
`origin/main` ref pointed at `806a35f`, a tree holding only `README.md`, which
read as *the KAAL brain has moved to a new estate and has not crossed into its
`main` yet*, and with it a second finding about branch protection not travelling
between repositories. A `git fetch` shows `origin/main` at `9fdb124` and the
GitHub branch listing reports it protected. The ref was stale, not the estate.

Both would have been confident, specific, checkable — and wrong. Neither is the
family the previous eighteen cycles kept hitting, which was semantic: a premise
that did not hold, a *why* that outran its evidence. These are mechanical: an
instrument that was truncated, and an instrument that was stale. The new thing is
that **an absence is only as good as the completeness and freshness of the
listing behind it**, and `head`, `-maxdepth` and an unfetched ref each destroy one
of those silently while returning a confident-looking answer.

They were caught because presence was checked before absence was written down.
That is a habit and not a control, and nothing here establishes it generalises.

**A presence check was computed on KAAL's own corpus, and it is not usable as
written.** The `learning/` skill names five deterministic subchecks as Script
candidates. The nearest of them was run by hand over all 25 tracked markdown
files: every `.md` path they name in backticks or in a markdown link, checked
for existence. Three findings, all three false positives — `CLAUDE.md` and
`PERPLEXITY.md` in `0014`, which are khai's files named in prose, and a bare
`SKILL.md` in `0016`. The corpus's records discuss other repositories' files by
name, so a naive resolver cannot tell a reference from an address. This is a
computed result and not a guess about whether a Script is earned.

**`0015`'s attention test is spoiled and no result is claimed for it.** That
record says if a later open encounter also goes straight to governance, the
repetition is worth more than its guess about what it means. This producer read
`0015` before the encounter, so the naive condition is gone. What can still be
said, and is worse than a spoiled test: the instruction to go past contract
surfaces was *in force and read*, and the attention still went mostly to
governance. One culture package was read in full — Denmark: the play, a plot, a
position, a process, the README and the REFERENCES — and it is the part of this
cycle that produced the fewest lines above. The gates, the guard config, the
orders and the management layer produced the rest. Recorded as one instance under
a live instruction, not as a diagnosis.

**The paraphrase gap changes shape for the first time.** This is the sixth
instance of an outside party's words reaching KAAL only through the producer, and
`0014` already noted the improvement of a public, commit-addressable source. The
new part is that some of this record is not a paraphrase at all: four of the
claims above are the printed output of a named command at a named commit, which a
reader regenerates rather than trusts — provided they carry the two overrides
stated above. The account of what khai-cultures *means* by any of it remains the
producer's, and that part has not improved.

## Check

Judged by the producer, awaiting independent judgement.

**Tested → Verified**, and no further: the four printed results above and the
five silent exits, from the commands named, at `67979c7`, under `npm ci --ignore-scripts --engine-strict=false`
on npm 10.9.7 and Node v22.22.2, in report mode. They establish what those
scripts computed on that tree. They establish nothing about whether the gates do
their job in CI, whether the walls are well made, or whether khai-cultures is
sound. No gate was run in the mode the gates run in.

**Observed of the environment**, which is neither tested nor judged: that
`Kai-Hacks-AI/KAAL`'s `main` is reported protected by GitHub's branch listing.
That is a read of a hosting service's state. It is recorded because it dissolved
a finding, not as a claim about the control's contents — `ORDERS-TO-HUMAN.md` §1
remains the authority on what was confirmed and by whom.

**Judged by the producer**: everything above about what khai-cultures means by
its arrangements, including the reading of the ratchet, of the counter boundary,
and of the discussion-play artefact. Every quotation is checkable at the commit;
every interpretation of one is not.

## HAPTIC

The reading of an external house stays with human judgement: what a wall's
exclusions mean, whether a backlog is restraint or neglect, whether two houses of
one owner agreeing is evidence — none of that is computable, and this cycle
produced nothing suggesting otherwise.

One part is computable and was computed: whether a path this repository names
exists in it. The answer is that the naive form returns three false positives on
the current corpus, so what is understood well enough to compute is narrower than
the check as stated — it would have to separate an address from a mention first,
and nothing here establishes how.

## BASS

**The decision is to stay at Skill for the learning capability, and it is
recorded because a decision to stay leaves no other trace.**

The justification, which `AGENTS.md` requires as much as it would require one for
moving: this cycle's two near-failures were caught before they were written, so
no failure of the skill occurred to reconsider it against. The Script candidate
nearest to them was not refused on the grounds that meaning is not computable —
the eleven-cycle error `0016` records — it was run, and it returned 3 findings
and 3 false positives. Installing it would have added a gate that is wrong every
time it fires on this corpus.

That is a measured reason to stay, valid for this cycle only. It says nothing
about the other four candidates, and if an absence claim of the kind that nearly
happened twice here ever reaches an accepted record, the question reopens with
evidence behind it.

Nothing from khai-cultures is adopted. `0014` named that temptation and refused
it, and it was stronger this time, because this cycle watched the neighbouring
mechanisms actually run.

## Act — what this cycle leaves for the next

External has now gone past self-description in one direction: a program of the
observed house ran. The other direction has not — nothing external has run KAAL,
and there is nothing of KAAL's to run. That asymmetry is now the plainest gap in
EEE as exercised, and this record does not prescribe how to close it.

The attention observation is one instance under a live instruction and wants a
second before it means anything. Whoever runs the next outward contact should
know the naive test cannot be recovered by anyone who has read `0015` or this.

If a later cycle writes an absence claim — a file that is not there, a link that
does not resolve, a control that did not travel — the two dissolved findings above
are the reason to check the instrument's completeness and freshness before the
claim, and the 3-for-3 false-positive result is the reason not to reach for a
script to do it yet.
