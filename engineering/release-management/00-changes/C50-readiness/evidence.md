# C50 evidence

## Provenance

- Baseline: `main` at 71394da, which holds the control shape, `release/CTL1` and no control for publishing.
- Method: each Case's `run()` is imported and called in the tree of this PLAN. Observed 16 Nov 2026, Node 24 on Linux.

## Result

| Case | Tests | In the tree of this PLAN |
| --- | --- | --- |
| release/T610 | release/CTL3 | RED: release/CTL3 is not listed |
| release/T611 | release/I28 | RED: I28.md is absent |
| release/T612 | release/CTL3 | RED: judge.mjs is absent |
| release/T613 | release/CTL3 | RED: judge.mjs is absent |
| release/T614 | release/CTL3 | RED: judge.mjs is absent |

5 RED-observed, 0 error, 0 green. Each fails on its own assertion, not on a missing module.

## Can each Case pass

With the drafts of `interface.md` as `CTL3.md` and `I28.md`, a judge of the stated interface under `05-src/publishing/verify-package/`, and the five Cases renamed to `.test.mjs` in a working tree, all five were green. The files and the renames were reverted and are not part of this PLAN.

## What this shows and does not show

The Cases show that the control and its Intent are declared in the agreed form, that every rule of engineering/F29 gives its named finding, and that the judge is pure and bound to no repository. They do not show that a release run calls the judge: none does yet, so no operation is claimed.

## Reproduce

The table above is the tree of the PLAN, where the Cases ran RED. In the tree of the DO the same command, with the `.test.mjs` names, gives GREEN for T610 to T615. Run from the repository root:

```
for f in engineering/release-management/04-controls/CTL3-verify-package/T610.test.mjs engineering/release-management/01-intent/I28-publishing-intact/T611.test.mjs engineering/release-management/00-changes/C50-readiness/T61[2345].test.mjs; do
  node -e "import('./$f').then(async m=>{try{await m.run();console.log('GREEN',m.id)}catch(x){console.log(x.code==='ERR_ASSERTION'?'RED-observed':'ERROR',m.id,String(x.message).split('\\n')[0])}})"
done
```

## After the DO

CTL3 (verify Package, detective), I28, the judge `05-src/publishing/verify-package/judge.mjs` and the declaration `verify-package.json` are added. T610 to T614 are green. The CPO review of the DO asked for proper Semantic Versioning in the `version` and `dependency-exact` rules (the first expression accepted `01.2.3`), so the judge now uses the official semver.org expression without build metadata, and the new Case T615 checks valid and invalid versions for the package and for an exact dependency. T610 to T615 are green.
