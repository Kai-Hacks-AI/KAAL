# Capability Registration and One-Way Traceability: Testing

The planned outer tests live in `packages/kaal-core/test/plan/registration.test.mjs`. Each title names the contracts it checks. They are immutable to DO and CHECK.

`core/C26` turns them GREEN, adds them to Core's `npm test`, and may add Code tests of its own. The tests give registrations as their frontmatter content. The kind registrations they use carry exactly the Owner-corrected rules of `core/F51`.

| Test | Checks | Loop |
| --- | --- | --- |
| core/T50: two claims of one namespace are a collision naming both, and none of its artifacts resolves | core/I15, core/F49 | Intent |
| core/T51: `sample/F2` is its namespace's artifact of kind F, ruled by F's owner, under its own identity | core/F48, core/A26 | Requirements |
| core/T52: two definitions of one kind collide; an artifact of an undefined kind is a finding | core/F50 | Requirements |
| core/T53: every Owner-corrected step is permitted; an omitted one, alone and acyclic, is a rule finding naming source and target | core/I16, core/F51, core/F52 | Intent |
| core/T54: C traces to nothing; a self-trace, under a rule that permits its own kind, is an observed cycle of one, and a finding only when the kind's owner declares it `acyclic`; rules hold across namespaces | core/F51, core/F52, core/F53 | Requirements |
| core/T55: an unresolved target is a finding, and nothing is inferred for it | core/F52, core/F55 | Requirements |
| core/T56: incoming views are derived, and a stated incoming trace is refused | core/N15, core/F54 | Requirements |
| core/T57: `reach` terminates on a cycle and yields each artifact once; A1 → D1 → T2 → A1 is observed in `cycles`, is no finding without a declaration or with one on a kind off the cycle, and is a finding naming D's owner when D is declared `acyclic`; cycles and findings are the same in any order | core/F53, core/N14, core/A27 | Architecture |
| core/T58: an artifact that states no trace is untraced, not failed and not inferred | core/I16, core/F55, core/F56 | Intent |
| core/T59: order does not matter, and no registrations give an empty result | core/N14, core/N16 | Requirements |

The following are validated by review:
- `core/A25` and `core/A28` are placements.
- `core/A27`'s use of Graph is reviewed at `core/C26`, together with its two Stops.
- `core/F56`'s `kaal verify` behaviour is tested at `core/C26` against an Engine with registrations, and Core's existing `verify` tests keep the no-registration case.

## RED evidence

At `core/C24`, all ten tests are RED, and each is **blocked before behavioural assertion**, because kaal-core exports no `./registration`. They run with `npm run build -w kaal-core && node --test packages/kaal-core/test/plan/registration.test.mjs`, outside Core's `npm test` until `core/C26`.
