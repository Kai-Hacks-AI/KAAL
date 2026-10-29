# A Control has its Intent: Testing

`controls/C7` writes these Test Cases first.

| Test | Checks | Loop |
| --- | --- | --- |
| controls/T8: the payload holds `Has`, typed by `KAAL Definition`, and a fresh Engine admits the whole payload | controls/F10, controls/N4 | Capability acceptance |
| controls/T9: a Control with one `Has` Edge to its Intent and one `Realized by` Edge is admitted, and Graph finds both Edges well formed and resolved, each with its own type. With decision 3 B, the target is typed by Intent's `Intent` Definition | controls/F10, controls/F11 | Capability acceptance |
| controls/T10: the installed package holds `payload/Has.md`, and the installed Engineer Skill finds the extended Agent Skill conformant | controls/F10, controls/F13 | Capability acceptance (packed) |
| controls/T3: the ids of `Realized by`, `VARISC` and `HAPTIC` unchanged. `Control`'s is unchanged, or with decision 2 B pinned to its new id | controls/N4 | Capability acceptance |

With decision 3 A, controls/T9's Intent Node is typed by a Definition the test creates. With 3 B, it is typed by Intent's own Definition, which the test resolves once Intent is on `main`. Either way, the test shows the Edge resolves, not what an Intent is.

controls/T1 lists the payload exactly, so `controls/C7` extends its list by this one file. That is the only change to an existing Test Case.

controls/F11 and controls/F12 are about meaning: the Owner validates them by reading `controls/C7`'s Node and Agent Skill lines. Graph's Edge form takes one group per Edge type but any number of targets in it, so Graph does not decide how many Intents a Control has. Whichever cardinality the Owner takes, consumers check their own instances, and the Owner validates the meaning by reading.

## Observed state at `controls/C6`

Verified first: the payload on `kaal/controls` holds no `Has.md`, so controls/T8, controls/T9 and controls/T10 would fail. controls/T3 passes.
