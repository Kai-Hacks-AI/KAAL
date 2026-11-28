# Id claims: Testing

The planned outer tests live in `packages/kaal-core/test/plan/id-claims.test.mjs` and `packages/kaal-core/test/plan/id-claims-lane.test.mjs`. Each title names the contracts it checks. They are immutable to DO and CHECK. The DO turns them GREEN and adds them to Core's `npm test`.

They call `judgeIdClaims` and `nextClaim` from `kaal-core/id-claims` with data only. The capabilities, kinds and numbers in them are fixtures, and Core states none.

| Test | Checks | Loop |
| --- | --- | --- |
| core/T142: well-formed claims whose name agrees with their content pass, and a name that disagrees, a missing or extra member, a range, a list, an id that is not a positive integer and a kind that is not a lowercase word are each a `mismatch` | core/F133, core/F134, core/A70 | Requirements |
| core/T143: an existing id below its kind's first claimable number is legacy and not judged, a claim below it is `below-start`, and two claims of one kind and id are a `duplicate` naming both capabilities | core/F135, core/F136, core/A70 | Requirements |
| core/T144: an id used at or above the first claimable number passes when its owner claimed it, is `unclaimed` with no claim, and is `foreign` when another capability claimed it, and an existing legacy record passes whoever holds it | core/F137, core/A70 | Requirements |
| core/T148: a record added below its kind's first claimable number is `below-start`, an existing one is grandfathered, a record added that takes an id already held by another record of the same capability and kind is `reused`, and two existing records that share one are not judged | core/F135, core/F140, core/A70 | Requirements |
| core/T149: the claim's row for the lane's table, `ID_CLAIM_LANE`, is add-only, has Core's claim folder as its one root, and its name pattern admits exactly `<kind>-<id>.json` with the whole name as the uniqueness key | core/A69, core/F133 | Requirements |
| core/T145: a `claims`, `used` or `from` that is not the shape it should be is `unknown` with the fact named, never a pass | core/F138, core/N34, core/A70 | Requirements |
| core/T146: `nextClaim` is one above the highest claim of its kind or the first claimable number when there is none, never fills a gap, gives the same answer twice, answers each kind on its own, and is null with a reason for a kind not in `from` or a claim it cannot read | core/F139, core/N34, core/A70 | Requirements |
| core/T147: the verdict and the findings do not depend on the order of the claims or the uses | core/N34, core/A70 | Requirements |

## RED evidence

Run with `npm run build -w kaal-core && node --test packages/kaal-core/test/plan/id-claims.test.mjs`, outside Core's `npm test` until the DO. At `core/C251` all eight are RED, blocked before behavioural assertion, because `kaal-core` exports no `./id-claims`.
