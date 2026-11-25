# C18 evidence

The state of the Test Cases of this Change, in the tree of the DO. No job executes the Cases yet.

| Case | Tests | PLAN | DO |
| --- | --- | --- | --- |
| T30 | F19 | RED: the router body had 545 words | GREEN: 147 words |
| T31 | F20 | RED: there was no references folder | GREEN: four references, each named by the router |
| T32 | N4 | GREEN: eleven families of rule stated | GREEN: the same, now across the router and the references |

The earlier Cases are green: T14, T15, T18, T19 and T20 read the router and the references together, and T1, T9 and T11 read the Skill as it was trialled. The package suite is green: 50 of 50 tests of `packages/kaal-architecture`.

## Reproduce

```
node --test $(find packages/kaal-architecture -name '*.test.mjs' | sort)
```
