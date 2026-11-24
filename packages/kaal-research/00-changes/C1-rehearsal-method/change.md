# C1 change

Kai (CPO) moved the research-method findings of the CRO review of controls/C21 (#2319) into kaal-research, and asked for the method to be consumable outside KAAL: method over specifics. The earlier decision (C28, engineering) already gave kaal-research the rehearsal object `RH<n>` as one of two Skills; this PLAN starts with that one, because the review's findings are about trials. Research notes (`R<n>`) follow in their own Change.

## The answer in six lines

1. A rehearsal is one record with a question and a verdict of favourable, unfavourable or inconclusive, reported alike.
2. Well-formed is not credible. The form check asks only that the record states what was run, what was seen and how far each claim is shown; an unblinded, one-arm or version-only trial is well-formed if it says so (F3).
3. Stronger conditions are tied to stronger claims: a `comparison` claim needs two arms, an `effect` claim needs an untreated arm, blind scoring, a key frozen before the treatment and an opened treatment (F4).
4. The evidence is named by role and SHA-256 and lives inside the record's own folder; a path under `/tmp` is refused. Only prompt, answers and scores are essential (F2).
5. The verdict says what it is about and which claims it rests on; `favourable` needs those claims, not every claim, to be shown (F4).
6. The judgement is about form and says so in its result; it never says a trial is right. The finder and judgement run from a bare copy of the scripts (F1, N1).

## Choices made, for review

- **Policy of the CPO review (22 Nov), applied:** the earlier draft refused records with no untreated arm or no blind scoring and made `favourable` need every claim `yes`. Both are removed; the conditions moved onto the claims that need them, and the verdict names its claims.
- **Essential and optional.** Required: prompt, answers, scores; arms, `untreated`, run counts, fresh, model, settings, blind; claims with scope and not-shown; limits. Dropped as bookkeeping: whether isolation was checked, an unequal-count note, subject, key and rubric as required roles (they are named when they exist and required for an effect claim).
- **No run-count threshold.** `Limits` must say what the count shows; the judgement does not compare it with a number.
- **The digest is the caller's.** The judgement is handed `{ path, sha256 }`, so the package depends on no hashing and on nothing else.
- **Cases are ordinary `.test.mjs`** from the PLAN, RED by assertion on the collector, GREEN in the DO with no renaming.
- **No persistence rule.** Where records live is engineering's `02-learnings/rehearsals` (C28).

## What this does not do

No Skill, no `SKILL.md` wording, no trial runner or harness, no rubric format, no migration of earlier trials (C21, testing C72, the exchange trials), no note object, no wiring, no control that a decision must cite a record. Whether the Skill itself teaches the method is judged by a rehearsal of its own, in the DO.

## PLAN

1. Add Intent I1, Requirements F1 to F4 and N1, Architecture A1, gap G1 and Cases T1383 to T1387 as `.test.mjs` beside their Requirements, and one authored example record, and the package's `package.json` and `README.md`.
2. Observe the RED against the collector, and show that each Case can pass and fail for the right reason (`evidence.md`).
3. `draft/` holds the reference scripts used for that, for review only.

## Ids

Proposed: research/C1, I1, F1 to F4, N1, A1, G1, T1383 to T1387. T1382 is the highest Case on main at the time of writing; other open PRs may hold higher ones. The allocator confirms.

## DO

Not authorized by this PLAN. After approval: move the scripts from `draft/` into `skills/kaal-research/`, write the Skill, add `scripts.test`, and run a rehearsal of whether an agent given the Skill writes a record like the example unaided. The Cases are not renamed.

## Questions for review

1. Is the scope ladder (`description`, `comparison`, `effect`) the right way to tie conditions to claims, and are the effect conditions the right ones?
2. Is the example (`02-requirements/F1-rehearsal-record/example/RH1.md`) the right weight for an authored record, or is something in it still needless?
3. Ids are proposed (T1382 is the highest Case on main; other open PRs may be higher): the allocator confirms.

## ACT

The retro of the collector that carries this Change, in kaal-retro's contract.
