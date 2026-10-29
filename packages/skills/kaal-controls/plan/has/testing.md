# A Control has its Intent: Testing

`controls/C7` writes these Test Cases first.

| Test | Checks | Loop |
| --- | --- | --- |
| controls/T8: the payload holds `Has`, typed by `KAAL Definition`, and a fresh Engine admits the whole payload | controls/F10, controls/N4 | Capability acceptance |
| controls/T9: a Control with one `Has` Edge to a Node stating its Intent and one `Realized by` Edge is admitted, and Graph finds both Edges well formed and resolved, each with its own type | controls/F10, controls/F11 | Capability acceptance |
| controls/T10: the installed package holds `payload/Has.md`, and the installed Engineer Skill finds the extended Agent Skill conformant | controls/F10, controls/F13 | Capability acceptance (packed) |
| controls/T3, unchanged: the ids of `Control`, `Realized by`, `VARISC` and `HAPTIC` | controls/N4 | Capability acceptance |

controls/T9's Intent Node is typed by a Definition the test creates, because Controls does not depend on Intent (controls/F12). The test shows the Edge resolves, not what an Intent is.

controls/T1 lists the payload exactly, so `controls/C7` extends its list by this one file. That is the only change to an existing Test Case.

controls/F11 and controls/F12 are about meaning: the Owner validates them by reading `controls/C7`'s Node and Agent Skill lines. One `Has` target per Control is part of that meaning. Graph's Edge form takes one group per Edge type but any number of targets in it, so Graph does not decide it, and no check is invented to look as though it does.

## Observed state at `controls/C6`

Verified first: the payload on `kaal/controls` holds no `Has.md`, so controls/T8, controls/T9 and controls/T10 would fail. controls/T3 passes.
