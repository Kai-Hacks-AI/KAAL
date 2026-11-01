# Hosting 0.0.1 SYNC candidate — resolution ledger

Status: **resolved candidate prepared for Owner review; not integrated**. #765 remains the direct main-to-Hosting proposal; #766 carries the executable resolution. No merge, promotion or npm publication is performed.

## Exact baseline

- main: `be3a2d09a386967bd5a1cd4a850f389951bc0796`
- kaal/hosting: `dc2a2354088d585a34e7c0c47f813c3f04590350`
- common ancestor: `f0d1eb94b5196b290044764832cba4ddd22ed408`
- candidate starts at `5bce59aeed778f6accf3ea61da51cf11bb4710a0` (Hosting plus this ledger), with main as the second parent of the resolved candidate commit.

Reproduction: from the candidate preparation commit, run `git merge --no-commit --no-ff be3a2d09a386967bd5a1cd4a850f389951bc0796`. Nine files have actual content conflicts, comprising eleven hunks. The original marker ranges below refer to that unresolved merge output, not the resolved file line numbers. The ancestor and both parent files remain available through Git.

## Actual conflict inventory and decisions

| File | Original marker ranges | Resolution |
| --- | --- | --- |
| `engineering/acceptance/embed.test.mjs` | 141–145, 165–172 | Retain main's packed Core/Foundation install without Graph and its runtime dependency assertions; scope Hosting in the install and dependency list. Both sides' other assertions survive the automatic merge. |
| `package-lock.json` | 929–936 | Regenerate with npm install --package-lock-only --ignore-scripts from the resolved workspace manifests, using main only as a dependency-metadata seed. Confirm scoped Hosting workspace link and no old Hosting package entry. |
| `package.json` | 16–44 | Retain main's comprehensive lane and expanded Engineering suites, with all Hosting workspace build/test commands scoped. |
| `packages/kaal-core/package.json` | 78–85 | Retain main's Foundation + yaml runtime dependencies and Graph as a devDependency only; scope the Hosting runtime dependency. |
| `packages/kaal-core/src/bootstrap.ts` | 1–8 | Retain main's readFrontmatter and Admitted imports and all current verification/assembly semantics; scope the Hosting import. |
| `packages/kaal-core/src/cli.ts` | 3–9 | Retain main's Admitted import and CLI semantics; scope the Hosting import. |
| `packages/kaal-core/src/engine.ts` | 1–9 | Retain main's Admitted and delivered #node/form imports and evaluation semantics; scope the Hosting import. |
| `packages/kaal-core/src/register.ts` | 1–7 | Retain main's Admitted and current registration logic; scope the Hosting import. |
| `packages/kaal-core/test/boundary.test.ts` | 52–56, 95–100 | Retain main's delivered Node/Form + Foundation boundary expectation and no-runtime-Graph dependency assertion; scope Hosting in both expectations. |

The complete conflicting sides of each hunk are recorded below. They are original inputs for audit, not remaining conflict markers in code.

### engineering/acceptance/embed.test.mjs

```text
 <<<<<<< HEAD
  host = await install(["kaal-core", "kaal-graph", "@kaihacksai/kaal-hosting"]);
 =======
  host = await install(["kaal-core", "@kaihacksai/kaal-foundation", "kaal-hosting"]);
 >>>>>>> be3a2d09a386967bd5a1cd4a850f389951bc0796
```

```text
 <<<<<<< HEAD
    assert.deepEqual(core.dependencies, { "kaal-graph": "0.0.1", "@kaihacksai/kaal-hosting": "0.0.1" });
    for (const dependency of ["kaal-graph", "@kaihacksai/kaal-hosting"]) {
 =======
    assert.deepEqual(core.dependencies, { "@kaihacksai/kaal-foundation": "0.0.1", "kaal-hosting": "0.0.1", yaml: "2.9.1" });
    for (const graph of ["kaal-graph", "@kaihacksai/kaal-graph"]) assert.ok(!existsSync(join(host, "node_modules", graph)), `the host holds no ${graph}`);
    for (const dependency of ["@kaihacksai/kaal-foundation", "kaal-hosting"]) {
 >>>>>>> be3a2d09a386967bd5a1cd4a850f389951bc0796
```

### package-lock.json

```text
 <<<<<<< HEAD
        "@kaihacksai/kaal-hosting": "0.0.1",
        "kaal-graph": "0.0.1"
 =======
        "@kaihacksai/kaal-foundation": "0.0.1",
        "kaal-hosting": "0.0.1",
        "yaml": "2.9.1"
 >>>>>>> be3a2d09a386967bd5a1cd4a850f389951bc0796
```

### package.json

```text
 <<<<<<< HEAD
    "test": "npm run test:hosting && npm run test:kaal && npm run test:engineering",
    "test:hosting": "npm test -w @kaihacksai/kaal-hosting",
    "test:hosting:evidence": "npm run build -w @kaihacksai/kaal-hosting && node engineering/lanes/hosting.mjs --evidence engineering/out/evidence",
    "test:kaal": "npm run test:workspaces && npm run test:acceptance",
    "test:workspaces": "npm run build -w @kaihacksai/kaal-hosting && node engineering/lanes/workspaces.mjs",
    "test:workspaces:evidence": "npm run build -w @kaihacksai/kaal-hosting && node engineering/lanes/workspaces.mjs --evidence engineering/out/evidence",
    "test:acceptance": "npm run build -w @kaihacksai/kaal-hosting && node engineering/lanes/acceptance.mjs",
    "test:engineering": "npm run build -w @kaihacksai/kaal-hosting && node --test engineering/github/lineage.test.ts engineering/change-isolation/check.test.mjs engineering/boundary.test.mjs engineering/delivery/pack.test.mjs engineering/report/captures.test.mjs engineering/lanes/evidence.test.mjs engineering/contracts/measure.test.mjs engineering/guard/external/deliver.test.mjs engineering/guard/consumer/harness.test.mjs engineering/guard/acceptance/authority.test.mjs",
    "coverage": "npm run build -w @kaihacksai/kaal-hosting && node engineering/coverage/measure.mjs",
    "inventory": "npm run build -w @kaihacksai/kaal-hosting && node engineering/inventory/measure.mjs",
    "attribution": "npm run build -w @kaihacksai/kaal-hosting -w kaal-core && node engineering/inventory/attribute.mjs",
    "contracts": "npm run build -w @kaihacksai/kaal-hosting && node engineering/contracts/measure.mjs",
    "report": "npm run build -w @kaihacksai/kaal-hosting -w kaal-core && node engineering/report/measure.mjs",
 =======
    "test": "npm run build -w kaal-hosting && node engineering/lanes/comprehensive.mjs",
    "test:hosting": "npm test -w kaal-hosting",
    "test:hosting:evidence": "npm run build -w kaal-hosting && node engineering/lanes/hosting.mjs --evidence engineering/out/evidence",
    "test:kaal": "npm run test:workspaces && npm run test:acceptance",
    "test:workspaces": "npm run build -w kaal-hosting && node engineering/lanes/workspaces.mjs",
    "test:workspaces:evidence": "npm run build -w kaal-hosting && node engineering/lanes/workspaces.mjs --evidence engineering/out/evidence",
    "test:acceptance": "npm run build -w kaal-hosting && node engineering/lanes/acceptance.mjs",
    "test:engineering": "npm run build -w kaal-hosting && node --test engineering/github/lineage.test.ts engineering/change-isolation/check.test.mjs engineering/boundary.test.mjs engineering/delivery/pack.test.mjs engineering/report/captures.test.mjs engineering/lanes/evidence.test.mjs engineering/lanes/lanes.test.mjs engineering/contracts/measure.test.mjs engineering/guard/external/deliver.test.mjs engineering/guard/consumer/harness.test.mjs engineering/guard/acceptance/authority.test.mjs engineering/release/release.test.mjs",
    "coverage": "npm run build -w kaal-hosting && node engineering/coverage/measure.mjs",
    "inventory": "npm run build -w kaal-hosting && node engineering/inventory/measure.mjs",
    "attribution": "npm run build -w kaal-hosting -w kaal-core && node engineering/inventory/attribute.mjs",
    "contracts": "npm run build -w kaal-hosting && node engineering/contracts/measure.mjs",
    "report": "npm run build -w kaal-hosting -w kaal-core && node engineering/report/measure.mjs",
 >>>>>>> be3a2d09a386967bd5a1cd4a850f389951bc0796
```

### packages/kaal-core/package.json

```text
 <<<<<<< HEAD
    "kaal-graph": "0.0.1",
    "@kaihacksai/kaal-hosting": "0.0.1"
 =======
    "@kaihacksai/kaal-foundation": "0.0.1",
    "kaal-hosting": "0.0.1",
    "yaml": "2.9.1"
 >>>>>>> be3a2d09a386967bd5a1cd4a850f389951bc0796
```

### packages/kaal-core/src/bootstrap.ts

```text
 <<<<<<< HEAD
import { Graph } from "kaal-graph";
import { HostingError, initialize, kind, read } from "@kaihacksai/kaal-hosting";
 =======
import { readFrontmatter } from "#node/form";
import { Admitted } from "./admitted.js";
import { HostingError, initialize, kind, read } from "kaal-hosting";
 >>>>>>> be3a2d09a386967bd5a1cd4a850f389951bc0796
```

### packages/kaal-core/src/cli.ts

```text
 <<<<<<< HEAD
import { Graph } from "kaal-graph";
import { readFile } from "@kaihacksai/kaal-hosting";
 =======
import { Admitted } from "./admitted.js";
import { readFile } from "kaal-hosting";
 >>>>>>> be3a2d09a386967bd5a1cd4a850f389951bc0796
```

### packages/kaal-core/src/engine.ts

```text
 <<<<<<< HEAD
import { Graph } from "kaal-graph";
import { FormError, readFrontmatter } from "kaal-graph/form";
import { read } from "@kaihacksai/kaal-hosting";
 =======
import { Admitted } from "./admitted.js";
import { FormError, readFrontmatter } from "#node/form";
import { read } from "kaal-hosting";
 >>>>>>> be3a2d09a386967bd5a1cd4a850f389951bc0796
```

### packages/kaal-core/src/register.ts

```text
 <<<<<<< HEAD
import { Graph } from "kaal-graph";
import { kind as pathKind, read, update } from "@kaihacksai/kaal-hosting";
 =======
import { Admitted } from "./admitted.js";
import { kind as pathKind, read, update } from "kaal-hosting";
 >>>>>>> be3a2d09a386967bd5a1cd4a850f389951bc0796
```

### packages/kaal-core/test/boundary.test.ts

```text
 <<<<<<< HEAD
    assert.deepEqual([...new Set(report.outside.map((o) => o.specifier))].sort(), ["@kaihacksai/kaal-hosting", "kaal-graph", "kaal-graph/form"]);
 =======
    assert.deepEqual([...new Set(report.outside.map((o) => o.specifier))].sort(), ["#node/form", "#node/node", "@kaihacksai/kaal-foundation/sha256", "kaal-hosting"]);
 >>>>>>> be3a2d09a386967bd5a1cd4a850f389951bc0796
```

```text
 <<<<<<< HEAD
    assert.deepEqual(pkg.dependencies, { "kaal-graph": "0.0.1", "@kaihacksai/kaal-hosting": "0.0.1" });
 =======
    assert.deepEqual(pkg.dependencies, { "@kaihacksai/kaal-foundation": "0.0.1", "kaal-hosting": "0.0.1", yaml: "2.9.1" });
    assert.equal(pkg.devDependencies["kaal-graph"], "0.0.1");
 >>>>>>> be3a2d09a386967bd5a1cd4a850f389951bc0796
```

## Automatic merges and compatibility adaptations

`engineering/lanes/workspaces.mjs`, Core's `lifecycle.ts`, `realization.ts`, `records.ts` and other overlapping files merged without Git conflicts. Workspaces retains both scoped Hosting exclusion/import and main's `suites()` missing-entrypoint check; no test command regains `--if-present` skipping. The root build's existing optional-build behavior is unchanged.

The incoming Release workflow's three Hosting workspace build selectors are scoped; CI selection and release behavior are unchanged. Core's current README and product docs also name the scoped runtime dependency; historical plans are unchanged. New main-owned Engineering suites/release adapter and Core runtime, runner, verifier and tests also import the scoped Hosting package. No Hosting implementation, Case identity, host-fact identifier, or product contract changes. Core production sources differ from main only in Hosting module specifiers. Main's Admitted, registration schema, assemble and verification implementations are preserved. Core's shipped verification manifest is regenerated explicitly after building, rather than repaired during a test.

## Incoming changes and owner impact

| Main commit | Incoming scope | Owner impact |
| --- | --- | --- |
| `8a5836b` (#697) | Publishable Foundation 0.0.1 | Foundation: retain promoted baseline |
| `4c5119f` (#717) | Foundation capability C7–C8 | Foundation: retain promoted baseline |
| `cc74d99` (#721) | Foundation publication and verifier C9 | Foundation: retain promoted baseline |
| `80d87be` (#728) | Scoped Foundation bin C10 | Foundation: retain documentation and acquisition checks |
| `16c18e8` (#730) | Release engine C12–C13 and collected plans | Engineering: retain release engine and comprehensive/fail-closed suites |
| `56f9ea3` (#731) | Release workflow C14 | Engineering: retain baseline workflow, scoping only its Hosting build selectors; no dispatch/publication |
| `b228dfa` (#734) | Core standalone and delivered package C24–C39 | Core: retain product semantics; adapt Hosting identity and verification hashes |
| `be3a2d0` (#763) | Guard C136 Windows optimization | Guard: carry hotfix byte-for-byte; no new Guard implementation changes |

These are baseline synchronization impacts, not extra Hosting release work. #751, #694 and #759 have not been added. Hosting #657/#700 files and embedded product/consumer contract remain intact.

## Validation

- Clean dependency install and all-workspace build: passed locally on Linux, Node 24.
- Comprehensive lane executed: Engineering (236 cases), Foundation, Graph, Testing, Engineer Skill, Core boundary and Core consumer verification passed. Hosting T43/T66 failed because this execution sandbox denies Unix-domain socket binding, while the shipped Linux host guide expects it. Core standalone packing and Engineering acceptance then failed at Hosting prepack for the same T66. No product assertion was weakened to accommodate the sandbox. Three-host GitHub execution is required for authoritative host evidence.
- The comprehensive lane also reports the incoming main baseline's unresolved External Test Plan. This is retained and never reported as passed.
- Packed-consumer verification and three-host GitHub checks: pending remote execution; see #766 for exact results and candidate SHA.
- Branching was exercised on the two-parent candidate shape and fails: the checker permits edits only in actual Git-conflict paths. The scoped Hosting adaptations in 19 other paths and this ledger differ from the mechanical merge. These are required integration adaptations, but current policy does not admit them as conflict resolutions. #766 remains a preparation candidate and must not be merged with a failed Branching check. Resolving that policy/application conflict is an Owner/Engineering decision, not a reason to bypass the check.
- npm package remains `@kaihacksai/kaal-hosting@0.0.1`, with public access and unchanged exports.

## Changed-file scope against Hosting

This is the full candidate scope against the exact Hosting baseline, including the baseline's incoming main changes. Files are attributed by their owning area; the SYNC does not transfer ownership.

### Core (64 files)

- `packages/kaal-core/README.md`
- `packages/kaal-core/capability/Registration.md`
- `packages/kaal-core/docs/architecture.md`
- `packages/kaal-core/docs/intent.md`
- `packages/kaal-core/docs/limitations.md`
- `packages/kaal-core/docs/operations.md`
- `packages/kaal-core/docs/requirements.md`
- `packages/kaal-core/docs/testing.md`
- `packages/kaal-core/package.json`
- `packages/kaal-core/plan/conformance/architecture.md`
- `packages/kaal-core/plan/conformance/intent.md`
- `packages/kaal-core/plan/conformance/requirements.md`
- `packages/kaal-core/plan/conformance/testing.md`
- `packages/kaal-core/plan/registration/architecture.md`
- `packages/kaal-core/plan/registration/intent.md`
- `packages/kaal-core/plan/registration/requirements.md`
- `packages/kaal-core/plan/registration/testing.md`
- `packages/kaal-core/plan/release/architecture.md`
- `packages/kaal-core/plan/release/intent.md`
- `packages/kaal-core/plan/release/requirements.md`
- `packages/kaal-core/plan/release/testing.md`
- `packages/kaal-core/plan/standalone/architecture.md`
- `packages/kaal-core/plan/standalone/intent.md`
- `packages/kaal-core/plan/standalone/requirements.md`
- `packages/kaal-core/plan/standalone/testing.md`
- `packages/kaal-core/plan/structured/architecture.md`
- `packages/kaal-core/plan/structured/intent.md`
- `packages/kaal-core/plan/structured/requirements.md`
- `packages/kaal-core/plan/structured/testing.md`
- `packages/kaal-core/scripts/deliver-node.mjs`
- `packages/kaal-core/scripts/manifest.mjs`
- `packages/kaal-core/src/admitted.ts`
- `packages/kaal-core/src/agent.ts`
- `packages/kaal-core/src/bootstrap.ts`
- `packages/kaal-core/src/cli.ts`
- `packages/kaal-core/src/conformance.ts`
- `packages/kaal-core/src/engine.ts`
- `packages/kaal-core/src/frontmatter.ts`
- `packages/kaal-core/src/installation.ts`
- `packages/kaal-core/src/lifecycle.ts`
- `packages/kaal-core/src/node.ts`
- `packages/kaal-core/src/realization.ts`
- `packages/kaal-core/src/records.ts`
- `packages/kaal-core/src/register.ts`
- `packages/kaal-core/src/registration.ts`
- `packages/kaal-core/src/sha256.ts`
- `packages/kaal-core/test/acquisition.test.mjs`
- `packages/kaal-core/test/boundary.test.ts`
- `packages/kaal-core/test/core.test.ts`
- `packages/kaal-core/test/embed/architecture.test.mjs`
- `packages/kaal-core/test/embed/code.test.mjs`
- `packages/kaal-core/test/embed/intent.test.mjs`
- `packages/kaal-core/test/embed/requirements.test.mjs`
- `packages/kaal-core/test/installation.test.ts`
- `packages/kaal-core/test/manifest.test.mjs`
- `packages/kaal-core/test/plan/conformance.test.mjs`
- `packages/kaal-core/test/plan/registration.test.mjs`
- `packages/kaal-core/test/plan/release.test.mjs`
- `packages/kaal-core/test/plan/standalone.test.mjs`
- `packages/kaal-core/test/plan/structured.test.mjs`
- `packages/kaal-core/test/registration.test.ts`
- `packages/kaal-core/test/run.mjs`
- `packages/kaal-core/test/verify.json`
- `packages/kaal-core/test/verify.mjs`

### Foundation (32 files)

- `packages/kaal-foundation/README.md`
- `packages/kaal-foundation/bin/kaal-foundation.mjs`
- `packages/kaal-foundation/docs/architecture.md`
- `packages/kaal-foundation/docs/intent.md`
- `packages/kaal-foundation/docs/limitations.md`
- `packages/kaal-foundation/docs/operations.md`
- `packages/kaal-foundation/docs/requirements.md`
- `packages/kaal-foundation/docs/testing.md`
- `packages/kaal-foundation/package.json`
- `packages/kaal-foundation/plan/capability/architecture.md`
- `packages/kaal-foundation/plan/capability/intent.md`
- `packages/kaal-foundation/plan/capability/requirements.md`
- `packages/kaal-foundation/plan/capability/testing.md`
- `packages/kaal-foundation/plan/publication/architecture.md`
- `packages/kaal-foundation/plan/publication/intent.md`
- `packages/kaal-foundation/plan/publication/requirements.md`
- `packages/kaal-foundation/plan/publication/testing.md`
- `packages/kaal-foundation/skills/kaal-foundation/SKILL.md`
- `packages/kaal-foundation/test/embed/architecture.test.mjs`
- `packages/kaal-foundation/test/embed/commands.test.mjs`
- `packages/kaal-foundation/test/embed/requirements.test.mjs`
- `packages/kaal-foundation/test/publisher/acquisition.test.mjs`
- `packages/kaal-foundation/test/publisher/capability.test.mjs`
- `packages/kaal-foundation/test/publisher/manifest.mjs`
- `packages/kaal-foundation/test/publisher/manifest.test.mjs`
- `packages/kaal-foundation/test/publisher/publication.test.mjs`
- `packages/kaal-foundation/test/publisher/release.test.mjs`
- `packages/kaal-foundation/test/publisher/sha256.test.mjs`
- `packages/kaal-foundation/test/publisher/verifier.test.mjs`
- `packages/kaal-foundation/test/run.mjs`
- `packages/kaal-foundation/test/verify.json`
- `packages/kaal-foundation/test/verify.mjs`

### Engineering / repository (32 files)

- `.github/workflows/release.yml`
- `AGENTS.md`
- `engineering/FANATIC.md`
- `engineering/GLUE.md`
- `engineering/MOVE.md`
- `engineering/PROSE.md`
- `engineering/RATS.md`
- `engineering/acceptance/embed.test.mjs`
- `engineering/boundaries/README.md`
- `engineering/conformance/README.md`
- `engineering/controls/README.md`
- `engineering/github/branching.md`
- `engineering/guard/acceptance/package.test.mjs`
- `engineering/guard/change.md`
- `engineering/guard/testing.md`
- `engineering/hosting-sync-0.0.1-ledger.md`
- `engineering/lanes/README.md`
- `engineering/lanes/comprehensive.mjs`
- `engineering/lanes/lanes.test.mjs`
- `engineering/lanes/plan.json`
- `engineering/lanes/suites.mjs`
- `engineering/lanes/workspaces.mjs`
- `engineering/platforms/README.md`
- `engineering/release/README.md`
- `engineering/release/release.mjs`
- `engineering/release/release.test.mjs`
- `engineering/release/run.mjs`
- `engineering/research/owned-trees.md`
- `engineering/research/representation.md`
- `engineering/verification/README.md`
- `package-lock.json`
- `package.json`
