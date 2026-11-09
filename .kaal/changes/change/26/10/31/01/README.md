# change/C9 PLAN: what a Change changes, and its selected scope

Capability: `kaal-change`. Collector: `kaal/change`.

## Why

The Owner approved #716 (`engineering/C11`, Option B). Its traceability PLAN, `engineering/change-isolation/traceability.md`, names prerequisite P1 as Change's: a Change Node must state which elements it changes, by their owners' identities such as `hosting/F31`, and its selected scope, by capability and never by path or PR. Engineering reads both and defines neither.

## How

This is a PLAN Change. It ships no code.

- **Intent.** change/I16 to change/I18: a Change states what it alters and its selected scope. Both are optional, additive outgoing statements beside `delivers` and `requires`.
- **Requirements.** change/F33 to change/F37 and change/N8 cover the following.
  - `alters` is a nonempty list of owner identities. `scope` is a nonempty list of capability namespaces.
  - A malformed statement is withheld whole, as a `malformed-alters` or `malformed-scope` finding.
  - The views `alters(identity)` and `scope(identity)` give a sorted list, or `undefined` when not stated. The exchange carries both only when stated well-formed.
  - Delivery is unchanged. Change states and Engineering judges: `assess` reads no paths and no ownership claims.
- **Architecture.** change/A17 makes these identities, not Edges, for now.
- **Tests.** change/T36 to change/T40 are in `test/plan/scope.test.mjs`.

The statement is named `alters`, not `changes`, because `assess` already returns a `changes` list (change/F13). A view of the same name would break every existing consumer.

## Verified by

- All five tests in `packages/skills/kaal-change/test/plan/scope.test.mjs` are RED, blocked before behavioural assertion, because `./delivery` is not exported until change/C8 (#662) merges.
- All five, and the eighteen delivery PLAN tests, ran GREEN against a throwaway that put this PLAN onto the C8 DO. The throwaway is not committed.
- `npm test` in `packages/skills/kaal-change` passes, 68 of 68.

## Ownership claim (P3)

Change's claim already exists as `packages/skills/kaal-change/ownership.kaal.json`. It moves to `ownership.kaal.md` in a Change of its own once testing/C25 and Engineering's `measure.mjs` land (#609, migration step 5).
