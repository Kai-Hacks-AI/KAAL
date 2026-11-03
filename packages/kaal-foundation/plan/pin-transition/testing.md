# Testing

- Existing: `engineering/acceptance/embed.test.mjs` core dependency map (updated to
  0.0.2) and no-nested-copy check; kaal-change `providers.test.mjs` fixture.
- Native: root `npm ci` plus Acceptance on all three hosts (C16's T51 scenario).
- Negative: a consumer left on 0.0.1 must fail the no-nested-copy check.
- Pre-conditions: this PLAN's decision; no enrolled test is added by the PLAN.
