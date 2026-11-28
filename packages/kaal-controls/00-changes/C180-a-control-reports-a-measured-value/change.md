# C180 change

## PLAN

1. Record the intent I38, the Requirements F237 and F238 and the Cases T1740 and T1741 (plain `.test.mjs`).
   - T1740 runs `runControl` with a check that answers `{ findings, measures }`: the measures are carried unchanged into the result, the log line and the record; the verdict, `blocked` and the findings are exactly what they are without measures; a check that answers a plain list still works and the result has no `measures`; an invalid measure (not a finite number, an empty name or unit, a duplicate name, a bad `better`) is dropped and named in `measureProblems`, never turning a PASS into anything else; a thrown check carries no measures. RED on `main`: `measures` is absent.
   - T1741 requires `scripts/lib/measures.mjs`, pure: `checkMeasures(list)` and `compareMeasures(before, after)`, which gives, for each name, the two values, the delta and `better`, `worse`, `same`, `changed`, `incomparable` (units differ) or `unknown` (the name is missing on either side, with `missing` saying which), judged only by the direction the measure declares (`better: 'lower' | 'higher'`; absent means `same`/`changed` only, never better or worse). RED on `main`: the file is absent.
   - Both were run GREEN against a throwaway copy that is not committed (about 50 lines). Without it the suite is the existing Cases GREEN and these two RED.
2. No script, flag, workflow or Skill change in the PLAN.

## DO

Not authorized by this PLAN. On its merge into the collector `kaal/controls/measured-values`:

1. `scripts/lib/measures.mjs`: `checkMeasures` and `compareMeasures` as F237 and F238 say.
2. `scripts/adapter.mjs` `runControl`: accept a check's answer as a list (as today) or `{ findings, measures }`; carry the valid measures into `measures` of the result, `measures` of the log line (count and names) and `measures` of the record; list invalid ones in `measureProblems`. Nothing about modes, flags, blocking or the verdict changes.
3. The ratchet library (C163) passes measures through the same adapter, so a ratchet reports them the same way; C180 adds no ratchet code and touches `runControl` only where it is on `main`.
4. `references/` and SKILL.md: one short paragraph in the words of the package: a check may report what it measured, a measure never judges, and two runs are compared with `compareMeasures`.
5. T1740 and T1741 GREEN; the whole package suite GREEN under the lane. Mutations, each caught: a measure changing the verdict; an invalid measure carried; `better` guessed when undeclared; units ignored in a comparison; measures dropped from the record.
6. ACT: a retro entry in the collector.

## The principle: a missing measurement stays unknown

A measure that is missing is unknown, never zero, no change or success. It holds in three places, each pinned by a Case: a check that reports no measure, throws, or reports an invalid one leaves no entry (never a zero) and the invalid one is named in `measureProblems`; the record has no `measures` entry rather than an empty or zero one; and `compareMeasures` answers `unknown` for a name missing on either side, so a measure that vanished from the later run can never read as an improvement of a lower-is-better measure, and a measure absent before can never read as a regression. Whoever builds a gate on the entries must treat `unknown` as not proven, as the rest of the product does.

## What a measure is

`{ name, value, unit, better? }`: `name` and `unit` non-empty text, `value` a finite number, `better` `'lower'` or `'higher'` when the control knows the direction of improvement. A measure describes what the run observed; it is not a finding and not a threshold. Turning a measure into a gate (a budget that fails a run) is a separate decision under a ratchet or a control of its own, never implied here.

## Who owns what, and what each supplier must provide

Controls owns the shape, the carrying and the comparison. It does not count anything, reads no platform and defines no measure name. Consumers get reporting only by adopting the library: the published package ships `measures` with nothing KAAL-specific, and an adopter's check chooses its names and units. The suppliers below are expected to provide the numbers, in plain data of the measure shape, with no import of Controls (so the layering stays Controls over Hosting and Foundation):

- **Hosting** (platform quantities and platform failure facts). (1) A call counter on its adapters and workflow-token reads: the number of platform calls a run made, total and by operation, and the budget it saw (limit, remaining, reset), as typed numbers with a unit, returned as a list of `{ name, value, unit, better }` that a check can put in `measures` unchanged. (2) The typed platform failure of C179 for every platform read and operation. (3) Names in Hosting's own words (for example `platform-calls`); Controls prescribes none. Hosting plans this part; Controls only states the need.
- **Testing** (proof). The run report already counts GREEN, RED and UNKNOWN; a check that reports test counts, durations or surviving mutants takes the numbers from that report. No new work is requested of Testing; if a consumer wants the observation itself as a measure, Testing offers it as plain numbers, never a Controls type.
- **Guard** (runs and aggregates). Guard's report carries the `measures` of each record verbatim and compares two runs with `compareMeasures`; it adds no measure of its own. Guard decides how it prints them; this Change asks only that it not drop them.
- **Engineering** (an adopter). C47 emits "API calls: n" today. Once this is on `main`, Engineering may emit `measures` from the same check; that is Engineering's own Change.

## Design questions, with the recommendation taken unless the Owner says otherwise

1. **Where measures live in the record.** In the same per-run record the adapter already writes (control, run, sha, verdict, mode), under `measures`, so a series over time is the records over revisions with no second store. A separate measurement file was rejected (YAGNI, a second mechanism).
2. **Check answer shape.** A list stays valid; an object `{ findings, measures }` is the second form. Rejected: a second function the check must export, which every existing check would have to learn about.
3. **Missing is unknown, not new or gone.** Reporting a missing side as `new` or `gone` would invite reading `gone` as zero; the Owner's principle is that missing stays unknown. **Comparison without direction.** A measure that does not declare `better` is compared as `same` or `changed`, never better or worse, so Controls never guesses what an adopter values.
4. **Engineering C47.** It keeps emitting its line today. Adopting the standard there (emit `measures` from its check) is Engineering's own Change after this is on `main`; nothing here edits Engineering.
5. **Order.** Behind the 2 December work and C178 and C179: the DO edits `runControl` after C179's DO (cause) if both are open, and the later one carries the other's lines in its sync.

## Not here

No WIRE, flag, station, required check, ruleset, budget or threshold, npm publish or change of `private`.
