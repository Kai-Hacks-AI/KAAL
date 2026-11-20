# C24 evidence

The PLAN of C24 observes its RED against the collector `kaal/engineering/setup` at `80e4a987`. It cites nothing that is not on that collector.

## Provenance

- Method: each Case's `run()` is called in the tree of this PLAN. No job executes them yet. Observed 19 Nov 2026, Node 22 on Linux.

## Result

| Case | Tests | In the tree of this PLAN |
| --- | --- | --- |
| T1220 | I3 | RED: the template is absent |
| T1221 | F45 | RED: the template is absent |
| T1222 | F46 | RED: the template is absent |
| T1223 | F47 | RED: the template is absent |
| T1224 | F48 | RED: the template is absent |
| T1225 | F49 | RED: the template is absent |
| T1226 | F50 | RED: the template is absent |
| T1229 | F51 | RED: the template is absent |
| T1227 | N20 | RED: the template is not inside the Skill |
| T1228 | A3 | RED: SKILL.md links no reference |

10 RED-observed, 0 error, 0 green. Every Case fails on its own assertion.

## Can each Case pass

In a throwaway root outside the repository, holding the package with `draft/skills/kaal-engineering/` copied over `skills/kaal-engineering/`, all ten Cases were green and the Engineer Skill's `check-skill` exited 0 on the Skill with its reference.

## Can a Case fail for the right reason, and not for the wrong one

Seven edits to `package-layout.json` on that copy:

| Edit | Result |
| --- | --- |
| `dist` marked committed | T1224 RED |
| `14-defects` loses its verifier | T1222 RED |
| machinery "written" in `engineering/` too | T1226 RED |
| `10-intent` moved out of number order | T1221 RED |
| a second `AGENTS.md` marked as shipped | T1229 RED |
| the shipped `AGENTS.md` marked as repeating the Skill | T1229 RED |
| the role sentence of `00-backlog`, or what an `AGENTS.md` serves, reworded | all Cases stay GREEN |

The last row is the point of the design: the Cases hold rules, not wording, so rewording the page or a role does not break them.

## What this shows and does not show

The Cases show that the template holds the layout's rules, that the Skill links a page that exists and that the Skill stays valid. They do not show that the layout is right: that is the Owner's and the CPO's judgment.

## Reproduce

```
for f in $(find packages/kaal-engineering -name 'T12*.red.mjs' | sort -V); do
  node -e "import('./$f').then(async m=>{try{await m.run();console.log('GREEN',m.id)}catch(x){console.log(x.code==='ERR_ASSERTION'?'RED-observed':'ERROR',m.id,String(x.message).split('\n')[0])}})"
done
```

## DO

Observed 19 Nov 2026 on the DO of this Change, Node 22 on Linux, with the dependencies of `kaal-engineer-skill` available:

| Case | Tests | In the tree of the DO |
| --- | --- | --- |
| T1220 to T1229 | I3, F45 to F51, N20, A3 | GREEN, including `check-skill` exits 0 on the Skill (T1228) |

10 GREEN, 0 RED, 0 error. The package's existing Cases T1171 to T1179 stay GREEN. Reproduce: `cd packages/kaal-engineering && npm test`.
