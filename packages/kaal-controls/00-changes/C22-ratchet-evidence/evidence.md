# C22 evidence

## Observed RED against the collector

`controls/T1115` (plain `.test.mjs`, never renamed), on its own assertion: `a missing findings file did not exit 2 (exit 1)`. The rest of the package is GREEN (58 of 59).

## Can the Case pass

Against a throwaway copy with the command reading its files inside a handler and answering `UNKNOWN`, `blocked: true`, reason `unreadable-input` or `malformed-input` as JSON with exit 2, T1115 is GREEN. (The copy fails T777 only because the copy lacks the repository's `engineering/` folder; that is the copy, not the change.)

## Mutations on the final version of C21

`mutations/run.sh` at `5ce2331b` (`mutations/run-at-5ce2331b.txt`): the baseline is GREEN on T1108 to T1110 and T1112 to T1114. Each mutation, loaded alone, is RED:

| Claim | Mutation | Witness | Failed assertion |
| --- | --- | --- | --- |
| a finding outside the baseline blocks | `M1-accept-all-findings` | T1109, T1112, T1114 | a new finding did not block; a baseline that grew was accepted; a spent ratchet did not judge like preventive |
| a baseline only shrinks | `M2-no-growth-detection` | T1112 | a baseline that grew was accepted |
| a resolved allowance is gone | `M3-retain-resolved-allowances` | T1112 | an allowance kept for a resolved finding was accepted |
| missing evidence is not success | `M4-missing-evidence-is-success` | T1113 | a missing reference passed |

The earlier table in C21 was taken at `f4e099f`; this one replaces it for the final version and keeps the exact patches.

## What this does not show

The trial bundles are author-reported observations: prompts, fixtures, rubrics, anonymised answers, keys and yes/no scores are kept, and the raw transcripts, the scorer's per-cell quotes and whether a run opened the Skill are not. They show what agents said in these two scenarios, with the Skill and without it, and that no benefit of the Skill was observed for the responsibility split. They do not show persistence of the next baseline, which no run addressed.

## Reproduce

```
node -e "import('./packages/kaal-controls/02-requirements/F35-cli-says-unknown/T1115.test.mjs').then(async m=>{try{await m.run();console.log('GREEN')}catch(e){console.log('RED',e.message.split('\n')[0])}})"
sh packages/kaal-controls/00-changes/C22-ratchet-evidence/mutations/run.sh "$PWD"
```
