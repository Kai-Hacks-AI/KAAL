# C78 evidence

## Provenance

- Baseline: the collector `kaal/release/stages-extra-rule` at tip 5a24cb9 (release/C70), on `main` 16a5a7d.
- Method: each Case's `run()` is imported and called in the tree of this PLAN. Observed 18 Nov 2026, Node 22 on Linux.

## Result

| Case | In the tree of this PLAN |
| --- | --- |
| release/T992 | RED: the four files are not declared (I43.md is not declared) |
| release/T993 | RED: Publishing does not declare its rule |
| release/T994 | RED: an undeclared rule is not reported as the declaration says (the declared tag rule is accepted first) |

3 RED-observed, 0 error, 0 green. The judge Cases first require the declared structure to be accepted, so their later failures are not passes by accident.

## Can each Case pass

Demonstrated with a throwaway implementation, never committed: a copy of the tree of this PLAN with `main` (16a5a7d) merged in, because the status-aware finder of release/C62 is on `main` and not yet on this collector. In the copy the four drafts of `interface.md` were written as the files they name (the control with `status: implemented`), and `rules` on the Publishing stage (the `update` rule, traced to the control) and the judge comparing the tag ruleset source to it were added; the Cases were renamed to `.test.mjs`. Result of the whole Cases runner: release/T992, T993 and T994 all green, and the only failures are the 12 present without this Change (the unnamed Cases of `collector-capability/00-changes/C15-collector-capability`, T268 to T279). `node judge.mjs <copy> <Ruleset>` passed for Integrating, Collecting, Hotfixing, Wiring and Promoting on the real sources.

Two things the throwaway showed the DO must do: the shared fixtures (`C35-stages/helper.mjs`, `C70-stages-declared-rules/fixtures.mjs`) declare release/CTL15 and the new key, and the DO needs `main` merged first (the SYNC), since a control with `status` is refused by the finder without release/C62. Nothing live is claimed.

## Reproduce

```
for f in $(git ls-files -o --exclude-standard | grep 'T9.*red.mjs'); do
  node -e "import('./$f').then(async m=>{try{await m.run();console.log('GREEN',m.id)}catch(x){console.log(x.code==='ERR_ASSERTION'?'RED-observed':'ERROR',m.id,String(x.message).split('\n')[0])}})"
done
```

