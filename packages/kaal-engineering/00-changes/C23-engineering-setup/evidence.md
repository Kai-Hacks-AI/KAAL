# C23 evidence

The PLAN of C23 observes its RED against `main` at `8989a652`. It cites nothing that is not on `main`.

## Provenance

- Method: each Case's `run()` is called in the tree of this PLAN. No job executes them yet. Observed 19 Nov 2026, Node 22 on Linux.

## Result

| Case | Tests | In the tree of this PLAN |
| --- | --- | --- |
| T1171 | F40 | RED: the Skill is absent |
| T1172 | F41 | RED: the Skill is absent |
| T1173 | F42 | RED: the Skill is absent |
| T1174 | F43 | RED: the Skill is absent |
| T1175 | F44 | RED: the Skill is absent |
| T1176 | N18 | RED: the Skill is absent |
| T1177 | N19 | RED: package.json is absent |
| T1178 | N19 | RED: the Skill directory is absent |
| T1179 | I2 | RED: the Skill is absent |

9 RED-observed, 0 error, 0 green. Every Case fails on its own assertion.

## Can each Case pass

In a throwaway root outside the repository, holding `draft/package.json` and `draft/SKILL.md` as the package and with the other packages stood in by empty folders, all nine Cases were green. T1178 ran the Engineer Skill's own checker on the draft Skill and it exited 0.

## Can a Case fail for the right reason

On the same copy, adding the line `WIRE copies content to a folder.` made T1176 RED ("a line names WIRE without pointing to kaal-release"), and removing the sentence that says `engineering/<cap>` is optional made T1171 RED.

## What this shows and does not show

The Cases show that the Skill says what it must, points where it must and stays a Skill. They do not show that the explanation is right: that is the Owner's and the CPO's judgment.

## Reproduce

```
for f in $(find packages/kaal-engineering -name 'T11*.red.mjs' | sort -V); do
  node -e "import('./$f').then(async m=>{try{await m.run();console.log('GREEN',m.id)}catch(x){console.log(x.code==='ERR_ASSERTION'?'RED-observed':'ERROR',m.id,String(x.message).split('\n')[0])}})"
done
```
