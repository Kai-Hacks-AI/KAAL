# track Work (capability)

`track Work` (release-management/F23) says where each piece of Work stands on the way to a release: its position, stage, station, collector, Change id, record folder, full head SHA, and what it waits for. It is read-only and judges nothing: it classifies observable facts with a **model it is handed**. It has no defaults, names no role and nothing of a consumer; the consumer's configuration decides stages, stations, prefixes, check names and the policy (`../track-work-kaal/` is KAAL's).

- `trackWork(facts, { model })` classifies every piece. A wait is the first wait of the model's ordered `waits` with a true condition, over a fixed vocabulary of conditions (`noPullRequest`, `ciRed`, `ciPending`, `behind`, `unresolved`, `envelopeFails`, `notApprovedAtHead`, `autoMergeOff`). A condition is true, false or unknown; an unknown one before the winning wait makes the piece `unknown` and names what is missing, unless the model marks it `provisional`, which is shown, not hidden. Each piece carries the head it was read at and where each fact came from.
- `select(result, { stage, station, collector, waitingFor })` narrows: any-of within a selector, all-of between selectors; an unknown value is refused and the known ones are named.
- `rollUp(result, composition, { model })` puts a Change where its least-advanced piece is by `model.order`; a Change is `unknown` when a piece is; a piece the facts do not contain is reported as unread.
- `render(result)` prints one line per piece, then what could not be read as `incomplete:` lines.
- `gather(gh, repo, model)` reads the facts through an injected `gh`; `fromGraphql` and `ciOf` map them.

Cases: `model.test.mjs` (T67 to T71, T74 to T77, against a fixture model that is not KAAL's) and `gather.test.mjs` (T44, T45).
