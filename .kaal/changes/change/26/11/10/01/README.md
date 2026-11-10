# PRE-DO tests: FAR authorization (PLAN-type Change, replaces superseded Cases openly)

Capability: Change. Integration scope: Change only (tests; no library code).
Collector: kaal/change. Destination: main through a separate promotion.
Base: kaal/change after the FAR authorization PLAN (#1342, CPO-approved).

## Request

#1342 requires the pre-DO test Change to replace the planned Cases the revised contract supersedes, openly and under their identities, and to add T60–T66 as RED Cases. This is that Change. It is a PLAN-type Change and needs the designated authority's decision (change/F51). The DO is judged by the result and cannot edit it.

## Change

`packages/kaal-change/test/plan/far.test.mjs`:
- Replaced under their identities: **T10** (cite names the Change, boundary, authorizing PLAN, landing and authority), **T15** (no transfer across Change or boundary; a revision alone neither authorizes nor voids; a Case digest that differs gets no exception), **T16** (Features definitions at the PLAN's landing, Regression at the protected baseline, Cases by identity and digest; a Case added later gets no exception).
- Adapted mechanically to the revised record and signatures, assertions unchanged: **T13** (`compose` takes `definedAt` and `at` and the gate's context) and **T14** (adds: no Accept needs no authorization). T11 and T12 only gain the context argument.
- Unchanged: **T9**.
- New RED Cases: **T60** (authorization names the PLAN, landing and authority), **T61** (authority, self-authentication, `approve`), **T62** (`integrity`, with or without an Accept), **T63** (pre-landing approval vs post-landing authorization), **T64** (`lifecycle`), **T65** (one boundary), **T66** (fail closed).

Revised public shape (the contract the DO implements): `exceptions(record, integration, plans, context)` and `compose(record, integration, plans, evaluations, context)` with `context = { designation, landing, baseline, head, digests, state }`; new exports `authorize`, `approve`, `integrity`, `lifecycle`; a record holds `authorization = { plan, by, evidence }` only with an Accept and holds no landing commit.

## Verification

All 15 Cases are RED and each is blocked before behavioural assertion, because `kaal-change` exports no `./far`. The file stays outside `npm test` until the DO Change. `npm test` in `packages/kaal-change` is unchanged.

## Boundary

Tests only. No library code, no promotion, publication or version bump, no gate activation. G13 (where the authority is read from) stays open: `context.designation` is data, and these Cases fix no source for it.
