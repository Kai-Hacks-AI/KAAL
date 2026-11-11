# C3 evidence

The PLAN of C3 observes its RED against `main`. Work that is not on `main` is not delivered functionality, and C3 cites nothing that is not on `main`.

## Provenance

- Baseline: `main` at `9033099e9234d4059c841c155abc9c309a7aa6fb`. `main` holds no `engineering/release-management/` and no `.github/PULL_REQUEST_TEMPLATE/`.
- Method: the nine Cases of this PLAN (T43 to T51) are copied over a tree that holds nothing of this PLAN's documents, and each Case's `run()` is called. The Cases read only repository files and assert the target state after the DO. A second execution in the tree of this PLAN shows which Cases stay red with the documents of this PLAN present.

## Result

| Case | Tests | On `main` (assertion that failed) | In the tree of this PLAN |
| --- | --- | --- | --- |
| release/T43 | I2 | the PLAN template is absent | the PLAN template is absent |
| release/T44 | F2 | F2 is absent | green |
| release/T45 | F3 | the PLAN template is absent | the PLAN template is absent |
| release/T46 | A14 | A14 is absent | green |
| release/T47 | A15 | A15 is absent | the PLAN template is absent |
| release/T48 | G10 | I2 is absent | the PLAN template is absent |
| release/T49 | G11 | F2 is absent | green |
| release/T50 | G12 | F3 is absent | the PLAN template is absent |
| release/T51 | G13 | A14 is absent | green |

On `main`: 9 RED-observed, 0 unconditional, 0 error, 0 green. In the tree of this PLAN: 5 RED-observed, 4 green. The four green Cases are the ones about documents this PLAN adds; the five red Cases wait for the PLAN template, which the DO delivers as its own `.github` change.

## What the RED asks the Change to add relative to `main`

I2, F2, F3, A14 and A15 (this PLAN), and the PLAN template with its five sections (the DO).

## Reproduce

Environment: Node v22 on Linux, no dependencies. Run from a checkout of this branch.

```
cat > red.mjs <<'JS'
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
for (const f of process.argv.slice(2)) {
  const m = await import(pathToFileURL(resolve(f)).href);
  try { m.run(); console.log('GREEN       ', m.id); }
  catch (x) { console.log(x?.code === 'ERR_ASSERTION' ? 'RED-observed' : 'ERROR       ', m.id, String(x.message).split('\n')[0]); }
}
JS
# in the tree of this PLAN
node red.mjs $(find engineering/release-management -name 'T*.red.mjs' | sort -V)
# on main: only the Case files, nothing else of this PLAN
W=$(mktemp -d)
for f in $(find engineering/release-management -name 'T*.red.mjs'); do mkdir -p "$W/$(dirname "$f")"; cp "$f" "$W/$f"; done
(cd "$W" && node "$OLDPWD/red.mjs" $(find engineering -name 'T*.red.mjs' | sort -V))
```

Observed on 11 Nov 2026 against `main` 9033099:

```
RED-observed  release/T48 : I2 is absent
RED-observed  release/T49 : F2 is absent
RED-observed  release/T50 : F3 is absent
RED-observed  release/T51 : A14 is absent
RED-observed  release/T43 : the PLAN template is absent
RED-observed  release/T44 : F2 is absent
RED-observed  release/T45 : the PLAN template is absent
RED-observed  release/T47 : A15 is absent
RED-observed  release/T46 : A14 is absent
9 RED-observed, 0 GREEN, 0 ERROR
```
