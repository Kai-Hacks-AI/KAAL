# C169 DO record

The DO on the merged PLAN (#2978): `scripts/github/app-checks.ts` (the external-id comparison and the key checks over every own key, symbols included), the drafts `post-check-contract.red.mjs` delivered as T354 and T355 in `04-test/package-check/app-checks.test.mjs` with their bodies and assertions unchanged (only the header comment differs), the wording of hosting/F112 and hosting/A49, and the allocation row. No new element and no new id beyond T354 and T355.

- The drafts were red on `main` (hosting/C117) and green on this implementation before the PLAN was approved; the DO is that implementation placed on the collector. No Case changed.
- The external id is reported only as GitHub returned it; when none was asked, GitHub's empty, null or absent id is none and any text it invented is `CHECK_MISMATCH`.

Not done: no retry, no update or listing of check runs, no workflow, no WIRE, no publication.
