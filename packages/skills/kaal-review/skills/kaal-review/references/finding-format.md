# A finding

Fields: `id`, `severity`, `dimension`, `location`, `claim` (what is wrong), `evidence {kind, detail}`, `impact`, `direction` (a way to fix, not a decision), `status`.

Severity: `blocker` the work should not be relied on until fixed; `major` a real defect or gap; `minor` worth fixing, low harm; `nit` taste or polish.

Evidence kind: `observed` (you ran it or read the exact lines) or `inferred` (you reasoned without confirming). Inferred findings are listed in `self_check.inference_only`.

Status: `open`, `fixed`, `not fixed`, `withdrawn`. Review sets `open` at first report and updates statuses on re-review from what it observes.

Findings below the request's floor are counted, not listed.
