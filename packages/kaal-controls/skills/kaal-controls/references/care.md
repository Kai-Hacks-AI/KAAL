# Deciding what to do with findings

A review of findings has two steps. Do not mix them.

## 1. Disposition: is the finding real?

Every finding gets exactly one disposition, recorded with who reviewed it:

- **valid**: the finding is real and needs a response.
- **invalid**: the finding is wrong. Record the `evidence`.
- **unknown**: it cannot be told yet. Record what to `investigate`. It stays unresolved.

An invalid or unknown finding takes no response. A finding is never accepted by being old or by being there.

## 2. Response: only a valid finding takes one

Exactly one of four responses, each with a `reason`:

- **Contain**: limit the exposure while the finding stays. Needs an `owner` and the `limits`.
- **Accept**: the finding stays, knowingly. Needs an `owner`.
- **Ratchet**: a preventive strategy that supports progressive corrective work. It is not an acceptance. Needs an `owner` and the work it `corrects`.
- **Eliminate**: remove the cause. Needs the work it `corrects`.

Review proposes the response. An authorized decision-maker selects it. Record both (`proposedBy`, `selectedBy`).

## Judging

`scripts/care.mjs` exports `judgeDecision({findings, dispositions, decisions})` and answers `{verdict, reasons, unresolved}`. PASS means every finding has a disposition and every valid finding has one complete response. FAIL lists the reasons. UNKNOWN means an input is missing. Unknown findings are listed under `unresolved`.
