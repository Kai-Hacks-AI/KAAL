# kaal-defect record definition: Testing

The planned outer tests live in `packages/skills/kaal-testing/test/plan/defect-record.test.mjs`. Each title names the contracts it checks. They are immutable to DO and CHECK. A later DO turns them GREEN and adds the file to Testing's scripts. No existing Case is changed.

| Case | Checks | Loop |
| --- | --- | --- |
| testing/T116: a well-formed record has no findings; a missing or empty required member, a duplicate `id`, an unknown key and an unknown `status` word are each a finding | testing/F98, testing/F99 | Requirements |
| testing/T117: `reported` carries no `tests`; `confirmed` and `answered` each name at least one Case | testing/F99 | Requirements |
| testing/T118: `confirmed` stands only with one common Run of Testing's model where every named Case failed; a passing, unknown or absent Case, Cases failing only in separate Runs, or a Run with model findings, is a finding | testing/F99, testing/F100 | Requirements |
| testing/T119: `answered` stands only with, for each named Case, a later Run where it passed; an earlier or missing passing Run, or a later `failed` or `unknown` as the Case's latest observation, is a finding | testing/F99, testing/F100 | Requirements |
| testing/T120: the same record and Runs give the same result, and `kaal-testing/defect` imports no host module and no other capability | testing/N21, testing/A29 | Architecture |
| testing/T121: provenance that does not identify a named Case, or identifies it at different versions in the confirming and the answering Run, or a pass of a different Case version, answers or confirms nothing | testing/F99, testing/F100 | Requirements |
| testing/T122: passing Runs for different Cases may differ, each tied to the confirming Run's Case version; one Case's pass does not answer another's | testing/F99 | Requirements |

## RED evidence

The tests run with `node --test packages/skills/kaal-testing/test/plan/defect-record.test.mjs`, outside Testing's `npm test` until the DO. At `testing/C54`, all seven are RED, each **blocked before behavioural assertion**, because kaal-testing exports no `./defect`. The file has no `todo` or `skip` marker.

Each title's first bracket is its trace target; a Defect-related Case traces to the Defect subject it guards.
