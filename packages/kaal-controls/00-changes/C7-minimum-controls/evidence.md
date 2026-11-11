# C7 evidence

The PLAN of C7 observes its RED against `main`. Work that is not on `main` is not delivered functionality, and C7 cites nothing that is not on `main`.

## Provenance

- Baseline: `main` at `8720c401fd6aa3ea8f78f1d2f1f3e5d8d7c2a6af`, which holds no `packages/kaal-controls/`.
- Method: the sixteen Cases of this PLAN (T8 to T23) are copied over a checkout of `main` and each Case's `run()` is called, then run again in the tree of this PLAN. No job executes them yet.
- Observed 11 Nov 2026, Node 24 on Linux.

## Result

| Case | Tests | On `main` | In the tree of this PLAN |
| --- | --- | --- | --- |
| T8 | I3 | RED: the Controls Node is absent | RED: the same |
| T9, T10 | F10, F11 | RED: the Controls Node is absent | RED: the same |
| T11 to T13 | F12 to F14 | RED: the Agent Skill is absent | RED: the same |
| T14 | N4 | RED: the Controls Node is absent | RED: the same |
| T15 | A5 | RED: package.json is absent | RED: the same |
| T16 | A6 | RED: the Controls Node is absent | RED: the same |
| T17 | A7 | RED: the Agent Skill is absent | RED: the same |
| T18 | A8 | RED: the worked example is absent | RED: the same |
| T19 | G1 | RED: I3 is absent | green |
| T20 to T23 | G2 to G5 | RED: the artefact is absent | RED: the same |

On `main`: 16 RED-observed, 0 error, 0 green. In the tree of this PLAN: 15 RED-observed and 1 green (T19, the Intent this PLAN adds). The red Cases wait for the DO.

## Can each Case pass

The Cases were run once against a throwaway minimal reference, outside the repository, that holds only the words and files they ask for. All sixteen were green, so each can pass. The reference is not part of this PLAN and implies no wording of the DO.

## What this shows and does not show

All sixteen Cases are structural: they show what the documents state. They do not show that an agent consuming the Skill produces a coherent PLAN. That is the consumption trial of `promotion.md`, judged by a person. No operational claim is made; Controls enforces nothing.

## Reproduce

```
for f in $(find packages/kaal-controls -name 'T*.red.mjs' | sort -V); do
  node -e "import('./$f').then(async m=>{try{await m.run();console.log('GREEN',m.id)}catch(x){console.log(x.code==='ERR_ASSERTION'?'RED-observed':'ERROR',m.id,String(x.message).split('\n')[0])}})"
done
```
