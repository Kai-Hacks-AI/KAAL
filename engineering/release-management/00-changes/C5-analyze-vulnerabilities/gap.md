# C5 gap

One row per target artefact. Each gap is a Gap with a global id that a Change-oriented Case can test. The Change that closes it carries a `closes` link. The baseline is `main`.

| Gap | Target artefact | Baseline | Gap |
| --- | --- | --- | --- |
| release/G21 | I4 analyze Vulnerabilities | `main` states no Intent for the check | I4 is absent |
| release/G22 | F7, F8 and A24 to A27: declared placement | no declaration names the check; it runs as a loose workflow | the control is declared for no place |
| release/G23 | F9 and A28 merge-group | the workflow reports for pull requests only | no merge group reports the control, so Promotion cannot require it |
| release/G24 | F9 wiring | no ruleset requires the check | the context each ruleset needs is not recorded |
| release/G25 | retirement of the old realization | `dependency-review.yml` is the only realization | the old workflow is still present after the new one reports |
| release/G27 | F7 and A25 interpreter | the old job gives an exit status; a failure to compare looks like a finding | no interpreter maps the mechanism's result to PASS, FAIL or UNKNOWN with findings |
| release/G26 | equivalence evidence | nothing compares the new job's outcomes with the old job's | the replay of `transition.md` is absent |
