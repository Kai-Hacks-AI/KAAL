# C20 change

## PLAN

1. Add C20 with the gap Case T187, and the Cases T185 (the reader) and T186 (the judge with the reader). They are RED on the collector (`evidence.md`).
2. DEFAULT keeps its name, its declaration on the first line of the single default file, and its chapters, which start with `Change`. It becomes a TYPE: the registry holds it, and a title `DEFAULT: <description>` is judged by those chapters like any registered TYPE.

## DO

1. In `templates.mjs`, register DEFAULT in the registry when the single default file declares it on its first line and starts with `Change`. A DEFAULT declaration anywhere else, a second DEFAULT, several default files and an undeclared default file stay findings or decision points as in A40. The separate `fallback` result is dropped, since the registry now says it.
2. In `envelope.mjs`, drop the fallback option and the note that the fallback was not used. DEFAULT has no row for the route and the Change identity, so both are reported as not judged. A specialized title is never judged by the DEFAULT chapters.
3. Replace in F17 and A40 the sentences that say DEFAULT is a reserved declaration outside the registry by the statement that DEFAULT is a TYPE (release/F19). Change the assertions of T161 and T164 that assert the old statement, and name the change in the DO, because it follows the Owner's ruling and not a wish to go green. The other assertions stay.
4. Rename T185, T186 and T187 to `.test.mjs` when green.

## ACT

1. A 4L retrospective in `act.md`, landing in the collector before C12 is promoted.

## Dependencies

- release/C17 (#1508) states DEFAULT as a TYPE in release/F19 in the collector `kaal/release/fallback-template`. This PLAN cites no file of that collector and tests the behaviour, not F19.
- The template Change of release/C14 brings the default file to the two chapters Change and Because. A default file with other chapters is a finding on the template set until then.
- The hold on promoting C12 to `main` stands. Nothing here wires, enforces or promotes.
