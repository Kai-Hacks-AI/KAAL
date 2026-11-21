# C115 baseline

The baseline is `main`. `05-src/wiring/rulesets/promoting.json` holds one rule, `required_status_checks` (three checks, not strict), and `05-src/stages/stages.json` declares exactly that for Promoting. The old promotion ruleset (release/C34, `baseline-old.json`) holds `deletion`, `non_fast_forward`, `pull_request`, `required_status_checks`, `code_scanning` and `merge_queue` (SQUASH, one entry to build, merge and wait, grouping ALLGREEN, a response timeout of 60 minutes). Cases T481, T482 and T483 pin set 1 as a ruleset without that rule.
