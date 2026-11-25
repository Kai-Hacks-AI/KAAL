# C24 gap

| Gap | Where | Is | Should be |
| --- | --- | --- | --- |
| controls/G101 | ratchets of release, `baseline-source` of the finder | each ratchet has its own way to hold and read its baseline, CTL20 has no baseline file, `baseline-source` may be prose, and the comparison is reachable only through the command | one pure library, a mandatory baseline file named by `baseline-source`, checked by the finder |
