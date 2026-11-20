# C105 baseline

The baseline is `main` (b1b40b2), with no commit of this Change.

- The old promotion ruleset holds `non_fast_forward` and `deletion` on `main`. The new `promoting` ruleset (`05-src/wiring/rulesets/promoting.json`) holds three required checks and nothing else; it does not refuse a rewrite of `main`.
- release/CTL22 `verify History` is a detective control (status designed, not installed): its judge `05-src/history/verify-history.mjs` and workflow source `05-src/wiring/workflows/verify-history.yml` are on `main`, and no workflow of it is installed under `.github`. It can only reveal a rewrite after it happened.
- release/I54, F77 and A68 state the detective design; their Cases T1174 to T1176 and CTL22's T1173 and T1177 to T1180 assert it.
- Nothing reads the rules in force for `main`. What the promoting ruleset requires is named by the technical realization in some controls (release/CTL5 `gate analyze Vulnerabilities`, release/CTL20 `gate verify Triggers`), and some valid protections exist only as rules of the old ruleset.
