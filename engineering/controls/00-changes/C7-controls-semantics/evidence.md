# C7 evidence

The PLAN of C7 observes its RED against `main`. Work that is not on `main` is not delivered functionality, and C7 cites nothing that is not on `main`.

## Provenance

- Baseline: `main` at `8720c401fd6aa3ea8f78f1d2f1f3e5d8d7c2a6af`, which holds no document on the four types of control.
- Method: the eleven Cases of this PLAN (T8 to T18) are copied over a checkout of `main` and each Case's `run()` is called, then run again in the tree of this PLAN. No job executes them yet.
- Observed 11 Nov 2026, Node 24 on Linux.

## Result

| Case | Tests | On `main` | In the tree of this PLAN |
| --- | --- | --- | --- |
| T8 | I3 | RED: the candidate Skill is absent | RED: the same |
| T9, T10, T11 | F10, F11, F12 | RED: the scenario key is absent | RED: the recorded trial is absent |
| T12, T13, T14 | N4, A5, A6 | RED: the candidate Skill is absent | RED: the same |
| T15 | A7 | RED: the scenario key is absent | green |
| T16 | G1 | RED: I3 is absent | green |
| T17 | G2 | RED: the candidate Skill is absent | RED: the same |
| T18 | G3 | RED: the scenario key is absent | RED: the recorded trial is absent |

On `main`: 11 RED-observed, 0 error, 0 green. In the tree of this PLAN: 9 RED-observed and 2 green (T15 and T16, about documents this PLAN adds). The red Cases wait for the DO: the Skill and the recorded trial.

## Can each Case pass, and can it fail for the right reason

- Run against a throwaway reference outside the repository, with a minimal Skill and answers that equal the key (types listed in reverse order), all eleven Cases were green.
- With two answers made wrong (S5 named as preventive only, and the unsupported claim of S7 accepted), T8, T10 and T11 failed on the assertion that names the scenario, and T9 stayed green. The behavioral Cases therefore fail when an agent mixes the types or accepts an overclaim.
- The reference is not part of this PLAN and implies no wording of the Skill.

## What this shows and does not show

The key is written first and holds the judgment of this PLAN, so the trial can show that the Skill teaches what the key states, not that the key is right: that is the CPO's judgment (`promotion.md`). One recorded run shows what one agent did once. No operational claim is made.

## Reproduce

```
for f in $(find engineering/controls -name 'T*.red.mjs' | sort -V); do
  node -e "import('./$f').then(async m=>{try{await m.run();console.log('GREEN',m.id)}catch(x){console.log(x.code==='ERR_ASSERTION'?'RED-observed':'ERROR',m.id,String(x.message).split('\n')[0])}})"
done
```
