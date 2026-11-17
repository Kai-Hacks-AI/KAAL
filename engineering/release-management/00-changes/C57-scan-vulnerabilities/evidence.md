# C57 evidence

## Provenance

- Baseline: the collector `kaal/release/scan-vulnerabilities` at `main` 39261fa.
- Method: each Case's `run()` is imported and called in the tree of this PLAN. Observed 17 Nov 2026, Node 24 on Linux.

## Result

| Case | Tests | In the tree of this PLAN |
| --- | --- | --- |
| release/T740 | release/CTL6 | RED: release/CTL6 is not listed |
| release/T741 | release/I31 | RED: I31.md is absent |
| release/T742 | release/C57 | RED: the interpreter is absent |
| release/T743 | release/C57 | RED: the workflow source is absent |

4 RED-observed, 0 error, 0 green. Each fails on its own assertion, not on a missing module.

## Can each Case pass

With the drafts of `interface.md` written as the DO's files (I31.md and CTL6.md equal to their drafts, the interpreter, `scan.mjs` and the workflow source) and the four Cases renamed to `.test.mjs` in a working tree, all four were green, the finder refused nothing, and release/T600 stayed green. The files and renames were removed again and are not part of this PLAN.

## What this shows and does not show

The Cases show that the control is declared in the agreed form and found from its Intent, that the interpreter classifies PASS, FAIL and UNKNOWN as stated, and that the workflow source has the stated shape. They do not show a scheduled run: that needs the WIRE and a recorded run.

## The first run will be red

`npm audit --package-lock-only --omit=dev --json` on `main` at 39261fa reports 4 moderate vulnerabilities in 96 dependencies at runtime scope, none of them low or high. So `scan Vulnerabilities (main)` would report FAIL on its first run. That is the control working, and it is why the exemption-free setting is a decision for the WIRE: what to do with those four is a separate Change.

## Reproduce

```
for f in engineering/release-management/04-controls/CTL6-scan-vulnerabilities/T740.red.mjs engineering/release-management/01-intent/I31-known-advisories-on-main/T741.red.mjs engineering/release-management/00-changes/C57-scan-vulnerabilities/T742.red.mjs engineering/release-management/00-changes/C57-scan-vulnerabilities/T743.red.mjs; do
  node -e "import('./$f').then(async m=>{try{await m.run();console.log('GREEN',m.id)}catch(x){console.log(x.code==='ERR_ASSERTION'?'RED-observed':'ERROR',m.id,String(x.message).split('\n')[0])}})"
done
```
