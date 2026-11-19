# C15 baseline

The baseline is `main` at `753bc3c07aa8cdc67394636361550eb673bc06ba`. The finder lists every control with `status`, `rank`, `stations`, `valid` and `problems`; the check reads declarations; `judging-status.md` says in words what Tested needs. No control claims `tested` on `main`.

- Kai's model (19 Nov 2026): evidence is Test Cases that each run against an X (a fixture, a real merge or PR, a provoked case, a before and after pair of trees), at least N each, with at least one real failure. No separate evidence types. The Case and the runner (`kaal-testing run`, `compareReports`) are reused and only "what it ran against" is added.
- Detective to preventive or corrective is another control with the same code, switched on by a flag after Tested. That is outside this Change.
