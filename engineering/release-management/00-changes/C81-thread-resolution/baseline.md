# C81 baseline

The baseline is `main` (104b17e), with no commit of this Change.

- `05-src/wiring/rulesets/integrating.json` holds a `pull_request` rule with `required_approving_review_count` 1, `dismiss_stale_reviews_on_push` true, `require_code_owner_review` false, `require_last_push_approval` false and `required_review_thread_resolution` **false**. The bypass list is empty.
- `05-src/stages/stages.json` declares that rule for Integrating, traced to release/CTL10, with the same settings (thread resolution false).
- release/CTL10 has one Intent, release/I36 (approval and staleness). No Intent mentions threads.
- The old integration ruleset (24952357) and the old promotion ruleset (24951062), read live on 18 Nov 2026, both have `required_review_thread_resolution` true.
- No workflow in `.github/workflows` or `05-src/wiring/workflows` creates an inline review comment (checked by search for the review-comment endpoints and review-thread calls); the sync review reports as a review or a check.
- Nothing is loaded: the `integrating` ruleset (27372397) live holds the status checks only.
