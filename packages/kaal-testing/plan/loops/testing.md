# Loops as a Graph: Testing

The planned outer tests will live in `packages/kaal-testing/test/plan/loops.test.mjs`, one title per Case naming the contracts it checks. This PLAN states them and does not write the file: it follows once this PLAN is approved, so that no RED file sits unreferenced on `kaal/testing` (the situation this Change exists to end). The DO turns them GREEN and adds the file to Testing's scripts. No existing Case is changed.

| Case | Checks | Loop |
| --- | --- | --- |
| testing/T128: a declaration with a missing, empty, duplicated or overlapping level, kind or location is a finding; one loop, four loops and six loops each work | testing/F105, testing/N24 | Requirements |
| testing/T129: a Case in a declared location with a target of its own level has no finding; a Case in no location, or targeting another level, is a finding | testing/F106 | Requirements |
| testing/T130: an Edge to an inner level, any same-level Edge other than Defect to Requirement, and a cycle are each a finding; a Defect to the Requirement it reveals is allowed; a Requirement to a Defect is a finding | testing/F107, testing/F109 | Requirements |
| testing/T131: a target that is not a Node, an unresolved reference, and a kind the declaration does not place give `unknown`, never `outward` | testing/F108 | Requirements |
| testing/T132: `answered` is `established` only with a confirming Run, the revealed Requirement and a latest pass at the same version for every item down to code; it names the first missing item otherwise | testing/F110 | Requirements |
| testing/T133: `plan` by loop, by Change (with `unknown` impact reported), by `red` and by `promotion` gives the Cases and files expected | testing/F111 | Requirements |
| testing/T134: an open Defect's Case failing is `red as expected` with the Run's `failed` kept; a pass is `unexpectedly green`; a failure after the answer is a regression; the role is never given by `skip` or `todo`, and a skipped or `todo` Case stays RED and reported (testing/F2) | testing/F112 | Requirements |
| testing/T135: a Plan run by file and name pattern maps each reported test to its Case; an unmapped test and an unreported Case are `unknown` | testing/F113 | Requirements |
| testing/T138: a Case file named for its item in that item's folder has the folder's loop and the Node as target; a file in no covered folder, with no such item, or targeting another level, is a finding | testing/F106 | Requirements |
| testing/T139: a suite collected by trace from the graph contains exactly the expected Cases; an incomplete graph gives `unknown`, and a judged addition is reported as judged, apart from the computed part | testing/F115 | Requirements |
| testing/T140: a Case moved beside its Node keeps its T-number and its citations, is re-derived from the new place, appears in the migration record, and gets a new version so earlier Runs and a pre-move confirmation no longer stand | testing/F116 | Requirements |
| testing/T136: `promotion` counts open Defects; adding a RED Case raises the count and answering one lowers it | testing/F114 | Requirements |
| testing/T137: `loops` is pure and deterministic and imports only `kaal-testing/model` and `kaal-testing/traces` | testing/N23, testing/A31 | Architecture |

## RED evidence

Not yet shown. Testing exports no `./loops`, so at the DO every Case above is blocked before a behavioural assertion, as testing/T116–testing/T122 were for `./defect`.

## Trace

Each title's first bracket is its trace target. testing/I29–testing/I32 are served by testing/F105–testing/F114, realized by testing/A31–testing/A33.
