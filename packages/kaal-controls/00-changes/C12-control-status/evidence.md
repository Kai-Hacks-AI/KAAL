# C12 evidence

The PLAN of C12 observes its RED against `main`. C12 cites nothing that is not on `main`.

## Provenance

- Baseline: `main` at `42e5b2aadf835c4b426292cd69c30708fa1e30bb`, which holds the finder without a `status` and no check.
- Method: each Case's `run()` is called in the tree of this PLAN. No job executes them yet. Observed 17 Nov 2026, Node on Linux.

## Result

| Case | Tests | In the tree of this PLAN |
| --- | --- | --- |
| T770, T771 | F19 | RED: a control with a status is refused, a control without one is listed as valid, and no rank is listed |
| T772 | F20 | RED: an incomplete control drops out of the inventory, and no problem names its field |
| T773 | G89 | RED: the finder lists no status |
| T774 | A10, F24 | RED: the reference shows no status line, and the Skill has no judgment help |
| T775 | I7 | RED: the command drops a control and marks none invalid |
| T776, T777 | F21, F22, N8 | RED: the product check is absent. Once present, it must run copied alone and the Skill must name no KAAL path |
| T778 | F23 | RED: the product check is absent |
| T779 | A11 | RED: the migration guidance is absent |

10 RED-observed, 0 error, 0 green. Every Case fails on its own assertion, not on a missing module.

## Can each Case pass

Against a throwaway copy of the package and of `engineering/` outside the repository, with the finder taking `status`, a check script in the Skill's scripts folder that wraps the finder, the reference lines, a judging reference, a migration note and a `status` on the two release controls, all ten Cases were green. The copy is not part of this PLAN and implies no wording of the DO.

## What this shows and does not show

The Cases show that the status is declared, checked and listed, that an incomplete declaration stays in the inventory and fails validation, that the check fails visibly with a recovery and writes nothing, that it judges whichever controls exist, and that Engineering runs it without a copy of the rule. They do not show that a status is true. No operational claim is made, and nothing is wired into GitHub.

## Reproduce

```
for f in $(find packages/kaal-controls engineering/controls -name 'T77*.red.mjs' | sort -V); do
  node -e "import('./$f').then(async m=>{try{await m.run();console.log('GREEN',m.id)}catch(x){console.log(x.code==='ERR_ASSERTION'?'RED-observed':'ERROR',m.id,String(x.message).split('\n')[0])}})"
done
```
