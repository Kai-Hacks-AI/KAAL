# State

Derive it from records `{case, run, revision, outcome, complete}` that a Case runner made (see kaal-testing), where outcome is `GREEN`, `RED` or `UNKNOWN`. `complete` is the runner's own statement that the run observed everything that should count (see kaal-testing); a `GREEN` without `complete: true` is `UNKNOWN`, since complete evidence is established by the runner and never inferred from the records received. Only records of the revision judged count; another revision is stale. The records handed over for the revision are the runs that count. A missing record, or any outcome other than `GREEN` or `RED` (skipped, errored, timed out, incomplete), is `UNKNOWN`.

- `confirmed`: some applicable Case is `RED`, even if every other Case is `UNKNOWN`; one RED Case shows the Defect exists
- `answered`: it has Cases, every applicable Case is `GREEN` with complete evidence
- `unknown`: otherwise, including no Case at all

Several Cases that point at one Defect are different manifestations or conditions of the same undesirable condition. They are not several Defects and not several places to fix. Each Case's own outcome is kept beside the derived state.
Missing, stale or incomplete evidence stays `unknown`. `UNKNOWN` is never read as `RED` or as `GREEN`. The state is derived each time and never written on the Defect. It is evidence, not permission to merge: what it allows is the policy of the gate that consumes it. It does not select a CARE treatment (Contain, Accept, Ratchet, Eliminate) or authorize a release. A validated Finding stays a Finding; it may prompt an Intent, a backlog item (not proof of a Defect) or the investigation of a suspected Defect, none automatic. A Test Case with reproducible evidence, manual or automated, verifies the Defect. CARE comes after, for a verified Defect; Eliminate runs by a hotfix or by a fix through a normal Change.
