# C1 evidence

The RED of this PLAN, observed against `main`. Work not on `main` is not delivered functionality, and C1 cites nothing that is not on `main`.

Baseline: `main` at `5112000`, with no `packages/kaal-architecture/`. Method: the Cases are copied over a checkout of `main` and each `run()` is called, then run in the tree of this PLAN. No job executes them yet. Node 22 on Linux.

| Case | Tests | On `main` | In this PLAN |
| --- | --- | --- | --- |
| T1 | I1, F1 | RED: I1 is absent | RED: the Skill-only trial record is absent |
| T2 | F2 | RED: F2 is absent | RED: the Skill is absent |
| T3 | F3 | RED: F3 is absent | RED: the Skill-only trial record is absent |
| T4 | N1 | RED: the Skill is absent | RED: the same |
| T5 | A1 | RED: package.json is absent | RED: the same |
| T6 | A2 | RED: the Skill is absent | RED: the same |
| T7 | G1 | RED: the Skill is absent | RED: the same |
| T8 | G2 | RED: the Skill-only trial record is absent | RED: the same |

On `main` and in this PLAN: 8 RED-observed, 0 error, 0 green.

Every Case waits for the DO: the Skill, the shell and the trial.

## Can each Case pass, and fail for the right reason

Against a throwaway reference outside the repository (a Skill free of the banned words, a shell, a prompt, a raw output and a record equal to the key, for the Skill and for a baseline), all eight were green. Then:

- The author named as observer: T1 failed on provenance.
- An answer edited away from the raw output: T1 and T3 failed on "not the raw output unedited".
- An answer wrong against the key, raw output equal (S3 not split): T3 failed naming S3.
- The Skill body given the word "migration": T2 failed. Given the word "GitHub": T4 failed. A workflow file added: T4 failed.
- The key reduced to three domains outside software: T5 failed.

The reference is not part of this PLAN and implies no wording of the Skill.

## Reproduce

```
cat > red.mjs <<'JS'
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
for (const f of process.argv.slice(2)) {
  const m = await import(pathToFileURL(resolve(f)).href);
  try { await m.run(); console.log('GREEN       ', m.id); }
  catch (x) { console.log(x?.code === 'ERR_ASSERTION' ? 'RED-observed' : 'ERROR       ', m.id, String(x.message).split('\n')[0]); }
}
JS
node red.mjs $(find packages/kaal-architecture -name 'T*.red.mjs' | sort -V)
```

## Amendment: T9 (architecture/F4, next move)

Baseline: `kaal/architecture/classify` at `1585619`. T9 is RED there and in this PLAN: the `next/skill` record is absent. T3 and T1 to T8 are unchanged by this PLAN; T3 stays RED on S4 against the recorded run 3. The key gains a `next` field per statement, written before the trial it will judge, and the trial asks every agent for the next move so that choosing to ask is observable.
