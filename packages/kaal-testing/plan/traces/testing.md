# Case Traces: Testing

The planned outer tests live in `packages/skills/kaal-testing/test/plan/traces.test.mjs`. Each title names the contracts it checks. They are immutable to DO and CHECK. `testing/C49` turns them GREEN and adds them to Testing's `npm test`. Files are given as plain data. The tests own every expected trace and finding.

| Case | Checks | Loop |
| --- | --- | --- |
| testing/T98: each Case in a case location declares its targets in its own title, bare identifiers are its owner's, and the derived model is Testing's model | testing/F84, testing/N7 | Requirements |
| testing/T99: only case files in a case location are read, and a file elsewhere traces nothing | testing/F85 | Requirements |
| testing/T100: a title that cannot be read statically, a malformed target, or a Case named twice is a finding, never a trace | testing/F86 | Requirements |
| testing/T101: the derived relationship is traversable both ways: edges out of each Case, and the Cases that test a target | testing/F87 | Requirements |
| testing/T102: deriving is pure and deterministic, reads only case calls in the text given and never executes it | testing/N18, testing/F86 | Requirements |

## RED evidence

The tests run with `node --test packages/skills/kaal-testing/test/plan/traces.test.mjs`, outside Testing's `npm test` until `testing/C49`. At `testing/C48`, all five are RED, each **blocked before behavioural assertion**, because kaal-testing exports no `./traces`.

**Checked against a throwaway implementation.** A26 was implemented outside the repository, and all five pass against it. It was also run on the real case files of Testing, Core and Guard (see the architecture). Of 34 mutants, 33 fail at least one test. The mutants cover:
- the legacy location dropped;
- any target, or only a qualified identity, accepted;
- a call matched anywhere, or `test(` missed;
- a template substitution, a single-quoted title or an escaped quote mishandled;
- a malformed file skipped silently;
- a location matched anywhere in the path, or a file that is not `.test.mjs` read;
- a non-literal title, an untraced title, a malformed target or a repeated target dropped silently;
- the caller's owner overriding the Case's own, or used alone;
- a qualified target re-qualified;
- the identity left bare, or the title used as the identity;
- a bare identity with no owner accepted;
- a duplicate Case traced, or reported without naming both files;
- cases or findings left unordered;
- edges kept beside a model's finding, from a retired Case, under another name, or unordered;
- an inherited key read as a target's Cases;
- files that are not a list accepted.

One mutant survives, and it is equivalent: dropping the empty-bracket check, since an empty bracket gives one empty target, which the identifier check already refuses.

testing/N18's "imports only `kaal-testing/model`" is checked by review of `testing/C49`.
