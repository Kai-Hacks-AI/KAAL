# Supplied-model isolation

The installed package exports `isolate` from `@kaihacksai/kaal-change/isolation`.
Use its public TypeScript declarations for the full transport contract. This
guide explains how to call it; it does not establish the authority of its inputs.

```js
import { isolate } from '@kaihacksai/kaal-change/isolation';
const assessment = isolate(proposal, model);
```

The proposal is `{ref: {name, id}, alters: ['owner/F1'], scope: ['owner']}`.
Its exact Change reference must resolve through Graph to a Node stating those
same alters/scope lists and match `model.change`. Lists are nonempty and unique;
identities use `namespace/LETTERS<number>`, scopes use capability namespaces.

The model is `{change, owners, sources, graph}`. `owners` names the expected
capability inventory. Each source is `{owner, ref: {name, id}}`; its pinned Node
exposes `frontmatter.inventory` with these lists:

| Entry | Required information |
| --- | --- |
| `elements` | `{identity, kind, ref}`; owned identity and resolving reference |
| `interfaces` | `{identity, ref, from, to, contract: {name, id}}` |
| `traces` | `{source: Ref, type: Ref, target: Ref, boundary: string or null}` |

Kinds describe Intent, functional/nonfunctional Requirements, Defects,
Architecture, Cases and realizations; their semantics remain owner-defined.
An interface's endpoints name inventoried elements. A boundary trace names the
interface joining its endpoints. An explicit null boundary denotes a semantic
reference, not an inferred runtime call. Supply Graph's `resolve`, `check`, `out`
and `traverse` public operations; do not implement another graph engine.

Owner adapters assemble these inventories from actual source formats. Keep the
evidence references, limitations and any manual projection decisions visible.
Never use the controlled example as evidence of a target repository's coverage.
An internally consistent smaller model can still omit real dependencies.

| Result | Interpretation and action |
| --- | --- |
| `isolated` | No violation or unknown was found within the supplied model. Review the reported surroundings, boundaries and obligations. |
| `violated` | Read the named malformed statement or unsupported selected scope; correct the proposal or obtain a decision. |
| `unknown` | Obtain the named missing owner/source/trace/interface evidence or preserve the unresolved finding. |

`selected` and `impact` are distinct. `affectedOutside` names potential impact
outside the selection; `dependencies`, `boundaries` and `externalReferences`
explain the surrounding context. `obligations` names required evidence across
the three loops, with incoming drivers, outgoing controlled collaborators,
real subjects, regression, contract and real-integration work as applicable.

`authority.status` is always `unestablished`, with `supplied-model-only`
coverage. `execution.status` and every obligation remain `not-assessed`.
`proposal`, `sources` and `modelDigest` bind the supplied inputs, not their
approval or repository provenance. Retain actual test results separately;
never upgrade those fixed qualifications because a model or a double passes.
