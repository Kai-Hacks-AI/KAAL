# The review record

Publish the record after a line `<!-- kaal-review:record kaal-review/1 -->`, as the next fenced `json` block. Only a record after the marker is found by `collect`.

Top-level fields (all required except `dispositions`): `schema` (`kaal-review/1`), `id`, `reviewer {actor, independence}`, `time`, `subject {repository, head, paths…}`, `request`, `lenses [{source, applied}]`, `checks [{command, exit_status, output}]`, `findings`, `below_floor` (count), `claims [{claim, outcome, evidence}]` with outcome `satisfied`, `failed` or `not_shown`, `not_checked`, `human_to_observe`, `self_check`, `round`, `prior` (id or null).

`self_check` lists every requested check, lens and claim with what happened, and `inference_only`: the ids of findings that rest on inference. A check stated as run needs its record in `checks`.

`dispositions` is the invoker's, keyed by finding id. Review never writes it. There is no approval, merge or verdict field anywhere; the checker refuses one.

Run `node scripts/check-record.mjs record.json` (or a body containing the marker). It exits 0 when the record is valid, 1 when not, and prints each error.
