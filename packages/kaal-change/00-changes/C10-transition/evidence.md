# C10 evidence

The RED of this PLAN, observed against `main`. C10 cites nothing that is not on `main`.

- Baseline: `kaal/change` at `57c3401`, equal to `main`, which holds no `skills/kaal-change-transition/` and none of the new ids. Method: the Cases are copied over a checkout of `main` and each `run()` is called, then run in the tree of this PLAN. No job executes them yet. Node 22 on Linux.

| Case | Tests | On `main` | In this PLAN |
| --- | --- | --- | --- |
| T61 | I24, F50, F51 | RED: I24 is absent | RED: the Skill-only trial is absent |
| T62 | N14 | RED: the Skill is absent | RED: the same |
| T63 | A24 | RED: the Skill is absent | RED: the same |
| T64 | A25, F52 | RED: the Skill is absent | RED: the same |
| T65 | G1 | RED: the reference is absent | RED: the same |
| T66 | G2 | RED: the Skill-only trial record is absent | RED: the same |
| T67 | A24, F52 | RED: the reference is absent | RED: the same |

On `main` and in this PLAN: 7 RED-observed, 0 error, 0 green. Every Case waits for the DO: the Skill, the shell and the trial.

## Can each Case pass, and fail for the right reason

Against a throwaway reference outside the repository (a minimal Skill, a shell, a prompt, a raw output and a record equal to the key, for the Skill and for a baseline), all seven were green. With the observer named as the author, T61 failed on provenance. The reference is not part of this PLAN and implies no wording of the Skill.

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
node red.mjs $(find packages/kaal-change -name 'T*.test.mjs' | sort -V)
```
