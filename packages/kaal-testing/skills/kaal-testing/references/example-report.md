# Reference: an example report of a run

One complete report of `kaal-testing run`, for a project whose tests are `invoice.test.mjs`, `tax.test.mjs` and `export.test.mjs`. Follow its shape: the result per test first, what the run leaves unobserved second, the handover last.

---

**Run:** `npx kaal-testing run invoice.test.mjs tax.test.mjs export.test.mjs`. It did not finish: `export.test.mjs` reached the time bound and was stopped, so the run is **incomplete**. Of the 7 tests that reported, 3 are GREEN, 1 is RED and 3 are UNKNOWN.

| Test | Result | Why |
|---|---|---|
| `invoice.test.mjs > totals the lines` | GREEN | the assertion held |
| `invoice.test.mjs > applies the discount` | GREEN | the assertion held |
| `tax.test.mjs > rounds to cents` | GREEN | the assertion held |
| `tax.test.mjs > taxes a refund` | RED | assertion failed: expected -4.20, got 4.20 |
| `tax.test.mjs > reads the rate table` | UNKNOWN | errored with "ENOENT rates.json", before any assertion |
| `invoice.test.mjs > prints in French` | UNKNOWN | skipped ("not built yet") |
| `export.test.mjs > writes the file` | UNKNOWN | timed out; the file was stopped, nothing was observed |

**Unobserved:** whatever `export.test.mjs` would have shown after the stop, the rate table, and the French printing. Nothing here links a test to a requirement, so what the three GREEN tests cover is not stated either.

**Handover:** this is everything the run observed: 3 GREEN, 1 RED, 3 UNKNOWN, an incomplete run, and the unobserved above. It is handed on as it stands, partial as it is. The decider owns what follows: retry, investigate, accept the risk or proceed.

## Endings by outcome

Hand on the truthful evidence in every case, partial or complete. The ending names what the evidence is and leaves the choice to the decider, an abstract role. Never make completion a condition for reporting.

- **Complete, all GREEN:** "All GREEN in a complete run. This shows what these tests cover and nothing beyond it. Handed to the decider."
- **A RED, run complete:** "A verified failure in `<test>`, with its check and subject, handed to the decider."
- **UNKNOWN, or the run incomplete:** "Observed so far: `<GREEN, RED and UNKNOWN as they stand>`. Unobserved: `<what was skipped, errored or stopped>`. The run is incomplete. Handed to the decider as it stands."
- **RED together with UNKNOWN or an incomplete run:** state both in one report, as above, and hand it on.
