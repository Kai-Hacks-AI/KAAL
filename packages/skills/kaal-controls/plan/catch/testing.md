# CATCH ME IF YOU CAN: Testing

`controls/C5` writes these Test Cases first.

| Test | Checks | Loop |
| --- | --- | --- |
| controls/T5: the payload holds `CATCH ME IF YOU CAN`, typed by `KAAL Definition`, and a fresh Engine admits the whole payload | controls/F4, controls/N3 | Capability acceptance |
| controls/T6: the Node keeps the Owner's expansion verbatim as one line, and that line's initials spell `CATCHMEIFYOUCAN` | controls/F4 | Capability acceptance |
| controls/T7: the installed package holds `payload/CATCH-ME-IF-YOU-CAN.md`, and the installed Engineer Skill finds the extended Agent Skill conformant | controls/F4, controls/F9 | Capability acceptance (packed) |
| controls/T3, unchanged: the ids of `Control`, `Realized by`, `VARISC` and `HAPTIC` | controls/N3 | Capability acceptance |

controls/T1 (from `controls/C2`) lists the payload exactly, so `controls/C5` extends its list by this one file. That is the only change to an existing Test Case.

controls/F5–controls/F8 are about meaning, and Testing calls that validation: the Owner validates them by reading `controls/C5`'s Node and Agent Skill section. No deterministic check is presented as deciding them, and none is invented to look as though it does.

## Observed state at `controls/C4`

Verified first: the payload on `kaal/controls` holds no `CATCH-ME-IF-YOU-CAN.md`, so controls/T5, controls/T6 and controls/T7 would fail. controls/T3 passes.
