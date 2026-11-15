# Traceable Requirements: Testing

The planned outer tests will live in `packages/skills/kaal-requirements/test/plan/traceability.test.mjs`, written in `requirements/C11` and turned GREEN by `requirements/C12`. Each title names the contracts it checks. They are immutable to DO and CHECK. What RED and GREEN mean, and what counts as evidence, is Testing's.

| Test | Checks | Loop |
| --- | --- | --- |
| requirements/T15: `Serves` is a `KAAL Definition`. It states its direction, Requirement to Intent, that it transfers no ownership, and that a trigger is not an Intent | requirements/F13 | Requirements |
| requirements/T16: a fixture Requirement Node named `sample/F1`, typed by `Requirement`, with a `Serves` Edge to a fixture Intent Node, is admitted beside Requirements' contribution. The Engine verifies, Graph's `out()` from the Requirement and `in()` to the Intent both show the Edge, and `traverse(intentId, { direction: "in" })` reaches the Requirement | requirements/F12, requirements/F13, requirements/I7 | Requirements |
| requirements/T17: after the fixture Intent changes, the same Edge is reported by `check()` as naming another id, the Engine still verifies, and the Requirement is unchanged | requirements/F14 | Requirements |
| requirements/T18: a capability whose Requirements are still bracket citations is admitted and verifies, and no `Serves` Edge is reported for it | requirements/F15, requirements/N6 | Requirements |
| requirements/T19: the Definition `Requirement` and the Capability Node state the identification rule and `Serves` | requirements/F12, requirements/F16 | Requirements |
| requirements/T20: nothing the package ships imports a module, and it has no dependencies | requirements/N5 | Architecture |

The fixture Intent Node is typed by Intent's Definition `Intent` as `kaal/intent` holds it, so `requirements/C11` and `C12` follow a SYNC that brings it, or `kaal/intent`'s promotion. The Test Cases do not judge whether a trace is right, and they do not test Engineering's isolation judgment, which is `engineering/C11`'s.

## RED evidence

At `requirements/C11`, five tests are RED and requirements/T20 is GREEN, as planned. They run with `npm run build -w kaal-hosting -w kaal-core && node --test packages/skills/kaal-requirements/test/plan/traceability.test.mjs`, outside the package's `npm test` until `requirements/C12`, so the collector's lanes stay green.

| Test | Result at `requirements/C11` |
| --- | --- |
| requirements/T15 | RED, **blocked before behavioural assertion**: `capability/Serves.md` does not exist |
| requirements/T16 | RED, **blocked before behavioural assertion**: `capability/Serves.md` does not exist. Written against the fixture Intent Definition below |
| requirements/T17 | RED, **blocked before behavioural assertion**: `capability/Serves.md` does not exist. Written against the same fixture |
| requirements/T18 | RED on its behavioural assertion: a bracket-citation capability is admitted beside Requirements' contribution and the Engine verifies, but `Serves` is not admitted with the contribution |
| requirements/T19 | RED on its behavioural assertion: the Definition `Requirement` states no identification rule and no `Serves` sentence, and the Capability Node does not name `Serves` |
| requirements/T20 | GREEN: it guards `requirements/N5` through the DO Change |

The test logic of T16 to T18 was checked once against a throwaway `Serves.md`, which was then removed: with it, T16, T17 and T18 pass and only T15 and T19, which need the real text, stay RED.

## The fixture Intent Definition, and what it does not prove

`kaal/requirements` does not carry Intent's Definition `Intent`, and promoting Intent to `main` only to unblock this is not planned. T16 and T17 therefore use `test/fixtures/Intent-Definition.md`, a verbatim copy of `packages/skills/kaal-intent/payload/Intent-Definition.md` on `kaal/intent` at `d1d08f7` (#748). The tests pin its id, `f86d4e30bf200b59da174c7fee0b73e61b2d87e209e34c1ce7938929d3b260ae`, and fail if the copy changes.

- **Not proven:** that a `Serves` Edge reaches Intent's own Node as Intent ships it. T16 and T17 prove Requirements' side against a byte-identical copy, not the end-to-end link.
- **Re-pin obligation:** when Intent reaches `main`, the fixture is compared with Intent's file there. If the bytes and id match, the fixture is replaced by the real Definition. If they differ, the id and the tests are re-pinned in a Change of their own. Until then no readiness or release judgement may count the Requirement → Intent link as proven end to end.

## GREEN evidence

At `requirements/C12`, T15 to T20 are GREEN, unchanged from `requirements/C11`, and the package's `npm test` now runs them with its other tests (17 tests, all passing). T16 and T17 pass against the pinned fixture only: the end-to-end link to Intent's own Definition is still **not proven**, and the re-pin obligation above stands until Intent reaches `main`.

The package's own tests changed in two places, both consequences of the planned text and neither weakening a check: the admission sentence now reads "It provides the Requirement Definition and the `Serves` Definition. For admission it requires Core's KAAL Capability, and nothing else.", and the packed-file list gains `capability/Serves.md`. The ownership claim names the Capability Node's new id.
