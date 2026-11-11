# C4 gap

One row per target artefact. Each gap is a Gap with a global id that a Change-oriented Case can test. The Change that closes it carries a `closes` link. The baseline is `main`.

| Gap | Target artefact | Baseline | Gap |
| --- | --- | --- | --- |
| release/G15 | I3 Change Isolation | `main` states no Intent for the control | I3 is absent |
| release/G16 | F4 and A18 judge | the judge exports no verdict function | PASS, FAIL and UNKNOWN are not a contract of the judge |
| release/G17 | F5 and A19 to A23 placement | one declaration runs the control in CI, and the control is bundled with two others in `push` | Change Isolation declares no placement of its own at Development OUT |
| release/G18 | F6 evidence | the judge prints lines of text | no record names control, boundary, verdict and offending paths |
| release/G19 | A17 and its deployment targets | `main` has no architecture of the control | A17, A19 and A22 are absent |
| release/G20 | equivalence evidence | no replay compares the judge with observed verdicts | the replay of `transition.md` is absent |
