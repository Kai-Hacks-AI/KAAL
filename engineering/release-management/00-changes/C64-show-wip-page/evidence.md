# C64 evidence

## Provenance

- Baseline: `main` (0e4d916), which holds the Show WIP command and one workflow source, and no page, no theme and no Pages job.
- Theme values: copied from the public repository ChBrain/website (`src/styles/tokens.css`, `src/lib/brand.ts`, `public/favicon.svg`), read 17 Nov 2026. That repository was not changed.
- Action pins: the commits of the tags `actions/upload-pages-artifact@v5.0.0` (fc324d3), `actions/deploy-pages@v5.0.1` (368f825), read with `git ls-remote` on 17 Nov 2026; `checkout` and `setup-node` as in the existing workflow source.
- Method: each Case's `run()` is imported and called in the tree of this PLAN. Observed 17 Nov 2026, Node 24 on Linux.

## Result

| Case | Tests | In the tree of this PLAN |
| --- | --- | --- |
| release/T840 | release/C64 | RED-observed: page.mjs is absent from 05-src/show-wip |
| release/T841 | release/C64 | RED-observed: cvi.json is absent from 05-src/show-wip |
| release/T842 | release/C64 | RED-observed: build-page.mjs is absent from 05-src/show-wip |
| release/T843 | release/C64 | RED-observed: show-wip-page.yml is absent from 05-src/wiring/workflows |

4 RED-observed, 0 error, 0 green. Each fails on its own assertion, not on a missing module.

## Can each Case pass

With the four drafts of `interface.md` written to their places in a working tree: GREEN release/T840, T841, T842 and T843. The files were removed again and are not part of this PLAN.

## What this shows and does not show

The Cases show the page is static and escaped, keeps the identity values and rules, that the build writes nothing when an input is wrong, and that the workflow is scheduled, read-only until the deploy, guarded and pinned. They do not show that Pages is enabled, that the job runs on the host, or what the page looks like in a browser: the first run by hand after the WIRE does. The `settled` section is not run here (release/C61).

## Reproduce

```
for f in engineering/release-management/00-changes/C64-show-wip-page/T*.red.mjs; do
  node -e "import('./$f').then(async m=>{try{await m.run();console.log('GREEN',m.id)}catch(x){console.log(x.code==='ERR_ASSERTION'?'RED-observed':'ERROR',m.id,String(x.message).split('\n')[0])}})"
done
```
