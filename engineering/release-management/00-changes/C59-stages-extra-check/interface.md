# C59 interface

## The declaration

A stage object in `stages.json` may hold `also`, a list of full check names, for example `"also": ["analyze Vulnerabilities (Promoting)"]`. Absent, it is the empty list.

## The judge

For a branch ruleset of a stage the required checks are `verify Stages (<Name>)` (Integrating: what `requires` lists), followed by the names in `also` of that stage, in that order. The ruleset source must require exactly these contexts, in that order, and nothing else. A ruleset whose stage declares no `also` is judged as before.
