# Foundation: register the package with Guard (PLAN, foundation/C22)

Capability: Foundation. Target: `kaal/foundation`. Record number provisional until integration. Intent: foundation/I15 (the collector), with Guard's discovery rule (guard/F43 to F45, landed on `kaal/guard/registration`).

## Change, From, To, Because
- **Change:** Foundation carries one `kaal-guard.json` at its package root, with one check that builds and verifies the package from any state.
- **From:** `packages/kaal-foundation/` has no `kaal-guard.json`. Guard's diff-based selection finds no check for a changed Foundation file.
- **To:** `packages/kaal-foundation/kaal-guard.json` is `{ "checks": [ { "id": "foundation", "run": "node packages/kaal-foundation/04-test/engineering-check/guard.mjs" } ] }`, with no `when`, so any change under the package runs it. `guard.mjs` is a new Delivery script beside `build.mjs` and `collect.mjs`, written by the DO.
- **Because:** Guard discovery (guard/F43 to F45) selects by the nearest `kaal-guard.json`; without one Foundation is invisible to it.

## Execution contract (CPO review of 15 Nov)
Verified against `kaal/guard/registration` (`lib/discovery.mjs`, `lib/runner.mjs`) and by running its runner on a fixture.
- **Guard gives no order and no dependency between checks.** It runs each check of a file as its own command, with its own verdict, from the repository root, with no stdin. A failing check does not stop the next. Exit 0 is pass, 1 fail, 2 cannot judge, 3 not applicable; any other status is cannot judge. So no Foundation check may rely on another having run, and Foundation declares **one** check, not a `build` and a `collector`.
- **`guard.mjs` owns the order.** It runs, as child processes of the same Node (`process.execPath`, no shell, no `npx`): `04-test/engineering-check/build.mjs`, then `collect.mjs`, then `dist/test/package-check/verify.mjs`. It stops at the first step that exits non-zero and exits 1 with the step named on standard error. A step that cannot start exits 2. It exits 0 only when all three passed.
- **Clean state is the contract.** `build.mjs` removes and recreates `dist/` before it copies, so no earlier `dist/` is needed or trusted. Every path in `guard.mjs` is resolved from its own location, never from the working directory. It writes nothing outside the package folder.
- **Node floor.** Guard needs Node 24 or later and Foundation's `engines` is the same, so one Node serves both.

## Requirements (provisional ids)
- **foundation/F45** [foundation/I15]: The package root holds `kaal-guard.json` with exactly one check, `foundation`, whose `run` is `node packages/kaal-foundation/04-test/engineering-check/guard.mjs`. The file exists in the package as source (not under `dist/`), the file has no member other than `id`, `run` and `when` in a check, and no `run` uses `npx`, `npm exec` or a shell feature.
- **foundation/F46** [foundation/I15]: Run through Guard from the repository root on a copy of the package with no `dist/`, the check is discovered for a changed Foundation file, builds, collects and verifies in that order, and Guard reports `pass`. When a step fails, Guard reports `fail` and names the step.
- **foundation/N25** [foundation/I15]: The file and `guard.mjs` are delivery tooling and ship nowhere (`files` stays `["dist"]`).

## Planned Cases
`guard-registration.red.mjs` (this folder; a `.red.mjs` file is not collected and must not reach `main`). Run from the package root: `node --test 00-changes/guard-registration/guard-registration.red.mjs`. All RED today because the file is missing.
- **T300** [F45]: the file's shape and its one check.
- **T301** [F45]: the `run` starts with `node`, and every package path in it is a file that exists in the package as source. No `dist/` exemption.
- **T302** [N25]: the package ships neither file.
- **T303** [F46, behavioural]: a temporary Git repository holds a copy of the package without `dist/` and `node_modules/`, a copy of `packages/kaal-guard`, and an empty `.kaal/config/guard/`. Guard runs `run --ci --changed <list naming a Foundation file>`. It must print `pass: packages/kaal-foundation/kaal-guard.json:foundation` and exit 0, and the copy must hold a `dist/` afterwards that it did not hold before.
- **T304** [F46, behavioural]: the same fixture with `04-test/engineering-check/cases.json` removed. Guard must print `fail:` for the same check and exit 1, and standard error must name the failing step.

T303 and T304 need Guard with discovery (guard/F43) in the same tree. Today it is only on `kaal/guard/registration`; `kaal/foundation` is behind main and holds the older Guard. The Cases fail with that cause named if `packages/kaal-guard/lib/discovery.mjs` is absent. So the DO is sequenced after Guard's discovery reaches `kaal/foundation` by the SYNC that comes with the promotion seat; this PLAN does not authorize that SYNC.

## Not authorized
No SYNC, promotion, version bump, ledger entry, release dispatch or npm publication.
