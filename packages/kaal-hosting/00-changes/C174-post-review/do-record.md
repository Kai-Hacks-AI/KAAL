# C174 DO record

The DO on the merged PLAN (#2995): `scripts/github/app-reviews.ts` (`postReview`), the codes `INVALID_REVIEW`, `REVIEW_MISMATCH` and `REVIEW_FAILED` in `scripts/github/app-error.ts`, the export in `scripts/index.ts`, the drafts `post-review.red.mjs` delivered as `04-test/package-check/app-reviews.test.mjs` with their bodies and assertions unchanged (only the header comment and the fixtures' import path differ), the ids F114 and A51 (free on `main` and every remote branch at the PLAN), T356 to T359 (the allocation row), and the README and operations entries.

- One POST bound to the named commit, with no read before or after and no retry. GitHub's answer is compared with the request and with the App's own identity before the approval is reported; a failure keeps the status and the headers so that `refusalOf` of C116 can tell a refusal from a failure.
- The drafts passed on a throwaway implementation before the PLAN merged; the DO is that implementation placed on the collector, with the documentation. No Case changed.

Not done: no approval decision (Review's), no workflow (Release, C173), no declaration file or key (Review and the Owner), no other event than APPROVE, no WIRE, no publication.
