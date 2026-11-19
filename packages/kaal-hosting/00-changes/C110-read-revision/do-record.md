# hosting/C110 DO record

## Delivered
`readRevision` and `revision` (library), and the command `kaal-hosting-revision`, in `05-src/skills/kaal-hosting/scripts/` (`revision.ts`, `revision-cli.mjs`), with Intent I18, Requirements F80–F84 and N12, Architecture A38, Skill/operation guide/Agent/README text, and the interface row in both interface tables.

## Test Case ids
The RED Cases T258–T265 of the PLAN were renumbered to T272–T279 when they moved to `.test.mjs`. Reason: T258–T263 and T268–T271 are already taken by unpromoted Hosting Defect branches (D15–D17, D20); taking them here would collide when those promote. Allocation is recorded in `04-test/package-check/testing.md`. Ids checked against main (3a3cf6e6) and the collector tip (651a4310) at DO time.

## Evidence
- Package Cases (`04-test/package-check/*.test.mjs`): 119 of 119 pass, including revision T272–T276 and T279.
- Publisher run: manifest generates; all Cases pass except hosting/T71, which fails in this sandbox with `Cannot find package 'commonmark'` imported by the sibling kaal-engineer-skill validator (not installed here, not touched by this Change). The mutation checks and release/prepared-release Cases pass.
- Linux only; not run on Windows or macOS.

## Not done
No npm publish, no pin moves, `.kaal/hosting` untouched.
