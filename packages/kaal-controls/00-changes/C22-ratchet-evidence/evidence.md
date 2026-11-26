# C22 evidence

## Observed against the collector

Each Case is a plain `.test.mjs`, never renamed, called through its `run()`:

```
RED   controls/T1115 a missing findings file did not exit 2 (exit 1)
GREEN controls/T1116
RED   controls/T1117 a new finding carried a next baseline although it did not pass
```

T1116 is coverage of what the command already does on valid input, so it is GREEN today; its sensitivity is shown in the DO (M6). The rest of the package is GREEN.

## Can the RED Cases pass

Against a throwaway copy of the package with the DO's two changes (the command's input handling, and `next` only on a pass), T1115 and T1117 are GREEN, T1116 stays GREEN, and T1108 to T1114 stay GREEN. (The copy fails T777 only for lack of the repository's `engineering/` folder.)

## The weakenings of C21 on its final version

`mutations/run.sh` at `5ce2331b` (`mutations/run-at-5ce2331b.txt`): the baseline is GREEN on T1108 to T1110 and T1112 to T1114; each weakening, loaded alone, is RED:

| Claim | Weakening | Witness | Failed assertion |
| --- | --- | --- | --- |
| a finding outside the baseline blocks | `M1-accept-all-findings` | T1109, T1112, T1114 | a new finding did not block; a baseline that grew was accepted; a spent ratchet did not judge like preventive |
| a baseline only shrinks | `M2-no-growth-detection` | T1112 | a baseline that grew was accepted |
| a resolved allowance is gone | `M3-retain-resolved-allowances` | T1112 | an allowance kept for a resolved finding was accepted |
| missing evidence is not success | `M4-missing-evidence-is-success` | T1113 | a missing reference passed |

These replace the preview of C21 taken at `f4e099f`, which is marked superseded there. T1115 to T1117 are not part of that run; the DO runs M1 to M8 with them. The record `mutations/run-at-do-head.txt` is part of the commit and cannot name its own revision; it is checked by re-running `run.sh` at the head. T1117's missing-reference assertion is not a witness for M4 (T1113 and T1115 are); M7 changes only the reason (`unreadable-input` to `could-not-judge`), M8 removes the outer handler so the command crashes.

## What this does not show

That agents apply the lifecycle, or that the Skill teaches it. The trials of C21 were run by the author, are described only in the pull request, and are author-reported observations; they are not retained here and no claim of this Change rests on them.

## Reproduce

```
for t in F35-cli-says-unknown/T1115 F35-cli-says-unknown/T1116 F36-ratchet-lifecycle/T1117; do
  node -e "import('./packages/kaal-controls/02-requirements/$t.test.mjs').then(async m=>{try{await m.run();console.log('GREEN',m.id)}catch(e){console.log('RED',m.id,e.message.split('\n')[0])}})"
done
sh packages/kaal-controls/00-changes/C22-ratchet-evidence/mutations/run.sh "$PWD"
```
