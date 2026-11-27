# C116 ACT: retrospective (4L)

Written by the agent that carried the Change.

## Liked

- The seed was a working script (Release's `wait-for-checks.mjs`), so the PLAN could name the library surface (a pure schedule, a refusal test, a retry wrapper over a read function) and the Cases could be executable drafts. The DO delivered T341 to T344 with their bodies and assertions unchanged.
- The split kept Hosting to mechanics: it decides whether a read was refused and how long to wait, never whether a verdict passes. Controls can expose it without owning any of it.
- A permission 403 is not a refusal. Pinning that in a Case keeps a missing ability from being retried until it looks like a rate limit.

## Learned

- A draft that uses a clock needs a clock that records. A clock object holding `slept` was rejected by the option check as unknown; a non-enumerable property fixed it. Write the draft's clock first and run it.
- Reading a `Headers` object and header names in any case costs little and removes a trap, because `fetch`, `gh` text and plain objects all answer differently.
- Only one open PR can use the dedicated branch, so the ACT waited for the next Change's PLAN and its amendment to merge. Order the PRs knowing that.

## Lacked

- The rate-limit log (`readRateLimit`). It reads through a grant and follows C114 on `main`, so it is its own Change.
- Evidence of the library under real load. It is exercised only by stand-ins; operational effectiveness remains to be demonstrated, as the CPO said.

## Longed For

- Release's C164 and Controls calling the library instead of a copy, so there is one definition of a wait.
- A shared name for which statuses count as a refusal across the packages.

## Follow-ups

- Rate-limit log as its own Change after C114 is on `main`.
- Controls exposes the library; Release moves its script onto it. Hosting does not edit either.
- No poll loop, workflow, WIRE or publication is authorized by this Change.
