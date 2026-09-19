# 0022 — KAAL is asked what khai should do next

2026-09-19. Cycle run by an agent (Claude) on `claude/intelligent-lamport-a13y4o`,
restarted from accepted `main` at `854e954`. External in the outward direction, on
the Human's instruction: *use KAAL to analyze what is the next step for KHAI*.

Read and run at `ChBrain/khai` commit `2e69490`, a public repository, so every
claim here about it can be checked by anyone against that commit. The clone's
`origin/main` was fetched before anything was read and is at that same commit, so
the tree is the accepted one and not a stale ref — the check `0020` earned.

Written under `skills/learning/SKILL.md`.

## The instruction is a different instruction

`0014`, `0019` and `0020` were told to *analyze* a subject. This one is told to
say what the subject should do **next**. `0014`'s first refusal condition was *no
proposals for khai*, and repeating it here would have refused the thing that was
asked for.

`AGENTS.md` settles that, and it was already settled before this cycle: *findings
and recommendations about the subject may be exactly what was asked for*. The
boundary that remains is no unauthorised ownership or installation — KAAL's
controls are not a design to install in khai. So the refusal conditions changed
shape rather than lapsing: a recommendation is permitted, a recommendation
sourced from KAAL's vocabulary is not, and the back-out was that **if khai's own
record names its next step, report that rather than inventing a rival one.**

That back-out is what the cycle actually did. The recommendation below is khai's
sentence, not this repository's.

## Refusal conditions, set before reading

Written to a scratch file outside this repository before any khai file was
opened, and restated here because that file does not survive the session. No
KAAL machinery proposed for khai; no scoring khai in KAAL's vocabulary; do not
repeat `0014` by reading the contract and stopping; run khai's own programs and
report exactly what they compute; check every instrument's completeness and
freshness before writing an absence or a count, and record each check's
expression beside its result; stop rather than conclude if the only support left
is a sentence of the form *this is sufficient because*; claim no result for
`0015`'s attention test, which is spoiled here.

## What was run, and what it computed

The install needed **no override**. `npm ci` succeeded at exit 0 on Node
v22.22.2 and npm 10.9.7 against khai's declared `"node": ">=22.12.0"`. That is
the plainest difference from `0020`, which could only install khai-cultures by
overriding two constraints that house declares for itself, and it means what
follows ran in khai's own configuration rather than beside it.

**Tested → Verified**, each for exactly what it computes, at `2e69490`:

- `npm test` (`vitest run`): 483 test files passed, 1 skipped; **6511 tests
  passed, 8 skipped**; exit 0.
- `npm run gates`: **10 walls recorded, 0 failed**; exit 0. The runner reported
  `386 engine(s), 2563 member(s)` and one warn, `prune in a governance sweep`.
- `node -e` over `khai-guard.config.json`: the `gates` key is an array of
  **10** entries.
- `ls packages/engines | wc -l` = 283 and `ls packages/composites | wc -l` = 103.
  Those two sum to 386, which is the number khai's own member-check printed. Two
  instruments, one answer; recorded because `0020` and `0021` between them put
  four findings on instruments that were not cross-checked.
- `git grep -ln` over tracked files for `citation-fidelity`, `no-villain` and
  `distinctness`: each appears in `packages/khai-plays/management/orders/order_computed_harnessed_instructed.md`
  and, for `distinctness`, in one engine's prose. Nowhere else.
- Five of khai's eleven registered houses were cloned at their own current heads
  and their `dependencies` read: `khai-plays-buechner`, `khai-plays-grimm` and
  `khai-plays-storm` each depend on `@chbrain/khai-engine-spine` and nothing
  else; `khai-plays-dickens` declares no runtime dependency at all; `khai-phoenix`
  depends on `khai-engine-fire`, `khai-engine-combustion` and
  `khai-composite-blaze`.

**What the last of those does not establish.** Six houses were not read, and a
house could draw on a culture through something other than a declared dependency.
What it does establish is narrow and sufficient for the finding below: at these
heads, no house read here names a canon house, while one of them names three
engine and composite packages — so the dependency mechanism is exercised, and the
thing it is not exercised on is specific.

**What the gate run does not establish.** It used the installed `node_modules`
rather than a fresh install, and the runner said so itself, unprompted, in a
`Not run` section printed under a green verdict. `0019` recorded khai-cultures'
runner refusing to let ten failures be reported as passing. This is the same
discipline in the other direction, and it is the harder half: a program stating
what it did not establish **while its own verdict is green** is the moment there
is no pressure to state it.

## The finding, which is khai's own sentence

khai's newest management order, `order_open_the_production_layer.md`, dated
2026-08-25, opens by naming the gap it exists for. The Cultures house is
registered as `kind: canon` and glossed *plays other productions draw on as
material*, and: **"Nothing draws on it."** A play set in Bavaria must today
depend on all 290 cultures, 14.6 MB, to cast one.

That order then builds the third package layer — the production, one play
published on its own — and closes by saying where it stopped: Bavaria was
extracted, link-rewritten, packed to 29 files, installed from the tarball inside
another package's `node_modules`, and made to fail closed with eleven findings
the moment its dependency is removed. **"Nothing was published; the proof stops
at the tarball."**

All nine of that order's targets are ticked, and so are all 37 targets across
khai's six orders; the five plans carry 19 open boxes, and those are standing
mandates rather than a backlog — `plan_keep_clean` calls itself *a standing
checklist the Roadie holds, run continuously rather than on a one-off cue*. The
checkbox count was computed, read, and **discarded as an instrument**, which is
recorded because it is the family `0020` and `0021` kept hitting and this is the
first time the check was made before the claim rather than after it.

So the answer to what khai should do next is a sentence khai already wrote, and
the evidence this cycle adds is only that the gap it names still holds a month
later, under a check khai did not run: **publish one production and make one
house draw on it.** Not more mechanism. The mechanism is built, gated, and proven
to the tarball; what has never happened is the thing the mechanism exists for.

Two smaller items were found and are recorded as findings, not as a rival answer.
`docs/COMPUTED-TIER-AUDIT.md` proposes five wall PRs; three landed (collision
`787f31f`, warrant-shape `760329e`, the play-level orphan in
`khai-tests/src/validate.mjs`), and two did not — the cut-to-fit floors, and the
field bounds, whose dash lint is still assembled into `warnings` in
`engineDocChecks` under the comment *advisory warnings, never fatal*, with no
register lint anywhere in the tree. And `khai-review` carries the robustness
wrapper order 2 asked for — N-of-K consensus, a refute-by-default skeptic, and an
`anchored` flag that refuses to confirm a factual rubric without a retrieved
source — exercised by exactly one rubric, `compound-specificity`. The three
rubrics the order named for it, `citation-fidelity` above all, are not written.
The harness was built for a tenant that never arrived.

## A drift khai has no wall for, and why that is a finding rather than a nit

khai computes drift for everything it generates: `docs/SCIENCE.md` against the
packages, the committed `registry.json` against a fresh build, an engine README
byte-identical to `renderEngineReadme`. Its hand-written architecture documents
have no such check, and two of them now read false.

`docs/ROADIE.md` still carries *"Status: design spec (draft for review) …
Nothing here is built yet; the build order is in §12"*, and §12 gates its four
steps on PRs #376 to #378 in a repository whose `main` is past #1560. Against
that: `packages/khai-skills/src/khai-roadie` exists, `khai-tour/lib/profiles.mjs`
carries the Venue table with `kind` on every entry, and the spine engine ships
the `perplexity_space` adaption the document files under *Open / deferred*. And
`docs/DELIVERY.md` says khai-guard *"Runs four gates"* and *"All four gates run
locally"*, where the guard binary dispatches eight subcommands and the repo's own
runner declares ten walls; the same document calls `khai-plays` *"(planned)"*
while that package ships eleven registry cards and the whole management layer.

This is `0020`'s carriage distinction arriving in a second form. There it was a
number in a file against a number a program returns, and khai-cultures held both,
so the file was a dated claim rather than the authority. Here there is no program
to disagree with the file, so a reader has nothing to prefer it to. The finding
is handed over as khai's own doctrine turned on khai's own documents — *push every
move as far up the tier list as it will go* — and not as a mechanism proposed for
it. Which document surfaces could carry a computed status, and whether any should,
is khai's call and not this repository's.

**Nothing from khai is adopted here.** `0014` named that temptation, `0020` found
it stronger for having watched the mechanisms run, and it was stronger again this
time for having run them at exit 0.

## Where attention went, recorded and not diagnosed

`0015`'s attention test is spoiled beyond recovery for this producer, which read
`0015`, `0019`, `0020` and `0021` before opening a khai file, and no result is
claimed for it.

What can still be said is the same thing `0020` said, and it is the third
instance under a live instruction. The instruction to go past contract and
governance surfaces was in force and was read. Attention went to the orders, the
audit, the gates, the guard config, the review harness and the registry. Of
khai's 5,732 files, 4,180 of them markdown, the content layer this repository was
looking at — 283 engines, 103 composites, a 3,363-line generated science index —
supplied not one line above. Three instances now, all under a live instruction,
all by producers who had read the instruction. Recorded as an instance, not as a
diagnosis, because `0015` asked for repetition and this is repetition of the
steered kind, which is the weaker kind.

## Two instrument failures, both the producer's

`npx vitest run --reporter=basic` failed at exit 1 with `Failed to load url
basic`. That is a reporter removed in the vitest 5 this repository's `main`
bumped to one commit before `2e69490` (`2179798`), and it is **this producer's error and not
khai's**. It was caught only because the output held a stack trace and no test
counts. Had it printed a plausible failure instead, this record could have opened
by reporting khai's suite as red. The fix was to stop improvising and run the
command khai declares, `npm test`.

The checkbox count is the second, and it did not reach a claim. Nineteen open
boxes across five plans reads as a backlog and is not one.

Neither is the semantic family the first eighteen cycles kept hitting. Both are
`0020`'s mechanical family — an instrument that returns a confident-looking answer
about something it was not measuring — now at its fifth and sixth instance.

## Check

Judged by the producer, awaiting independent judgement, apart from what the
programs computed and within the limits stated beside each.

Anyone holding `2e69490` can rerun `npm ci`, `npm test` and `npm run gates` and
check the counts. Anyone can read the two quoted sentences in
`packages/khai-plays/management/orders/order_open_the_production_layer.md`, the
status line in `docs/ROADIE.md`, the gate table in `docs/DELIVERY.md`, and the
`gates` array in `khai-guard.config.json`. The five houses' dependencies are
readable in their own public repositories at their own heads, which are GitHub
state and will move.

The recommendation itself is **khai's**, quoted, and the judgement this cycle
adds is only that the gap it names is still open. That is the narrowest form the
answer could take and it was chosen deliberately: an answer this producer
composed would have been this producer's reading of a repository it spent one
session in, offered to the people who built it.

This is the seventh instance of the paraphrase gap and the mildest so far. Every
claim about khai above is either a quotation addressable at a commit or the
printed output of a named command, and the account of what khai *means* by any of
it remains the producer's.

No program of KAAL's ran.

## HAPTIC

Reading a repository and saying what it should do next stays with human
judgement. Nothing here suggests otherwise, and the one move that made the answer
defensible was declining to compute it at all: the back-out condition — report
the subject's own stated next step rather than invent a rival one — is a human
judgement about whose repository it is, and no program would have supplied it.

One part was computed and is worth keeping computed: whether a thing a document
claims is present in the tree. Three of five proposed walls, three of four
proposed rubrics, one status line and one gate count were all settled that way,
by `git grep` and by reading the file the claim is about. That is presence
checking, the same capability `0020` and `0021` measured on KAAL's own corpus and
found returning three false positives — and note that it worked here, in the
outward direction, because the question was *does the tree contain what this
document says it does* rather than *is this string an address*. Which is a real
difference and not a reason to reopen the Script question.

## BASS

**Stay at Skill for the learning capability, and the reason was asked twice.**

No failure of the skill occurred. Both instrument failures were caught before
they reached a claim, at the step the skill already has, and the checkbox
instrument was checked before the claim rather than after — which is the first
time that sequence has held on the first attempt.

Asked a second time whether anything is owed: the reporter failure is the one
place a script could have helped, and it could not have. No check inside this
repository would know which flags a subject's test runner accepts at the version
its `main` happens to carry. The general form — run the command the subject
declares rather than one you composed — is guidance about attention, not
computation, and it is already what the skill's evidence standard implies.

**The known-failure set is still untested.** `0019` named it, `0021` named it
again as the thing available now with no new contact: twenty-one findings sitting
in `learning/` as a corpus that has never been measured as one. This cycle did
not do it either, and did not need to in order to answer the question it was
asked. Recorded as owed for the third time, which is itself the finding: an
opportunity recorded three times and taken none is, by `0016`'s own argument, the
failure that leaves no trace in a diff.

## Act — what this cycle leaves for the next

This is the first External where a recommendation was the deliverable and the
first where the honest answer was a quotation. The move that made it honest is
available to any later contact and is worth naming: **look for the subject's own
statement of what it left undone before composing one.** khai had written it, in
its newest order, in one sentence, and a producer that had not looked would have
composed something worse and called it a finding.

The attention observation is now three instances deep, all steered, and no
unsteered instance can be recovered by anyone who has read this corpus. That
avenue is closed to this repository's own producers and only an outside arm can
reopen it.

`0021` left one arm of its experiment unrun — KAAL handed to Claude as a subject
rather than bound as project instructions. This cycle did not run it either.
