# Intent: carry kaal-intent into the flat layout (intent/C10)

Capability: Intent. Target: kaal/intent/packaging. Record number is provisional until integration.

PLAN only: `packages/kaal-intent/00-changes/C10-flat-layout/` (C10.md, Cases T390 and T391, RED on main). The old collector `kaal/old/intent` could not be synchronized: main's `hosting/T22` rejects the old `kaal-hosting` name inside it, and `branching.md` allows no fix inside or after a synchronization. The DO carries the package onto the new collector.

## Check

`node -e "import('./packages/kaal-intent/00-changes/C10-flat-layout/T390.red.mjs').then(m=>m.run())"` and T391: both fail on main.
