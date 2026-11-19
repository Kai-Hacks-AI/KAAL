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

**Handover:** this run has a RED and UNKNOWN in an incomplete run, so it goes two ways. The RED, `tax.test.mjs > taxes a refund` with its failing check, goes to whoever fixes the subject. The UNKNOWN tests and the incomplete run go back to completing the observation: provide the rate table, build or drop the French printing, raise the time bound for `export.test.mjs`, and run again. Nothing goes to the decider until the run is complete.

## Endings by outcome

End the report with the one that matches the run. Each names an abstract role, never a concrete one.

- **Complete, all GREEN:** "All GREEN in a complete run. This shows what these tests cover and nothing beyond it. The decider takes the result and chooses what follows."
- **A RED, run complete:** "A verified failure in `<test>`, with its check and subject. Whoever fixes the subject takes it; a fix is observed again before anything else follows."
- **UNKNOWN, or the run incomplete:** "Not complete: `<what was skipped, errored or stopped>` is unobserved. Complete the observation first, then report again. No result is handed on yet."
- **RED together with UNKNOWN or an incomplete run:** both of the above, each part to its own destination, as in the report above.
