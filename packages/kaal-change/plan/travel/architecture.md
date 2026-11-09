# A Set of Paths Travels Alone: Architecture

Each element names, in brackets, the Requirements it answers.

- **change/A25** [change/F55, change/F56, change/F57]: `kaal-change/travel` exports `declare` and `judge`. It imports no module. `declare` validates and normalizes a declaration. `judge` is `travelsAlone` of change/F56. Both take data and return data.
- **change/A26** [change/F55, change/F56]: **Where the declaration lives.** In the embedding repository, as data under its Guard configuration, for example `.kaal/config/change/path-sets.json`. KAAL's sets (Core with its companions, `.github`, the Guard acceptance boundary) are KAAL's own content. Change ships none of them.
- **change/A27** [change/F56, change/I27]: **Execution is Guard's.** One Guard check reads the declaration, has git classify the changed paths with `git diff --name-only -z` and the pathspecs, calls `judge`, and prints its verdict. The adapter is the only code outside Change: it lists and classifies and holds no rule. A workflow that wants the rule invokes `kaal-guard run` on that check.
- **change/A28** [change/F58]: **Exceptions come from FAR's authorization.** `judge` takes the admitted entries as data, already verified by `authorize` (change/A24). The path-set rule neither reads nor writes any ledger.
- **change/A29** [change/F59]: **The equivalence table.** A fixture lists, for each copy, the path sets and the expected verdicts, taken from running that copy. The same table runs against the copy and against `judge`. It lives once, with Change's Cases, and runs against the targets (the tests-live-once principle).

## Ownership

| Who | Owns |
| --- | --- |
| Change | the rule, the declaration form, the verdict and findings, the equivalence table |
| The embedding repository (KAAL) | its path sets, as data; which collectors apply them |
| Guard | running the check, the verdict vocabulary, trusted-checker pinning |
| Engineering | wiring the check into the gates, and retiring each copy in its own Change |
| Release | nothing in the rule; it consumes the verdict as a gate's input |

## Change graph

| Change | Owner | Depends on |
| --- | --- | --- |
| `change/C10` PLAN, this Change | Change | change/C2 (FAR authorization PLAN) for change/F58 |
| Pre-DO test Change: RED Cases T67–T73 | Change | `change/C10` |
| DO: `kaal-change/travel`, with the Cases GREEN | Change | the pre-DO test Change |
| the Guard check and KAAL's declaration | Engineering | the DO |
| Retire each hand-written copy | Engineering | the equivalence table GREEN against both, and an Owner go |
