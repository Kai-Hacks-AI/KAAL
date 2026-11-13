# C1 evidence

The RED of this PLAN, observed against `main`. Work not on `main` is not delivered functionality, and C1 cites nothing that is not on `main`.

- Baseline: `main` at `1263be7`, which holds no `packages/kaal-architecture/`. Method: the Cases are copied over a checkout of `main` and each `run()` is called, then run in the tree of this PLAN. No job executes them yet. Node 22 on Linux.

| Case | Tests | On `main` | In this PLAN |
| --- | --- | --- | --- |
| T1 | I1, F1, F2 | RED: I1 is absent | RED: the Skill-only trial is absent |
| T2 | N1 | RED: the Skill is absent | RED: the same |
| T3 | A1 | RED: package.json is absent | RED: the same |
| T4 | A2, F3 | RED: the Skill is absent | RED: the same |
| T5 | G1 | RED: the Skill is absent | RED: the same |
| T6 | G2 | RED: the Skill-only trial record is absent | RED: the same |

On `main` and in this PLAN: 6 RED-observed, 0 error, 0 green. Every Case waits for the DO: the Skill, the shell and the trial.

## Can each Case pass, and fail for the right reason

Against a throwaway reference outside the repository (a minimal Skill, a shell, a prompt, a raw output and a record equal to the key, for the Skill and for a baseline), all six were green. Then:

- With the recorded answers equal to the raw output, T1 and T4 judged each scenario by name; an answer that differed from the key would fail there.
- The author named as observer: T1 failed on provenance.
- An answer edited away from the raw output: T1 failed on "not the raw output unedited".
- A workflow file added: T2 failed.
- The reference is not part of this PLAN and implies no wording of the Skill.

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
