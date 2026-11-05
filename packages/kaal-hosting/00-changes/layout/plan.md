# Hosting takes the package layout (hosting/C107, PLAN)

PLAN only. It moves no file, edits no Case and authorizes no merge, SYNC, promotion or npm publication. Provisional Change id; it may move if another Change takes it first.

## Intent

Hosting 0.0.1 is the first package in the layout Packaging owns (`packaging/F39` to `packaging/F45`, `packaging/plan/structure/plan.md`, CPO-ruled as part of Hosting's 0.0.1 gate). Afterwards the package has numbered source folders, only `dist/` ships, and Packaging's structure checker reports Hosting's actual folder `verified`. Nothing a consumer installs and runs changes: the same exports, the same `kaal-hosting-boundary` command, the same `npm test` verification, the same Extension Node.

## Mapping (before -> after)

| Today | After | Ships as |
| --- | --- | --- |
| `src/*.ts` | `05-src/skills/kaal-hosting/scripts/*.ts` (compiles into the skill's `scripts/`) | `dist/skills/kaal-hosting/scripts/*.js`, `*.d.ts` |
| `bin/kaal-hosting-boundary.mjs` | `05-src/skills/kaal-hosting/scripts/boundary-cli.mjs` | `dist/skills/kaal-hosting/scripts/` |
| `skills/kaal-hosting/{SKILL.md,references/}` | `05-src/skills/kaal-hosting/{SKILL.md,references/}` | `dist/skills/kaal-hosting/` |
| `payload/Hosting.md` (the Extension Node) | `kaal/Hosting.md` | `dist/kaal/Hosting.md` |
| (new) Core registration docs | `kaal/core/{README.md,register.md}` | `dist/kaal/core/` |
| (new) Agent instructions | `05-src/AGENTS.md` | `dist/AGENTS.md` |
| `docs/intent.md` | `01-intent/` | `dist/docs/intent/` |
| `docs/requirements.md` | `02-requirements/functional/`, `02-requirements/non-functional/` | `dist/docs/requirements/` |
| `docs/architecture.md` | `03-architecture/` | `dist/docs/architecture/` |
| `docs/testing.md` (the allocation tables) | `04-test/package-check/testing.md` | `dist/test/package-check/` |
| `docs/limitations.md` | a Limitations section of `README.md` (Kai F8 = A), deduplicated | `README.md` (npm root file) |
| `test/embed/**`, `test/verify.mjs`, `test/verify.json` | `04-test/package-check/` | `dist/test/package-check/` |
| `test/boundary-check.md` | `04-test/boundary-check/` | `dist/test/boundary-check/` |
| `test/plan/**`, `test/publisher/**` (planned outer Cases and publisher-only Cases) | `04-test/engineering-check/plan/`, `04-test/engineering-check/publisher/` | does not ship |
| `plan/<topic>/` | `00-changes/<topic>/` | does not ship |
| `defects/` (D5 to D7 and their RED files) | `06-defects/` | `dist/docs/defects/` (accepted ones) |
| root `README.md`, `LICENSE`, `package.json`, `tsconfig.json`, `.gitignore`, `.gitattributes` | stay | `README.md`, `LICENSE`, `package.json` (npm's fixed root files) |
| (new) root `AGENTS.md` | engineering rules for people working on the package | does not ship |

`package.json` `files` becomes `["dist"]`. `main`, `types`, `exports` and `bin` point into `dist/skills/kaal-hosting/scripts/`; the specifiers consumers import (`@kaihacksai/kaal-hosting`, `/conformance`, `/boundary`, `/fixtures`, `/package.json`) and the `kaal-hosting-boundary` command name do not change. Package-internal consumers import Hosting by that name already, so no other package changes.

## What this Change decides, and what it needs decided

Decided here (no owner-level choice; reversible in review):

- Source compiles into the skill's `scripts/`, as Packaging's plan says; Hosting's library is that skill's script set.
- The Package Check is today's shipped verification (`test/embed` Cases plus `verify.mjs` and `verify.json`) moved, not redesigned. The shared installation check Packaging plans (packaging/C26) replaces the per-package `verify.mjs` in its own Change; Hosting does not wait for it.
- `plan/<topic>` keeps its topic name under `00-changes/`; each document already names its Change id.
- `dist/` is not committed. It is built by `npm run build` (twice, byte-identical, as `packaging/F42` requires) and is what the checker and `npm pack` see.

Decided by the Owner (Kai, 5 Nov, via the CPO's formal comment on #1064; Packaging owns the shared layout convention):

1. **Non-shipped Cases** live in `04-test/engineering-check/` (planned outer Cases, publisher-only adversaries, regression and development Cases). `04-test/package-check/` is the shipped package verification and `04-test/boundary-check/` the shipped boundary verification.
2. **Layout conformance** belongs exclusively to Packaging's standing checker. Hosting does not duplicate it and takes no runtime dependency on Packaging. For Hosting 0.0.1 a soft conformance assessment with retained evidence is sufficient: this Change records a run of Packaging's checker on Hosting's folder. **Enforcement transition:** once Packaging's checker is integrated into the Engineering process, layout conformance becomes a hard, enforced check. Packaging prepares that integration; it is not enforced against Hosting's own transition before then.

## Immutable Cases: path clauses superseded (Kai's blanket ruling A, 4 Nov)

Only the path clause of an immutable Case changes; no behaviour clause does. The RED Change enumerates every Case with its before and after path from a search of the tests for the moved paths; the known ones are:

| Case | Before | After |
| --- | --- | --- |
| hosting/T122 (Boundary Check record) | `test/boundary-check.md` | `04-test/boundary-check/` (record file inside) |
| The Extension Node Case in `test/plan/ownership.test.mjs` | `payload/Hosting.md` | `kaal/Hosting.md` |
| hosting/F52 embed Case (`test/embed/hosting.test.mjs`, reads the installed Node) | `payload/Hosting.md` | `kaal/Hosting.md` |
| hosting/T70 and the other Cases that read `docs/*.md`, `skills/`, `dist/index.js`, `bin/` | today's paths | the paths in the mapping |
| Every Case file that moves | `test/embed/`, `test/plan/`, `test/publisher/` | the folders in the mapping |

A Case that finds the path it names missing is reported by Packaging as such; none is weakened to pass.

## Order and checks

1. This PLAN, CPO review, then the two decisions above.
2. RED: the supersession inventory, and a failing run of Packaging's checker on today's Hosting folder (`not-in-layout`).
3. DO: the move, source and Cases together in one Change because the paths cannot be half-moved. Targets: Hosting's whole suite green on the three hosts unchanged in behaviour (same Cases, same counts); `npm pack` delivers exactly `dist/` plus `package.json`, `README.md`, `LICENSE`; a fresh install verifies (`npm test` inside the installed copy: verified); `kaal-hosting-boundary --target` still works from the installed copy; the checker run on the folder is `verified`.
4. Then: promote F72 to F74, N10 and A32 to A34 into the requirements and architecture, reconcile the Boundary Check inventory, record Gate B decisions, re-derive the ledger once at the final head, freeze, SYNC main, refresh #1030.

## What this does not do

No change to any operation, error code, dependency or version; no change to Foundation, Core, Guard, Testing or Packaging files; no promotion or publication.
