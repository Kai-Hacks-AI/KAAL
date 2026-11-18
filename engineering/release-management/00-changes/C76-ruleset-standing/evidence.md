# C76 evidence

## Provenance

- Baseline: the collector `kaal/release/stages-extra-rule` at tip 5a24cb9 (release/C70), on `main` 16a5a7d.
- Method: each Case's `run()` is imported and called in the tree of this PLAN. Observed 18 Nov 2026, Node 22 on Linux.

## Result

| Case | In the tree of this PLAN |
| --- | --- |
| release/T972 | RED: the four files are not declared (I41.md is not declared) |
| release/T973 | RED: the stage does not declare its standing (Integrating does not declare its standing) |
| release/T974 | RED: an evaluate-only ruleset is accepted (the declared standing is accepted first, then an evaluate-only ruleset passes) |

3 RED-observed, 0 error, 0 green. The judge Cases first require the declared structure to be accepted, so their later failures are not passes by accident.

## Can each Case pass

Demonstrated with a throwaway implementation, never committed: a copy of the tree of this PLAN with `main` (16a5a7d) merged in, because the status-aware finder of release/C62 is on `main` and not yet on this collector. In the copy the four drafts of `interface.md` were written as the files they name (the control with `status: implemented`), and the stage declaration `standing` (control, enforcement, bypass) on Integrating, its three parts, Promoting and Publishing, and the judge reading it (`enforcement`, bypass list, trace of the control) were added; the Cases were renamed to `.test.mjs`. Result of the whole Cases runner: release/T972, T973 and T974 all green, and the only failures are the 12 present without this Change (the unnamed Cases of `collector-capability/00-changes/C15-collector-capability`, T268 to T279). `node judge.mjs <copy> <Ruleset>` passed for Integrating, Collecting, Hotfixing, Wiring and Promoting on the real sources.

Two things the throwaway showed the DO must do: the shared fixtures (`C35-stages/helper.mjs`, `C70-stages-declared-rules/fixtures.mjs`) declare release/CTL13 and the new key, and the DO needs `main` merged first (the SYNC), since a control with `status` is refused by the finder without release/C62. Nothing live is claimed.

## Reproduce

```
for f in $(git ls-files -o --exclude-standard | grep 'T9.*red.mjs'); do
  node -e "import('./$f').then(async m=>{try{await m.run();console.log('GREEN',m.id)}catch(x){console.log(x.code==='ERR_ASSERTION'?'RED-observed':'ERROR',m.id,String(x.message).split('\n')[0])}})"
done
```

