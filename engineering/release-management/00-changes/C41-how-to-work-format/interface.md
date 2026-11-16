# C41 interface

## The chapter format the rule judges

```
## HOW TO WORK

| Step | Who | Action | Status | Details |
| --- | --- | --- | --- | --- |
| 0 | Predecessor | PLAN approved and merged into the collector | merged | #101 |
| 1 | Worker | Turn the PLAN's RED Cases green with the least change | done | — |
| 2 | Dependency | SYNC of main into the collector | pending | #118 |
| 3 | Reviewer | Verify the Cases are green at the exact head | open | — |
| 4 | Successor | ACT, starts on merge | — | #131 |
```

## `howToWorkProblems(body)` in `envelope.mjs`

Returns a list of findings, empty when the body has no `HOW TO WORK` chapter or the chapter is well formed. It reads the chapter and judges:

- the chapter holds one table and nothing else, with the header `Step | Who | Action | Status | Details` and exactly five cells in every row;
- the first row has step `0` and Who `Predecessor`, and the last row has Who `Successor`; neither value appears in a middle row;
- the Step column is `0`, `1`, ..., `n` in sequence, with no gap, repeat or other text;
- Who is one of `Predecessor`, `Worker`, `Reviewer`, `Dependency`, `Successor`;
- a `Dependency` row has a PR reference `#<number>` in Details.

It does not read Action, Status or any other Details. A `#<number>` reference is the only link-like text the chapter may hold; the existing rules still reject URLs, emoji and attribution wording in every chapter.
