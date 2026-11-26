# C147 gap

| Gap | Where | Is | Should be |
| --- | --- | --- | --- |
| controls/G113 | the history of a ratchet (controls/C25, F39) | C25 teaches the adoption line (`from: null`, `to: N`, `removed: []`), but `judgeProgress` judges a shrink only: for an adoption it says `baseline-grew` or `history-without-change`, so release had to verify the adoption of CTL20 and CTL36 with a Case of its own (release/C134, T1522) | the library judges the adoption line too, so no adopter needs a check of its own |
