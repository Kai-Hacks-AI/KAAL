# C70 evidence

## Provenance

- Baseline: the collector `kaal/release/stages-extra-rule` at `main` c90b9fb.
- Method: each Case's `run()` is imported and called in the tree of this PLAN. Observed 17 Nov 2026, Node 22 on Linux.

## Result

| Case | Tests | In the tree of this PLAN |
| --- | --- | --- |
| release/T900 | release/C70 | RED: the declared rules are not accepted (the required checks must be verify Stages (Integrating)) |
| release/T901 | release/C70 | RED: two declared rules are not accepted (the only rule must be required_status_checks) |
| release/T902 | release/C70 | RED: the declared structure is not accepted, so a failure below says nothing |
| release/T903 | release/C70 | RED: the declared structure is not accepted, so a failure below says nothing |

4 RED-observed, 0 error, 0 green. Each fails on its own assertion, and T902 and T903 first require the declared structure to pass, so their later failures cannot be passes by accident.

## Can each Case pass

With the draft of `interface.md` applied in a working tree (the judge, `stages.json` with `rules`, controls read from `04-controls`) and the four Cases renamed to `.test.mjs`, all four were green, and the judge run on the tree as `node judge.mjs . <Ruleset>` passed for Integrating, Collecting, Hotfixing, Wiring and Promoting: the real sources are traced and unchanged in verdict. In the same tree the Cases runner had 19 failures: the 12 present without this Change (the unnamed Cases of `collector-capability/00-changes/C15-collector-capability`, T268 to T279) and seven that the drafts cause: release/T483, T487, T511, T512, T513, T760 and T761. They build the judge's facts without controls or read `requires` and `also`; the DO amends them (T760 and T761 are superseded by T900 to T903). The files were restored and are not part of this PLAN.

## What this shows and does not show

The Cases show that the judge interprets declared rules: one, two or three rules pass in any order, and an undeclared rule, a missing rule, a setting that differs or is not declared, an undeclared or missing check, a trace to no control, to an undeclared control or to a control without an Intent, and an unreadable declaration each fail. They do not show every ruleset setting traced: the ruleset-level settings and the Publishing rule are not traced today (`change.md`, Left open).

## Reproduce

```
for f in engineering/release-management/00-changes/C70-stages-declared-rules/T90{0,1,2,3}.red.mjs; do
  node -e "import('./$f').then(async m=>{try{await m.run();console.log('GREEN',m.id)}catch(x){console.log(x.code==='ERR_ASSERTION'?'RED-observed':'ERROR',m.id,String(x.message).split('\n')[0])}})"
done
```
