# C13 evidence

The PLAN of C13 observes its RED against the collector of C12, whose head is `a9bfd8dd03e26ff1e05b91f1d6066f55f35ca957`.

## Provenance

- Method: each Case's `run()` is called in the tree of this PLAN. No job executes them yet. Observed 17 Nov 2026, Node on Linux.

## Result

| Case | Tests | In the tree of this PLAN |
| --- | --- | --- |
| T780 | controls/CTL1 | RED: `controls/CTL1` is not listed |
| T781 | controls/I7 | RED: no control has `controls/I7` |
| T782 | controls/CTL1 | RED: the declaration is absent |
| T783 | controls/G90 | RED: `controls/CTL1` is absent |

4 RED-observed, 0 error, 0 green. Every Case fails on its own assertion.

## Can each Case pass

Against a throwaway copy with the draft copied to `04-controls/CTL1-check-controls/CTL1.md`, all four Cases were green.

## What this shows and does not show

The Cases show that the control is declared, valid and found from its Intent, and that the check reveals an incomplete declaration of this very control. They do not show that the control protects anything: no ruleset requires the Engineering check through this Change.

## Reproduce

```
for f in $(find engineering/controls -name 'T78*.red.mjs' | sort -V); do
  node -e "import('./$f').then(async m=>{try{await m.run();console.log('GREEN',m.id)}catch(x){console.log(x.code==='ERR_ASSERTION'?'RED-observed':'ERROR',m.id,String(x.message).split('\n')[0])}})"
done
```
