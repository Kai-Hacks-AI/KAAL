# Capability Registration and One-Way Traceability: Testing

The planned outer tests live in `packages/kaal-core/test/plan/registration.test.mjs`. Each title names the contracts it checks. They are immutable to DO and CHECK.

`core/C26` turns them GREEN, adds them to Core's `npm test`, and may add Code tests of its own. The tests give registrations as their frontmatter content.

**The fixtures.** Since `core/C30`, each fixture kind is referred to by its owner's scope, and a Test Case traces to the Defect it tests (#583).
- **Kinds.** The kinds and rules in the tests are fixtures, registered by fixture kind owners. Core prescribes none of them (`core/F51`). The fixture Testing kind registers an open rule (`any`).
- **Instances.** The content is held by a consuming repository, `acme-product`. Its identities follow no shared grammar: `REQ-001`, `NFR.1`, `defect:1`, `bb/store`, `case 1` and `src/store.ts`. So a test passes only if Core reads identities as opaque text and takes each kind from the registration.

| Test | Checks | Loop |
| --- | --- | --- |
| core/T50: two claims of one scope are a collision naming both, and none of its instances resolves; one identity stated twice in a scope is a finding | core/I15, core/F49 | Intent |
| core/T51: an identity is opaque text, unique within its scope. The kind is the stated one, even when the spelling looks like another kind. Content held by a consumer keeps its identity, and one identity in two scopes is two instances | core/F48, core/A26 | Requirements |
| core/T52: a kind is qualified by its owner's scope: two Capabilities naming a concept alike define two kinds, each judged by its own rule; a kind in a collided scope does not resolve; an instance of an undefined kind, and a rule naming an undefined kind in any scope, are findings | core/F50, core/F51 | Requirements |
| core/T53: what is permitted is exactly what the registered rules permit. Each omitted step, standing alone, is a rule finding. With F's rule changed by its owner, the same instances get the opposite verdict | core/I16, core/F51, core/F52 | Intent |
| core/T54: an empty rule permits nothing; an open rule permits any registered kind, a later-registered one included, but resolves no missing target; a self-trace is a cycle of one, a finding only when its kind's owner declares `acyclic`; rules hold across scopes | core/F51, core/F52, core/F53 | Requirements |
| core/T55: an unresolved target is a finding, and nothing is inferred for it | core/F52, core/F55 | Requirements |
| core/T56: incoming views are derived, and a stated incoming trace is refused | core/N15, core/F54 | Requirements |
| core/T57: `reach` terminates on a cycle and yields each instance once. case 1 → src/store.ts → case 1 is observed in `cycles`. It is no finding without a declaration, or with one on a kind off the cycle, and is a finding naming Code's owner when Code is declared `acyclic`. Cycles and findings are the same in any order | core/F53, core/N14, core/A27 | Architecture |
| core/T58: an instance that states no trace is untraced, not failed and not inferred | core/I16, core/F55, core/F56 | Intent |
| core/T59: order does not matter, and no registrations give an empty result | core/N14, core/N16 | Requirements |
| core/T72: a term several owners define is one report, unaligned, naming each scoped kind with its owner and definition, and the relationships their rules state. The kinds stay distinct, identical definitions included. The report is no finding, does not depend on order, and a term one owner defines is no report | core/I21, core/F66, core/A26 | Intent |
| core/T73: a bare kind name resolves only in its own scope. Where it does not, the finding lists every scope defining that name, a lone candidate included, and no candidate is chosen. A qualified reference resolves | core/F50, core/F67 | Requirements |
| core/T67: a hierarchy is a kind whose owner's rule permits its own kind. Children state their parent, a parent's children are derived, `acyclic` is the owner's choice, and a cross-tree trace needs nothing more. Core requires no tree | core/F51, core/F53, core/F54 | Intent |

**Why the tests discriminate.** Each of the following implementations satisfies a weaker contract. I checked each one against the tests with a throwaway reference implementation, which was not committed, and the tests caught every one:

| Implementation | Caught by |
| --- | --- |
| reads an instance's kind from its identity's spelling | core/T51 |
| enforces an identity grammar | core/T51, T53, T54, T57, T58 |
| holds a built-in trace matrix | core/T53 |
| keeps Testing's rule a closed list of other kinds | core/T54 |
| treats `any` as permitting nothing | core/T51, T53, T54, T56, T57 |
| accepts a rule naming an undefined kind | core/T52 |
| allows one identity twice in a scope | core/T50 |
| makes identities unique globally instead of per scope | core/T51, T53, T54, T56, T57 |
| accepts a stated incoming trace | core/T56 |
| keeps kind names global, so two Capabilities' `F` collide (`core/C24`'s first reading) | core/T51, T52, T53, T54, T57, T58, T67 |
| matches a rule by kind name, ignoring the kind's scope | core/T52 |
| resolves kinds defined in a collided scope | core/T52 |
| always permits a kind to trace to itself | core/T67 |
| ignores `acyclic` | core/T54, T57, T67 |
| reports no shared term | core/T72 |
| reports a term one owner defines | core/T72 |
| reports a shared term as aligned | core/T72 |
| merges kinds that share a definition | core/T72 |
| infers relationships among the candidates | core/T72 |
| reports a shared term as a finding | core/T72, T73 |
| resolves a bare name to the lone other scope defining it | core/T73 |
| resolves a bare name to the first candidate | core/T73 |
| lists no candidates | core/T73 |
| lists only one candidate | core/T73 |

The reference implementation turned all ten GREEN. At `core/C30`, a reference revised to qualified kinds turned all eleven GREEN and caught each of the five rows from "keeps kind names global" to "ignores `acyclic`". Revised again to report shared terms, it turned all thirteen GREEN and caught each of the last ten rows.

The following are validated by review:
- `core/A25` and `core/A28` are placements.
- `core/A25`'s frontmatter is accepted by `verify` only once `core/C27` lands. `core/C26` checks it with a Registration Node, because the tests here hand `assemble` objects directly.
- `core/A27`'s use of Graph is reviewed at `core/C26`, against `graph/C2` (#562).
- `core/F56`'s `kaal verify` behaviour is tested at `core/C26` against an Engine with registrations, and Core's existing `verify` tests keep the no-registration case.
- Whether a kind owner's identities follow its own grammar is that owner's local check (`core/I17`), not Core's.

## RED evidence

At `core/C24`, all ten tests are RED. At `core/C30`, all thirteen are RED for the same reason, and each is **blocked before behavioural assertion**, because kaal-core exports no `./registration`. They run with `npm run build -w kaal-core && node --test packages/kaal-core/test/plan/registration.test.mjs`, outside Core's `npm test` until `core/C26`. This is planning evidence, not discriminating behavioural RED. The discrimination is the reference-implementation table above.
