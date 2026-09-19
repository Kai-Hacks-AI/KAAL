# 0019 — KAAL reads khai-cultures

2026-09-19. Cycle run by an agent (Claude) on `external/khai-cultures`, branched
from accepted `main` at `9fdb124`. External in the outward direction, on the
Human's instruction: *use KAAL to analyze ChBrain/khai-cultures*.

Read at `ChBrain/khai-cultures` commit `67979c7`, a public repository. Every
claim here about its files can be checked against that commit. Claims about its
pull requests are reads of GitHub state, which is not in any commit and can
change.

Written under `skills/learning/SKILL.md`.

## Refusal conditions, and when they were set

The same as `0014`'s, carried forward. No proposals for khai-cultures. No scoring
it in KAAL's vocabulary. Check the producer against the four errors `0013`
catalogued. One addition came from `0015`: go past self-description and contract
surfaces, in whatever form the encounter allows.

These were settled after reading KAAL's corpus and before reading anything in
khai-cultures. They were not written down until this record, so the only
evidence that they came first is the producer's word.

## This encounter could not test the attention finding

`0015` records that `0014`, under an open prompt, went to governance and stayed
there. It says a repeat would be worth more than any guess about what the first
instance means.

This cycle is not that repeat, in either direction. It read `0015` first, so its
attention was steered. The first two files it opened in khai-cultures were
still `CLAUDE.md` and `AGENTS.md`, the contract. It then left them because
`0015` said to, not because of anything khai-cultures showed. A steered reader
choosing content is no evidence about what an unsteered one would do.

## What was done

**Read.** About twenty of 9,026 files. They were `CLAUDE.md` and the first 140
lines of `AGENTS.md`, and six files of the Switzerland culture: the play, the
Rütli plot, the Vreni persona, the neutrality position, plot 99 and
`REFERENCES.md`. Two management orders were read in full, `order_the_passport.md`
and `order_voice_from_inside.md`. So were the header comments of eight check
scripts and two Ticino plots. The rest of `AGENTS.md`, the other 318 cultures,
the tongues package and the workflows beyond one were not read.

**Ran.** The first install failed. The house's `@chbrain` packages come from
GitHub Packages through a `GITHUB_TOKEN` the shell did not have, and the registry
answered 401. The next attempt ran the checks that looked standalone, because
they import nothing from `@chbrain` directly. Every one of them imports it
indirectly, through `tests/culture_sources.mjs`. The grep had established direct
imports only. The install succeeded once the GitHub CLI's credential was passed
in the variable the house's `.npmrc` expects. After that the house's own programs
ran here: seven report scripts across the whole house, the vitest suite, and
`khai-tests gates`. The environment was Windows 11, node 24.13.1 and npm 11.8.0.

**Queried.** The last 200 merged pull requests, through the GitHub API, for
author, merger, review decision, checks and the audit lane's comments.

## What the programs computed

**Tested → Verified**, each for exactly what it computes, at `67979c7`, on the
machine above.

The report scripts count the house's own debt, and it is large. 767 Company
entries that no plot fields, spread across 201 of 319 cultures. 217 of 319
cultures lack a plot 0 or a plot 99. 22 of 255 dated plot lines are out of
order. 47 sub-national cultures carry a non-conforming id. 10 of 21 groups owe
findings. 11 files are flat of their language's diacritics. The checks are
ratchets. Each gates only the cultures a pull request touches, so untouched debt
passes. `company_coverage.mjs` says so in its header, and
`order_the_passport.md` refuses sweeps. The one flag checked against
content held: Ticino's plot 05 is dated 1900 and its plot 06 is dated 1882.

The suite passed 416 of 420 tests and failed 4 here. GitHub reports CI green on
the same commit. All four failures carry Windows paths where the assertions
expect `/`. That cause is the producer's reading of the messages, not something
the suite computed.

One of the four matters to this record. The canon scan fails on exactly two
files, `de/position_language_de_ch.md` and `de/position_language_de_li.md`, each
with `unknown frontmatter key: mother_tongue`. Those are the two files in the
correction discussed below. The filter the Human added in PR #689 to excuse that
finding appends a literal `/` to a prefix built by `path.join`. On Windows,
`path.join` produces backslashes, so the prefix cannot match. That comes from
reading `tests/tongues_standalone.mjs:51` and `tests/house.test.mjs`, not from a
program.

`khai-tests gates` passed 6 of 16 and failed 10. All ten failures print the same
error: git was handed the literal string `$(git merge-base origin/main HEAD)`.
The shell substitution was never expanded on this machine. So the ten failures
say nothing about the content, which is again the producer's reading of the
output.

Two lines of that run belong in this record. Among the six that passed,
`branch-scope` reported `ok` with the note "count not found in the output": a
green line on a check that found nothing to count. And the runner closed by
stating what it had not run and why, then printed: "10 gate(s) failed. Do not
report this as passing." That is a program saying what it does not establish,
the discipline `AGENTS.md` asks of the Agent, written into the tool.

## What was observed, and what KAAL learned from it

These are observations of khai-cultures, recorded for what they show KAAL. They
are adopted nowhere.

### An absence that was visible and still crossed

In the files read, the house asks for independence in one place. That is not a
claim about the files not read. It is an advisory audit lane that sends each touched plot line to "a reader that is not the author" with a
single narrow question. In the words of the order that created it, *"an author
auditing its own plot line reproduces the failure rather than finding it"*. That
is the same premise `AGENTS.md` names as this repository's judgement under *Who
may validate*.

Observed on GitHub, and counted by a program over that read. In the last 200
merged pull requests, 67 carry the audit comment, from #553 to #684. All 67 say
no reader answered: two say "No second reader is wired", and 65 say "The second
reader could not be reached". Their `audit` check is green, which the workflow
intends, since it "never costs a red build". Every one of them crossed. That holds by
construction, since only merged PRs were queried, and whether any unmerged PR
carried the same comment was not counted. The four PRs
sampled for reviews had none, and in the last 40 the author and the merger were
the same account everywhere except the dependency bumps.

An earlier count this cycle said two of the 67 had been answered. The jq
expression matched one wording and read the other wording as success. The
difference was noticed only when those two comments were opened. That is the
second instrument this cycle that established less than it seemed to.

What this bears on in KAAL. `0016` says overclaiming is caught *because it is
visible*, and that under-building is not caught *because nothing appears*. Here
an absence appeared, stated plainly, on 67 crossings, and nothing acted on it.
The reason is not observable here. The design may accept it on purpose. So
visibility did not catch anything by itself. In KAAL, what caught the overclaims
was visibility together with a review the producer could not skip. `0016`'s
sentence credits the half that is not sufficient alone.

That qualifies a *why*-sentence, the family `AGENTS.md` says is this repository's
weakest. No note is appended to `0016`, because one observation of another
system does not supersede a claim about this one. Whether it should be appended
is a judgement for whoever reviews this record.

### The house measured its candidate checks before it refused them

`order_the_passport.md` refuses to build a counter for its failure. It measured
two candidates first, against all 322 plots, and recorded both failing: one
passed the worst known case and the other was inverted. It also found that its
existing "tell" measures agreement between a play's self-description and its
scenes. So it cannot see a play where both halves are wrong, and it passed all
three known-bad cultures honestly.

Two things in KAAL match this. First, KAAL's learning skill is applied by the
producer to the producer's own record, which measures the record against the
producer's account. The skill already says so under *Limitations*. What
khai-cultures adds is that it tested its self-referential check against known
failures, and KAAL has never done that. The recorded findings in `0013`, `0015`
and `0017` are a set of known failures, and nothing has been measured against
them.

Second, `0016` found that KAAL refused scripts for eleven cycles without
measuring whether any part was computable. The skill now lists five candidate
checks and defers the Script rung to "if this rung fails". Here a neighbour
answered the same kind of question by measuring before deciding, and recorded
the failure.

The stopping condition applies: a neighbour holding a practice is not the failure
that earns it. It is recorded as an observation.

### A measurement that did not reach forward

In PR #688 the producer corrected its own merged claim in a comment: *"I measured
zero while `mother_tongue: false` was temporarily deleted, then restored the key
… and did not re-measure."* That is the shape of `0009`, a judgement attached to
a body that then changed, arising in a measurement, in another producer, under
other controls. The substance of the correction lives in a PR comment. The
Human's follow-up in #689 put the *handling* into a test file, not the fact that
the count had been wrong.

One instance elsewhere. It shows the shape is not peculiar to this repository's
validations, and nothing more.

### KAAL's reading rule does not transfer

Reading the Rütli plot alone, the producer began to judge that the house stages a
legend as history. The caveat sits in a sibling file. Switzerland's
`REFERENCES.md` says Tell and the Rütli oath "are foundational legend rather than
documented history". The file describes itself as "the provenance behind this
culture". One commit in the house's log, `141cf3a`, moves a caveat into
provenance by name. That is one instance, not an established convention.

That is the sampling hazard of `0011`, in the outward direction. The producer
caught it before the judgement reached this record. `learning/README.md` guards
against it with a rule: read to the end of a record, because the end is where
its standing is corrected. That rule depends on KAAL's convention. In a corpus
that puts a correction in a different file, reading to the end of the file finds
nothing. The rule is a property of this corpus and not a general
reading discipline, and nothing here said so.

## BASS decisions

Recorded because a decision to stay leaves no other trace.

**The learning skill: stay.** No failure of the skill was observed. The two
instrument misreads and the near-misjudgement were caught before they reached
the record, at the step that asks what a result does not establish. That is the
producer's report on its own use, one cycle, and weak. Asked a second time
whether anything is owed: the known-failure set above is a real, untested
opportunity. Measuring against it is a decision about the Script rung, and that
rung is not owed by a failure seen here. The opportunity is recorded, not taken.

**External as a practice: stay at Bare.** This is the third External contact.
Human correction of External records has happened once, in `0015`. That is not
repetition, and nothing yet suggests a procedure would have prevented what went
wrong.

**The instrument misreads: stay, and the reason was asked twice.** The first
draft of this decision said a further instance "would make three". It already
makes three. `0018`'s first draft credited the validator with catching what it
only printed. This cycle's grep established direct imports only. Its jq
expression read one wording as success. That draft sentence was itself a
miscount of the kind it described, and it is kept here as evidence.

With three instances, staying needs a reason. The reason: HAPTIC moves *repeated
Human correction* into Agent capability, and none of the three needed one. The
producer caught each before it reached an accepted record, at the step the skill
already has. That holds only while the producer keeps catching them. If one
reaches a review or crosses into `main`, the part that can be computed should go
into the skill's procedure. That part is recording each check's exact expression
beside its result, so a reader can see what it matched.

## Check

Judged by the producer, awaiting independent judgement, apart from what the
programs computed.

This is the first External where the producer ran the observed system's own
programs, and the first where its claims about an outside party mostly rest on
public, commit-addressed text rather than paraphrase. The PR comments are the
exception. They are GitHub state: they can be read by PR number, but they are
not in any commit and can be edited.

Anyone can check the counts by rerunning the house's scripts at `67979c7`. They
can check the audit tally by listing the comments on the PRs named, and the
Rütli caveat and the order quoted above in the files named.

No program of KAAL's ran. KAAL still computes nothing about its own content
beyond the validator in `0018`.

## Act — what this cycle leaves for the next

`0015` asked for External to go past self-description, in whatever form. This
cycle did that by running the observed system and reading its behaviour on
GitHub, not just its contract. What it produced that the earlier contacts could
not was the audit lane: a documented control against an observed absence, with
every signal green. A contract read alone would have reported the design as
present.

The *why* in `0016` about what catches overclaiming stands qualified here and not
in its own file. That decision is for the reviewer.

The known-failure set is untested. Measuring a candidate check against it is
possible with no new machinery, and it is how a neighbour answered the question
this repository's skill leaves open.
