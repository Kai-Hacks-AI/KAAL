# C18 evidence

The state of the Test Cases of this PLAN, in the tree of this PLAN. No job executes the Cases yet.

| Case | Tests | In this PLAN |
| --- | --- | --- |
| T30 | F19 | RED: the router body has 545 words, more than 200 |
| T31 | F20 | RED: the Skill directory holds more than SKILL.md and references, and there is no references folder |
| T32 | N4 | GREEN: all twenty rules are in the present Skill, and stay green after the DO |

The earlier Cases are unchanged and green.

## Reproduce

```
node --test $(find packages/kaal-architecture -name '*.test.mjs' | sort)
for t in packages/kaal-architecture/00-changes/C18-skill-router/T3[01].red.mjs; do node -e "import('./$t').then(m=>m.run()).then(()=>console.log('GREEN'),e=>console.log('RED:',e.message))"; done
```
