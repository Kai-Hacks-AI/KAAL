# Example

A request to review a small change with floor `minor`, one check and one claim yields a body like:

```
Two findings, one major. Please look at the new 5 s default yourself.

<!-- kaal-review:record kaal-review/1 -->
```json
{ "schema": "kaal-review/1", "id": "r-0001", "reviewer": {"actor": "agent-b", "independence": "fresh context, not the author"}, "time": "2026-11-02T22:00:00Z",
  "subject": {"repository": "example/repo", "head": "a1b2c3d", "paths": ["lib/a.mjs"]},
  "request": {"severity_floor": "minor", "checks": [{"command": "npm test", "expected_status": 0}], "claims": ["parse keeps every record"]},
  "lenses": [], "checks": [{"command": "npm test", "exit_status": 0, "output": "12 passed"}],
  "findings": [{"id": "F1", "severity": "major", "dimension": "correctness", "location": "lib/a.mjs:40", "claim": "drops the last record", "evidence": {"kind": "observed", "detail": "two lines without trailing newline gave one record"}, "impact": "data loss", "direction": "flush the buffer at end of input", "status": "open"}],
  "below_floor": 1, "claims": [{"claim": "parse keeps every record", "outcome": "failed", "evidence": "see F1"}],
  "not_checked": ["Windows path handling"], "human_to_observe": ["default changes from 30 s to 5 s"],
  "self_check": {"checks": [{"command": "npm test", "ran": true, "result": "exit 0"}], "lenses": [], "claims": [{"claim": "parse keeps every record", "outcome": "failed"}], "inference_only": []},
  "round": 1, "prior": null }
```
```
