# Capability Registration and One-Way Traceability: Testing

The planned outer tests live in `packages/kaal-core/test/plan/registration.test.mjs`. Each title names the contracts it checks. They are immutable to DO and CHECK.

`core/C26` turns them GREEN, adds them to Core's `npm test`, and may add Code tests of its own. The tests give registrations as their frontmatter content.

**The fixtures.**
- **Kinds.** The kinds and rules in the tests are fixtures, registered by fixture kind owners. Core prescribes none of them (`core/F51`). The fixture Testing kind registers an open rule (`any`).
- **Instances.** The content is held by a consuming repository, `acme-product`. Its identities follow no shared grammar: `REQ-001`, `NFR.1`, `defect:1`, `bb/store`, `case 1` and `src/store.ts`. So a test passes only if Core reads identities as opaque text and takes each kind from the registration.

| Test | Checks | Loop |
| --- | --- | --- |
| core/T50: two claims of one scope are a collision naming both, and none of its instances resolves; one identity stated twice in a scope is a finding | core/I15, core/F49 | Intent |
| core/T51: an identity is opaque text, unique within its scope. The kind is the stated one, even when the spelling looks like another kind. Content held by a consumer keeps its identity, and one identity in two scopes is two instances | core/F48, core/A26 | Requirements |
| core/T52: two definitions of one kind collide; an instance of an undefined kind, and a rule naming an undefined kind, are findings | core/F50, core/F51 | Requirements |
| core/T53: what is permitted is exactly what the registered rules permit. Each omitted step, standing alone, is a rule finding. With F's rule changed by its owner, the same instances get the opposite verdict | core/I16, core/F51, core/F52 | Intent |
| core/T54: an empty rule permits nothing; an open rule permits any registered kind, a later-registered one included, but resolves no missing target; a self-trace is a cycle of one, a finding only when its kind's owner declares `acyclic`; rules hold across scopes | core/F51, core/F52, core/F53 | Requirements |
| core/T55: an unresolved target is a finding, and nothing is inferred for it | core/F52, core/F55 | Requirements |
| core/T56: incoming views are derived, and a stated incoming trace is refused | core/N15, core/F54 | Requirements |
| core/T57: `reach` terminates on a cycle and yields each instance once. bb/store → defect:1 → case 2 → bb/store is observed in `cycles`. It is no finding without a declaration, or with one on a kind off the cycle, and is a finding naming D's owner when D is declared `acyclic`. Cycles and findings are the same in any order | core/F53, core/N14, core/A27 | Architecture |
| core/T58: an instance that states no trace is untraced, not failed and not inferred | core/I16, core/F55, core/F56 | Intent |
| core/T59: order does not matter, and no registrations give an empty result | core/N14, core/N16 | Requirements |

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

The reference implementation turned all ten GREEN.

The following are validated by review:
- `core/A25` and `core/A28` are placements.
- `core/A25`'s frontmatter is accepted by `verify` only once `core/C27` lands. `core/C26` checks it with a Registration Node, because the tests here hand `assemble` objects directly.
- `core/A27`'s use of Graph is reviewed at `core/C26`, against `graph/C2` (#562).
- `core/F56`'s `kaal verify` behaviour is tested at `core/C26` against an Engine with registrations, and Core's existing `verify` tests keep the no-registration case.
- Whether a kind owner's identities follow its own grammar is that owner's local check (`core/I17`), not Core's.

## RED evidence

At `core/C24`, all ten tests are RED, and each is **blocked before behavioural assertion**, because kaal-core exports no `./registration`. They run with `npm run build -w kaal-core && node --test packages/kaal-core/test/plan/registration.test.mjs`, outside Core's `npm test` until `core/C26`.
