# C116 DO record

The DO on the merged PLAN: `scripts/github/waiting.ts` (`pollSchedule`, `refusalOf`, `retryWait`, `retryRead`, `WaitingError`), its exports, the draft `waiting.red.mjs` delivered as `04-test/package-check/waiting.test.mjs` with its bodies and assertions unchanged (only the header comment changed), the ids I24, F108 to F111, A48 and T341 to T344 (free on `main` and every remote branch), the allocation row, README and operations entries.

- `refusalOf` also reads a `Headers` object (anything with `get`) and header names in any case, because `fetch` answers with the first and `gh` text with neither; the Cases pin the plain-object form.
- A status found in a command's text (`HTTP 502`) is read the same as a status field.
- The rate-limit log is not here: it reads through a grant and follows C114 on `main`.

Not done: no change to Release's C164 or its Cases, no poll loop, no workflow, no WIRE, no publication.
