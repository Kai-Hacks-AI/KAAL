# Typed Artifacts and Type States: Testing

The planned outer tests live in `packages/kaal-core/test/plan/admission.test.mjs`. Each title names the contracts it checks. They are immutable to DO and CHECK. `core/C11` turns them GREEN, adds them to Core's `npm test`, and may add Code tests of its own.

| Test | Checks | Loop |
| --- | --- | --- |
| core/T23: a `<Capability>/<Type>` frontmatter is a typed artifact wherever it is, and a Node in Form under `.kaal/config/<capability>/` is still admitted | core/F23, core/F25 | Requirements |
| core/T24: a Node with `type: KAAL Skill`, `type: guard/check` or `type: Guard` stays rejected as not in Form | core/F24 | Requirements |
| core/T25: with no Definition of that name, the Type is unregistered, with a next step | core/F28 | Requirements |
| core/T26: with one Type Definition owned by the prefix's Capability, the Type is registered | core/F26, core/F27 | Requirements |
| core/T27: two Nodes of that name, a Definition without a Capability, or one owned by another Capability, make the Type unknown | core/F29 | Requirements |
| core/T28: a supplied schema the frontmatter fails makes the artifact invalid with `core/C6`'s findings, registered or not | core/F30 | Requirements |
| core/T29: registering the Definition afterwards turns the same unchanged bytes from unregistered to registered | core/I8, core/F31, core/N9 | Intent |
| core/T30: the same files and Types give the same result | core/N8 | Requirements |
| core/T31: `kaal verify` passes with an unregistered artifact and lists it, leaves it unchanged, and fails on an unknown one | core/F32, core/N9 | Requirements |

`core/A10`, `core/A11` and `core/A13` are placements. They are validated by review, and `core/C11` keeps Core's existing boundary test for imports.

## RED evidence

At `core/C9`, all nine tests are RED, and each is **blocked before behavioural assertion**, because `evaluate` returns no `artifacts`. They run with `npm run build -w kaal-core && node --test packages/kaal-core/test/plan/admission.test.mjs`, outside Core's `npm test` until `core/C11`.
