# C25 change

## PLAN (amended 14 Nov after the CPO ruling on #1621)

1. The gap is G58: the six installed templates carry no cue, and five of them have no Engineering source on `main` to install from.
2. **Sources.** `plan`, `do`, `act`, `promotion` and the default template get an Engineering source each, `05-src/wiring/templates/<name>.md`, whose content is today's installed file plus the fixed cue of release/C24 as its first visible line, after the leading comment or declaration and nothing else changed. The default template keeps its older shape and path (no migration). `sync` keeps its source `sync-template.md` of release/C9, which already carries the cue.
3. **Cases in the Engineering collector (CHECK), isolated, no install needed.** T200: each of the six sources exists, carries the cue exactly once as its first visible line, and equals today's installed file when the cue line is taken out. T215: release/T117 and T121 no longer compare an installed file, name no cue and keep no transitional branch; they judge the source. The comparison of installed with source moves to the WIRE Case.
4. **WIRE Case, executed at WIRE.** T214: each of the six installed files equals its source byte for byte. It stays `.red.mjs` through the collector's promotion and is renamed in the WIRE pull request. It is not a prerequisite of the collector's ACT.
5. Order: the Engineering collector `kaal/release/wire-envelope-cue-engineering` (PDCA with ACT) is promoted first. The WIRE `wire/envelope-cue` follows only once release/C27 and its protection are available and the Owner authorizes them. The `.github` collector `kaal/release/wire-envelope-cue` and #1621 are retired unmerged.
6. The PLAN installs nothing, activates no ruleset and executes no WIRE.

## DO

1. Add the five sources and turn T200 and T215 green; rewrite T117 and T121 to judge the source only. T214 stays red.
2. The ACT is written once T200 and T215 are green.

## ACT

A 4L retrospective in `act.md`. The reader trial (the same two links, a pull request opened from the new templates) is rerun after the WIRE installs the cue and is recorded as validation evidence, not an answer key.

## Not in this Change

Executing a WIRE, ruleset or branching-rule activation, a template registry, the migration of the default template, `hotfix.md` (it already carries the cue), and any change to the chapters or hints of a template.
