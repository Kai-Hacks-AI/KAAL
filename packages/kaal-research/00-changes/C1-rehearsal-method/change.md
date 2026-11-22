# C1 change

Kai (CPO) moved the research-method findings of the CRO review of controls/C21 (#2319) into kaal-research, and asked for the method to be consumable outside KAAL: method over specifics. The earlier decision (C28, engineering) already gave kaal-research the rehearsal object `RH<n>` as one of two Skills; this PLAN starts with that one, because the review's findings are about trials. Research notes (`R<n>`) follow in their own Change.

## The answer in six lines

1. A rehearsal is one record with a question and a verdict of favourable, unfavourable or inconclusive, reported alike.
2. The evidence is named by role and SHA-256 and lives inside the record's own folder; a path under `/tmp` is refused (F2).
3. The design states a true untreated arm, equal run counts, what fresh meant, blind or not, and a key frozen before the treatment (F3).
4. Each run says whether the treatment was verified; a claim about the treatment is only `yes` on opened runs (F4).
5. Every claim says what it rests on, how far it is demonstrated and what is not shown; the verdict never outruns them (F4).
6. The judgement is about form and never says a trial is right; the finder and judgement run from a bare copy of the scripts (F1, N1).

## Choices made, for review

- **`blind: no` is allowed, but never `favourable`.** An honest unblinded trial can be reported, it just cannot claim a favourable result. This is a policy of this PLAN, not taken from the review.
- **`favourable` needs every claim `yes`.** Stricter than the C21 report; it follows the review's "keep claims apart from what was shown".
- **No run-count threshold.** Review key: an invented threshold is a fault. `Limits` must say what the count shows; the judgement does not compare it with a number.
- **The digest is the caller's.** The judgement is handed `{ path, sha256 }`, so the package depends on no hashing and on nothing else (Foundation's SHA-256 stays the consumer's tool).
- **No persistence rule.** Where records live is engineering's `02-learnings/rehearsals` (C28); this PLAN adds no location rule.

## What this does not do

No Skill, no `SKILL.md` wording, no trial runner or harness, no rubric format, no migration of earlier trials (C21, testing C72, the exchange trials), no note object, no wiring, no control that a decision must cite a record. Whether the Skill itself teaches the method is judged by a rehearsal of its own, in the DO.

## PLAN

1. Add Intent I1, Requirements F1 to F4 and N1, Architecture A1, gap G1 and Cases T1383 to T1387 as `.red.mjs` beside their Requirements, and the package's `package.json` and `README.md`.
2. Observe the RED against the collector, and show that each Case can pass and fail for the right reason (`evidence.md`).
3. `draft/` holds the reference scripts used for that, for review only.

## Ids

Proposed: research/C1, I1, F1 to F4, N1, A1, G1, T1383 to T1387. T1382 is the highest Case on main at the time of writing; other open PRs may hold higher ones. The allocator confirms.

## DO

Not authorized by this PLAN. After approval: move the scripts from `draft/` into `skills/kaal-research/`, write the Skill (with a rehearsal that tests whether it teaches the method), add `scripts.test`, rename T1383 to T1387 to `.test.mjs`.

## Questions for review

1. Are the two policies above (`blind: no` never favourable; `favourable` needs every claim `yes`) the right bars?
2. Is a plain-text record with `key: value` lines the right shape, as for retros, or should the record be JSON?
3. Is an untreated arm a hard requirement, or may a version comparison alone be `well-formed` if it says it is one?

## ACT

The retro of the collector that carries this Change, in kaal-retro's contract.
