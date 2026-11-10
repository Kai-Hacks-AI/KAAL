# A Set of Paths Travels Alone: Testing

The planned outer tests become RED Cases in a pre-DO test Change, in `packages/kaal-change/test/plan/travel.test.mjs`. They are immutable to the DO.

| Test | Checks | Loop |
| --- | --- | --- |
| change/T67: a well-formed declaration has no findings; an empty `include`, a duplicate name, an overlap without precedence and a malformed pathspec are each a finding naming it | change/I26, change/F55 | Requirements |
| change/T68: a Change touching no set passes; a Change holding only a set and its companions passes | change/I26, change/F56 | Intent |
| change/T69: a Change holding a set and any other path fails, and each finding names the set, the path and the remedy | change/I26, change/F56 | Intent |
| change/T70: unlisted paths, a malformed declaration and a rename missing one side give `cannot judge`, never `pass` | change/F56 | Requirements |
| change/T71: the same input gives the same result and the input is unchanged | change/F57 | Architecture |
| change/T72: a spanning Change is admitted only by an authorized, unexpired entry for that exact path set and blobs at this boundary; any other entry, an unknown authorization and an expired one admit nothing | change/I29, change/F58 | Intent |
| change/T73: the matrix, one Case per cell: for each set (Core, `.github`, the Guard acceptance boundary) and each event (pull request, merge group, Guard acceptance boundary job, synchronization), the `pass` and `fail` cells give the verdict the hand-written copy gives, each `fail` cell was shown RED first, and a differing cell is reported by name | change/I28, change/F59, change/F60 | Intent |
| change/T74: fail closed: an absent or skipped required check, a check that cannot fetch the candidate or list paths, `cannot judge`, and any answer but `pass` each block; "not applicable" holds only for the declared exemptions; retiring a copy while an event has no run or requirement of the rule is a finding | change/I28, change/F61 | Intent |

The following are validated by review:
- `change/A26` and `change/A27` are placements. That the adapter holds no rule is checked by reading it.
- That each copy's rows in the equivalence table are the copy's real behaviour is established by running the copy, not by reading it.
- Retirement of each copy has its own Owner go.

## RED evidence

At `change/C10`, all eight tests are planned and have no Case yet. The pre-DO test Change makes them RED, each blocked before behavioural assertion because `kaal-change` exports no `./travel`.
