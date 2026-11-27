# C161 change

## PLAN

1. Add the Case T1711 under controls/N8 (plain `.test.mjs`, package-relative). It reads the Skill folder and fails on a KAAL station name and on a `KAAL_<...>` flag name. RED on the collector (four lines in three files); run GREEN against an uncommitted throwaway rewrite.
2. Amend controls/N8 by one sentence: the Skill names no station and no flag of an adopter; the stations a control may declare come in as input.
3. No script or Skill word change in the PLAN.

## DO

Not authorized by this PLAN. On its merge into the collector, and with the collector synced with main:

1. `findControls` takes the list of valid stations as an input. Declared stations are checked against it exactly as today (an unknown station is an invalid declaration). With no list given, a `stations` declaration is invalid with a reason that says no stations are defined, so nothing passes by accident. Modes (`detective`, `preventive`) stay in the Skill: they are controls semantics.
2. `references/declaring-controls.md` and `references/enforcing-controls.md` say "a station of your setup" and use a neutral example (`stations: [Merging:preventive]`); the reference names no KAAL station.
3. Engineering supplies KAAL's seven stations as that input where it calls the finder (a hand-off to the engineering thread, recorded in the ACT; not done in this Change).
4. T1711 GREEN; the package suite GREEN, with the Cases that use stations given the list as input. A mutation: a KAAL station back in the finder and in a reference, each alone turns T1711 RED.

## ACT

A retro entry in the collector.

## Design questions, with recommendations

1. **Input shape.** Recommend `findControls({files, stations})` with `stations` a list of non-empty names. Rejected: reading it from a file in the Skill, which names a layout (N8).
2. **Callers.** Release's collectors and engineering's check call the finder today. Recommend they pass the list in the same Changes that adopt the new package, so the finder never runs with KAAL's list built in. Until then the DO keeps them green by passing the list in the Cases only.
3. **Order.** After C160 (platform work to hosting): both touch `find-controls.mjs`.

## PLAN amendment (a Case that required a KAAL station word)

The Case controls/T928 (under controls/A12) requires the word `Integrating` in `references/enforcing-controls.md`. That is a KAAL station name, which T1711 forbids in the Skill, so the two Cases cannot both pass. T928 now requires the neutral example `Merging` instead, so the reference's own example station is the word it must say. Nothing else about T928 changes. The DO uses `Merging` in the references as the PLAN said.
