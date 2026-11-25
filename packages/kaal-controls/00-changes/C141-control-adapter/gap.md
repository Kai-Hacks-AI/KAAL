# C141 gap

| Gap | Where | Is | Should be |
| --- | --- | --- | --- |
| controls/G107 | the evidence a control runs (controls/F34 to F39) and the status it claims (controls/F19) | each control wires its own mode, ratchet, fail-closed handling and log; nothing records that a control ran, `running` and `implemented` are never computed, and five Act controls in release (CTL24, 29, 30, 31, 33) claim `designed` although they have run | one thin adapter that every control runs through and that leaves a record of the run, and a derivation of the status from those records that can be compared with the claim |
