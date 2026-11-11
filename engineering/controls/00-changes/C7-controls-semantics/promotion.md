# C7 promotion

## Route

A PLAN never goes to `main` alone.

1. PLAN and DO go into the collector `kaal/controls`, each by its own pull request, squashed.
2. The collector goes to `main` as a whole, on the Owner's go.
3. ACT goes to `main`, possibly through the collector, so the learning is recorded.

This PLAN authorizes no DO, no deployment, no promotion and no packaging.

## Smallest coherent promotion

Everything under `engineering/controls/` that this Change adds: the Change's documents, Intent, Requirements, Architecture, Cases, the candidate Skill, the scenario key and the recorded trial. Nothing outside the folder changes, and the Skill is deployed nowhere.

## Evidence before promotion

| Kind | Evidence | Strength |
| --- | --- | --- |
| Behavioral | The recorded trial: an agent given only the Skill answers all eight scenarios and every answer equals the key (Cases T8 to T11) | observed by running the trial once; one run shows that this agent did it once, not that every agent will |
| Structural | The Skill is concise, within the first slice and in Engineering only (T12 to T15), and the gap Cases T16 to T18 are green | verified by Cases |
| Validated | The CPO reads the Skill and the key and judges that the distinctions are right | judgment, not a Case |
| Operational | None. Controls enforces nothing and the Skill is deployed nowhere | not applicable |

If an answer of the trial differs from the key, the promotion waits for a decision on whether the Skill or the key is wrong.
