# The Intent Skill stands alone (External use): Testing

This PLAN adds no Case and changes none. `npm test -w kaal-intent` (`intent/T1`–`T4`) is unchanged. The DO plans and first observes RED each of these, in its own Change:

| Planned check | Observes | Deliberately wrong state that makes it RED |
| --- | --- | --- |
| No Engine precondition | The Skill and its reference contain no instruction to read an Engine, run a `kaal` command or install a package as a precondition of capturing | The current `SKILL.md` first paragraph |
| Meaning matches the Node | Each statement of what an Intent is and is not in the Skill is present in `payload/Intent.md` | A Skill that says an Intent includes acceptance criteria |
| Effects declared | The Skill states what it writes and where | A Skill that is silent on writing |
| Plain form is valid | A plain captured Intent in the reference has name, what is wanted and why, and no `type` | A plain form that requires the Definition id |
| External trial | A fresh agent given only the Skill text captures an Intent from a realistic prompt in an unrelated repository, and the result meets the Skill's own rules | Not run here; recorded by Testing's External scenario (portfolio view option 3), and reported as untested until it exists |

None is written or run here. Verification of this Change is review against the evidence in `intent.md` plus the required checks.
