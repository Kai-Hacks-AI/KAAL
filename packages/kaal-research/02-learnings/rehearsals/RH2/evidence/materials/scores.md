# Scores

| Group | Runs | Result |
|---|---|---|
| Defect only | 3 | 1 clean (hit), 1 partial, 1 miss |
| Both | 3 | 2 hits, 1 miss |
| Both, neutral names | 3 | 3 hits |

Distractor Skill opened in 0 of 9 runs.

All three misses share one cause, found in the tool traces: a step before the exchange. The agent found the register through Glob and grep and never loaded the Defect Skill, so the decision-step pointer, and with it the seek, was never reached. The one partial read the fallback and still ran the checks, which it had the means to do.

Neutral names: with the names swapped, the match held 3 of 3, so the Testing Skill was found by its description and not by its name. The seek and the offer share ordinary words (checks, element); no peer with confusable vocabulary was tried beyond the one distractor.

What was not tried: a blind scorer, a run count above 3 per group, the real runner.
