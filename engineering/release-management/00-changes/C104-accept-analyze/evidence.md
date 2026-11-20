# C104 evidence

## Provenance

- Baseline: `main` at 3741577 and the collector `kaal/release/accept-analyze` created there.
- Method: each Case's `run()` is imported and called in the tree of this PLAN. Observed 20 Nov 2026, Node 24 on Linux.

## Result

| Case | Tests | In the tree of this PLAN |
| --- | --- | --- |
| release/T583 (release/C48, rewritten) | release/G71 | RED: acceptance.mjs is absent |
| release/T1267 | release/C104 | RED: equivalence.md is absent |
| release/T1268 | release/C104 | RED: the acceptance judge is absent |
| release/T1269 | release/C104 | RED: the acceptance command is absent |

4 RED-observed, 0 error, 0 green. Each fails on its own assertion, not on a missing module.

## Can each Case pass

With the draft source written as `acceptance.mjs` and `accept.mjs` as `interface.md` specifies, the equivalence draft written as `equivalence.md`, and the four Cases renamed to `.test.mjs` in a working tree, all four were green, and T580 to T582 of release/C48 stayed green. The files and renames were removed again and are not part of this PLAN.

## The command against the host

Run once against the repository on 20 Nov 2026 with the draft source, read-only: the newest merge-queue run into `main` was run 44716419310 (PROMOTION #2092), and `analyze Vulnerabilities (Promoting)` was reported by integration 15368 with the conclusion success. The judge said PASS and the exit status was 0. This closes the earlier open point about the integration id. Nothing was stored.

## What this shows and does not show

T583 shows that a queue run as the host answers it is read and judged PASS end to end, and that no record of a run is stored. T1268 shows the three outcomes and that UNKNOWN never passes. T1269 shows that the command asks with GET only, picks the newest queue run into `main` and writes nothing. T1267 shows that the equivalence statement equals its draft, that the pin it states is the pin of the analyze workflow, that the analyze workflow covers every base listed, runs in the merge queue and states severity low and scope runtime, and, while the legacy workflow exists, that it uses the same pin and covers only `main` and `kaal/**`.

They do not show that the `promoting` ruleset is loaded, nor a queue run that failed on a finding. The verdict of the command is current only when it is read: a queue run older than 14 days gives UNKNOWN.

## Reproduce

```
for f in engineering/release-management/00-changes/C48-analyze-vulnerabilities-stages/T583.red.mjs engineering/release-management/00-changes/C104-accept-analyze/T1267.red.mjs engineering/release-management/00-changes/C104-accept-analyze/T1268.red.mjs engineering/release-management/00-changes/C104-accept-analyze/T1269.red.mjs; do
  node -e "import('./$f').then(async m=>{try{await m.run();console.log('GREEN',m.id)}catch(x){console.log(x.code==='ERR_ASSERTION'?'RED-observed':'ERROR',m.id,String(x.message).split('\n')[0])}})"
done
```
