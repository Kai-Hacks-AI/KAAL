# C145 gap

| Gap | Where | Is | Should be |
| --- | --- | --- | --- |
| controls/G111 | the library of the adapter (controls/C141) | nothing checks that the record of an installed control is due on the next pull request of the capability that owns it | one small detective control, `demand Record`, that finds it by name, and rolls out detective, advisory, preventive by the change protocol |
