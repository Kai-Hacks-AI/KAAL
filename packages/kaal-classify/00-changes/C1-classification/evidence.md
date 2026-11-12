# C1 evidence

The PLAN of C1 observes its RED against `main`. Work that is not on `main` is not delivered functionality, and C1 cites nothing that is not on `main`.

## Provenance

- Baseline: `main` at `1263be7`, which holds no `packages/kaal-classify/`.
- Method: the eleven Cases of this PLAN (T1 to T11) are copied over a checkout of `main` and each Case's `run()` is called, then run again in the tree of this PLAN. No job executes them yet.
- Observed 12 Nov 2026, Node 22 on Linux.

## Result

| Case | Tests | On `main` | In the tree of this PLAN |
| --- | --- | --- | --- |
| T1 | I1 | RED: I1 is absent | RED: the recorded trial is absent |
| T2, T3, T4 | F1, F2, F3 | RED: the requirement is absent | RED: the recorded trial is absent |
| T5 | N1 | RED: the Skill is absent | RED: the same |
| T6 | A1 | RED: package.json is absent | RED: the same |
| T7 | A2 | RED: the Skill is absent | RED: the same |
| T8 | A3 | RED: the scenario key is absent | green |
| T9 | G1 | RED: I1 is absent | green |
| T10 | G2 | RED: the Skill is absent | RED: the same |
| T11 | G3 | RED: the scenario key is absent | RED: the recorded trial is absent |

On `main`: 11 RED-observed, 0 error, 0 green. In the tree of this PLAN: 9 RED-observed and 2 green (T8 and T9, about documents this PLAN adds). The red Cases wait for the DO: the Skill, the package shell and the recorded trial.

## Can each Case pass, and can it fail for the right reason

Run against a throwaway reference outside the repository: a minimal Skill, a package shell, and recorded answers equal to the key with the parts listed in reverse order.

- All eleven Cases were green.
- With two answers made wrong (S4 not split, and S7 accepted as a dependency), T3 failed on S4 and T4 failed on S7, each naming the scenario, and the others stayed green. The behavioral Cases fail when an agent leaves a mixed statement whole or accepts a weakening.
- With a workflow file added to the reference, T5 failed.
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
# in the tree of this PLAN
node red.mjs $(find packages/kaal-classify -name 'T*.red.mjs' | sort -V)
# on main: a checkout of main with only the Case files added
W=$(mktemp -d); git worktree add --detach "$W" origin/main
for f in $(find packages/kaal-classify -name 'T*.red.mjs'); do mkdir -p "$W/$(dirname "$f")"; cp "$f" "$W/$f"; done
(cd "$W" && node "$OLDPWD/red.mjs" $(find packages/kaal-classify -name 'T*.red.mjs' | sort -V))
```
