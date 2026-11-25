# C141 gap

| Gap | Where | Is | Should be |
| --- | --- | --- | --- |
| controls/G107 | the status of a control (controls/F19, F18) and the evidence it runs (controls/F34 to F39) | a control claims `designed` while it is installed and has run: the five Act controls in release (CTL24, CTL29, CTL30, CTL31, CTL33) do; `running` and `implemented` are never computed, each control wires its own mode, ratchet, fail-closed handling and log, and nothing finds a control that is delivered without a record or runs outside the shared library | one thin adapter that every control runs through, that leaves a record of the run as evidence; the status is derived from that evidence; and a check finds a control that does not run through the adapter, whose record lags or overclaims its evidence, or that is delivered with no record |
