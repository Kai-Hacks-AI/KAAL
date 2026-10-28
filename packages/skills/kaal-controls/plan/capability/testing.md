# Controls as a Capability: Testing

The planned Test Cases are listed here, and `controls/C2` writes them first. They replace the Skill-kind assertions in `test/controls.test.mjs` and `test/acceptance/controls.test.mjs`, because there is one owner and one claim, not two.

| Test | Checks | Loop |
| --- | --- | --- |
| controls/T1: `Controls` is typed by `foundation().capability`, and `ownership.kaal.json` names it by kind `capability` and its exact name and id | controls/F1 | Capability acceptance |
| controls/T2: a fresh Engine admits the payload with `register(dir, "capability", "kaal-controls", …)`; `catalog(dir).capabilities` lists `Controls` and `skills` does not; `verify` is clean; a documented Control is refused before and admitted after | controls/F1, controls/N1 | Capability acceptance |
| controls/T3: `Control`, `Realized by`, `VARISC` and `HAPTIC` keep the ids recorded below | controls/N1 | Capability acceptance |
| controls/T4: the installed package is admitted by Core alone with `kaal register capability` and listed as `capability` | controls/F1 | Capability acceptance (packed) |

controls/F2, controls/F3 and controls/N2 are about meaning, which Testing calls validation: the Owner validates them by reading `controls/C2`'s diff. No deterministic check is presented as deciding them.

## Observed state at `controls/C1`

Verified first, on `kaal/controls` at `de57240`, through Graph's `identify`:

| Node | Type | id |
| --- | --- | --- |
| Controls | KAAL Skill | `667d1035bd3468ea6dfe47c997a8825558e1fa6478eb31563d1c94836c391762` |
| Control | KAAL Definition | `2e737aa4bd36b31c536c879a39e8debc7cba94ee2d070443a5216f0c26ee29cd` |
| Realized by | KAAL Definition | `07c7ea76667f0a16edcf6bb1e7e6aaf2ec114b817d3e7ad8222db0c5afb486f7` |
| VARISC | KAAL Definition | `912d4d41e8592a52ee46e0599af7e17c8429f354a78ede9b78c8cbb5ac17b007` |
| HAPTIC | KAAL Definition | `172f9ae967582aa2ce90085247792d96c739ba40802d7e7db29b87f81e2f29e3` |

At this state, controls/T1, controls/T2 and controls/T4 would fail, because `Controls` is a Skill and is claimed as one. controls/T3 would pass: it makes an existing obligation explicit, and none of its RED is fabricated. `Controls`' own id changes in `controls/C2`, because its type changes.
