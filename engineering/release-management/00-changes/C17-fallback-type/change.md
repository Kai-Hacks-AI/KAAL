# C17 change

## PLAN

1. Add F19 with the Cases T182 and T183, and C17 with the gap Case T184, one per gap.
2. The expected RED is observed against the collector (`evidence.md`).
3. DEFAULT keeps its name, its declaration on the first line and its two chapters. It becomes a TYPE: title `DEFAULT: <meaningful description>`, applied only when no specialized TYPE fits, never outranking a specialized TYPE.

## DO

1. Add F19, replace the sentence of F18 that says DEFAULT is not a TYPE by a pointer to F19, and rename T182 to T184 to `.test.mjs`.
2. The delivered Case T174 asserts the sentence F18 loses. It is changed in the same DO to assert the pointer to F19, and the DO names that change, because it follows the Owner's ruling and not a wish to go green. The other assertions of T174 stay.

## ACT

1. A 4L retrospective in `act.md`, landing in the collector before the promotion of release/C14.

## Dependencies

- release/C12 (check PR Envelope) holds the registry of TYPEs and the finding for a title whose TYPE is DEFAULT. Its reader must accept DEFAULT as a TYPE once this Change is delivered. That change is for the C12 thread and is not made here.
- release/C14 is not promoted before this Change lands in its collector.
- release/C15, the wiring, comes after.
