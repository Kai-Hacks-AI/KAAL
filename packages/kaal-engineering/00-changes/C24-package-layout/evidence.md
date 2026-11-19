# C24 evidence

The PLAN of C24 observes its RED against the collector `kaal/engineering/setup` at `80e4a987`. It cites nothing that is not on that collector.

## Provenance

- Method: each Case's `run()` is called in the tree of this PLAN. No job executes them yet. Observed 19 Nov 2026, Node 22 on Linux.

## Result

| Case | Tests | In the tree of this PLAN |
| --- | --- | --- |
| T1220 | I3 | RED: the reference is absent |
| T1221 | F45 | RED: the reference is absent |
| T1222 | F46 | RED: the reference is absent |
| T1223 | F47 | RED: the reference is absent |
| T1224 | F48 | RED: the reference is absent |
| T1225 | F49 | RED: the reference is absent |
| T1226 | N20 | RED: the reference is absent |
| T1227 | A3 | RED: SKILL.md does not link the reference |

8 RED-observed, 0 error, 0 green. Every Case fails on its own assertion.

## Can each Case pass

In a throwaway root outside the repository, holding the package with `draft/skills/kaal-engineering/` copied over `skills/kaal-engineering/` and the other packages stood in by empty folders, all eight Cases were green, and so were the existing T1176 and T1177. The Engineer Skill's `check-skill` exited 0 on the draft Skill with its reference. The reference is 29 lines.

## Can a Case fail for the right reason

On the same copy: dropping "not committed" made T1224 RED, replacing "consumer space" made T1225 RED, and renaming `unit-tests/` in `13-source` made T1223 RED.

## What this shows and does not show

The Cases show that the reference says what it must, is linked once and keeps the Skill valid. They do not show that the layout is right: that is the Owner's and the CPO's judgment.

## Reproduce

```
for f in $(find packages/kaal-engineering -name 'T12*.red.mjs' | sort -V); do
  node -e "import('./$f').then(async m=>{try{await m.run();console.log('GREEN',m.id)}catch(x){console.log(x.code==='ERR_ASSERTION'?'RED-observed':'ERROR',m.id,String(x.message).split('\n')[0])}})"
done
```
