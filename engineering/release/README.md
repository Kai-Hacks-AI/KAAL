# Engineering's Release engine

> PLAN (engineering/C12): nothing below exists yet. The Owner asked, on 2026-10-31 after #717 merged, for "a similar engine than kaal-guard for promotion" to npm, and for "a special download approach" for `0.0.1`. This PLAN generalizes Guard Release (`.github/workflows/guard-release.yml`, Guard's R1 on #321/#323, and its later corrections) into one release engine that any KAAL package uses, with Foundation as its first package. Approving it authorizes only the DOs named under [Order](#order), each in its own Change. It authorizes no synchronization, promotion or publication, and creates no npm credential.

## What Guard Release already proves, and what it cannot do

Guard Release is the pattern, and it works: `0.0.2` to `0.0.4` were published through it.

- The Owner starts it by hand, on the default branch only.
- **Pack** runs the package's tests, refuses a version already on npm, packs once with a pinned npm (11.21.0), and shows the tarball's file list and SHA-256. It keeps the tarball's exact bytes as a run artifact (`archive: false`) and checks that the artifact's digest is that SHA-256.
- **Publish** runs only with `publish: true`, waits for the `npm` environment's approval (the Owner as required reviewer, `main` only), packs the same commit again, and publishes only a tarball with Pack's SHA-256, through npm Trusted Publishing. No npm token exists, and npm attaches provenance.

What it cannot do:

1. **It is one package.** The name, the directory and the test command are written into the workflow. A second package means a second copy.
2. **It cannot publish a first version.** npm only lets the Owner configure a trusted publisher for a package that already exists. Guard's `0.0.1` was bootstrapped by hand (#321, "bootstrap A"): the Owner packed locally with the same npm, compared the SHA-256, published with 2FA, then ran `npm trust`. Nothing checked that the bytes on the registry were the bytes CI tested.
3. **It never looks at the registry afterwards.** Nothing downloads what was published and verifies it as a consumer gets it.

## Who owns what

| Concern | Owner |
| --- | --- |
| The package, its specific contract, its tests, its `test/verify.mjs` and `test/verify.json` | The delivering Capability |
| The generic KAAL Package contract and its conformance suite (`kaal-packaging/conformance`) | Packaging |
| Consumer-verification conformance of the installed artifact | Testing's cases, run by Engineering (engineering/C7, #641) |
| **The Release engine**: readiness, pack, installed verification, the Owner's publication paths, registry acceptance | **Engineering, in this Change** |
| The release workflow, a thin adapter that supplies facts and acts on exit codes | Engineering, in a `.github`-only Change, because `.github` travels alone |
| Deciding to publish: the `npm` environment approval, the first publication with 2FA, the trusted-publisher setting on npmjs.com | **The Owner, only** |

The engine owns no package's semantics and adds no assertion to a package's own tests. It decides only whether a release may proceed, and says why.

## Requirements

- **engineering/F28. One engine, a package as input.** The engine takes a package by its npm name, for example `@kaihacksai/kaal-foundation`, and a step: `pack`, `publish` or `registry`. It finds the package among the repository's workspaces, as npm lists them. There is no second register of releasable packages: what the engine needs, it reads from the package's own manifest and from the registry.
- **engineering/F29. Readiness, before anything is packed.** Each of these is a named finding, and any finding stops the release before Pack:
  - the package is not a workspace, or is `private`;
  - the name is not scoped `@kaihacksai/` (an unscoped name may resolve to an unrelated package, Kai on #713);
  - `publishConfig.access` is not `public`;
  - `repository` does not name `git+https://github.com/Kai-Hacks-AI/KAAL.git` with `directory` equal to the package's directory. npm checks this for provenance;
  - `license`, `engines.node` or `files` is missing;
  - `name@version` is already on the registry;
  - a runtime dependency's exact version is not on the registry. A consumer could not install the package, so the dependency must be released first. The release order is derived from the manifests, never declared beside them.
- **engineering/F30. The source tests run first.** The package's source `npm test`, the comprehensive entry (Kai on #625), runs in the package's directory. A failure stops the release.
- **engineering/F31. Pack once, show it, keep its exact bytes.** As Guard Release does, with the npm pinned once for the engine. The summary shows the file list, the SHA-256 and the sha512 `integrity`. The run artifact is the tarball itself, and its digest must equal the SHA-256 shown, otherwise the result is cannot judge (exit 2).
- **engineering/F32. The packed tarball is verified as a consumer installs it.** In a clean directory outside the repository, with its own `HOME` and npm cache, the tarball is installed, with its dependencies from the registry. That is also F29's dependency check observed. Then:
  - the installed package's `npm test` runs, and its last line, `<package>-verification {json}`, must give `verified`. `failed` fails the release. A missing or unreadable line is `unknown` and never verified;
  - Packaging's `conform` runs on the installed copy, once `kaal-packaging` is on `main` ([Decision 3](#decisions-for-the-owner));
  - Testing's consumer-verification conformance runs through engineering/C7's harness, once C7's DO is on `main`.

  The engine reuses `engineering/delivery/pack.mjs` and C7's runner, and writes no second packer or installer. A check that cannot run yet is shown as **not run**, with its reason, and is never counted as verified.
- **engineering/F33. Publish through Trusted Publishing.** This is Guard Release's Publish job, generalized. It runs only on the default branch, only with `publish`, and only after the Owner approves the `npm` environment. It packs again, refuses a SHA-256 that differs from Pack's, and runs `npm publish <tarball> --access public`. npm's OIDC exchange authenticates it, and npm attaches provenance.
- **engineering/F34. First publication: the Owner downloads the tested bytes and publishes them.** When the package name does not exist on the registry (`npm view` gives E404), the engine says it is a first publication. Publish is refused before it asks for approval, because npm has no trusted publisher to accept the job's identity yet. The Pack summary then gives the Owner's steps, filled in with the run's own values:
  1. Download the run artifact, the exact tarball Pack tested: `gh run download <run-id> --name <file>.tgz`, or from the run page.
  2. `sha256sum <file>.tgz` must print the SHA-256 shown. Stop if it does not.
  3. `npx npm@11.21.0 publish ./<file>.tgz --access public`, with 2FA.
  4. `npx npm@11.21.0 trust github <name> --file release.yml --repo Kai-Hacks-AI/KAAL --env npm --allow-publish`, or the same setting on npmjs.com. npm requires the first trusted publish within its window.
  5. On npmjs.com, set the package's publishing access to "Require two-factor authentication and disallow tokens".
  6. Run the engine's `registry` step with the SHA-256 shown.

  The difference from Guard's bootstrap: the Owner publishes the bytes CI tested, downloaded, not a second pack from a local checkout. The Owner needs no checkout and no local Node toolchain beyond `npx npm@11.21.0`. From the second version on, only F33 publishes.
- **engineering/F35. Registry acceptance, after every publication.** The `registry` step takes the package, the version and the SHA-256 that was released, either Publish's or the one the Owner published by F34. It:
  - downloads the tarball from the registry (`npm pack <name>@<version>`) and requires its SHA-256 to equal the one released, and its sha512 to equal the registry's `dist.integrity`;
  - installs `<name>@<version>` from the registry into a clean consumer, and runs F32's verification on that installation;
  - reads the provenance attestation (`dist.attestations`). Its absence fails a version published by F33. For a first publication by F34 it is reported as **none, first publication**, which is the known limit, and it is not a failure.

  The result is `verified`, `failed` or `unknown` (Kai's result vocabulary). The step publishes nothing and needs no approval, so it can also re-check any released version later, Guard's included.
- **engineering/N15. No credential and no shortcut.** No npm token exists in the repository, its secrets or its environments. Nothing publishes without either the `npm` environment approval or the Owner's own hand. The engine never runs `npm publish` outside F33.
- **engineering/N16. Deterministic.** One pinned npm for every pack, repack and download comparison, so that SHA-256s compare like with like. The same commit, package and registry state give the same findings, in the same order.
- **engineering/N17. Linux, as observed.** Release runs on one Linux runner, as Guard Release does. The commit's CI already ran the package's suites on Linux, Windows and macOS, and the release states that it relies on that evidence and does not repeat it. The engine's host operations go through Hosting, which keeps OS-specific code out of the engine (Kai on #668).

## Design

`engineering/release/release.mjs` holds the engine, and `.github/workflows/release.yml` is the adapter. The workflow takes the inputs `package` (a string, validated by the engine and not by a choice list that would repeat the workspaces), `publish` (a boolean) and, for `registry`, `version` and `sha256`. It runs `node engineering/release/release.mjs <step> …` in each job and acts on the exit status: 0 verified, 1 failed, 2 cannot judge. Each job keeps Guard Release's settings: actions pinned by SHA, `persist-credentials: false`, `contents: read`, and `id-token: write` only in Publish.

The registry is reached only through `npm`, never through hand-made HTTP. The engine's registry reads (`view`, `pack <spec>`) are one small seam that its tests replace with a fixture registry, so no test needs the network.

Trusted publishers are set per package on npm, and each names the workflow file. Every package therefore names `release.yml`, so one environment, one approval rule and one adapter serve them all.

## Decisions for the Owner

1. **Where the logic lives.** **Option A (recommended):** a Node engine under `engineering/release/` and a thin workflow. It is testable under `npm run test:engineering`, and follows Guard's narrow-adapter rule ("supply facts, act on the exit code"). Option B: all logic in a reusable workflow's YAML, as Guard Release has it. Nothing tests it before a real run.
2. **The `0.0.1` path.** **Option A (recommended):** F34, where the Owner downloads Pack's exact artifact and publishes it with 2FA. Option B: Guard's bootstrap A, where the Owner packs locally with the same npm and compares SHA-256s. That is a second pack on another machine, and it needs a checkout and Node 24. A temporary token in the `npm` environment is not an option: it is a credential, and N15 forbids it.
3. **Packaging's gate before Packaging is on `main`.** **Option A (recommended):** `conform` is required as soon as `kaal-packaging` is on `main`, and until then it is shown as **not run** beside the other results. Foundation, which has no dependencies, can then release first. Option B: no release until `conform` runs. Foundation then waits for Packaging's promotion (#686), while Packaging's own F7 waits for Foundation on npm.
4. **Guard Release.** **Option A (recommended):** it stays as it is. Moving `@kaihacksai/kaal-guard`'s trusted publisher to `release.yml` is a later Guard Change, made at Guard's next release, the Owner's call. Option B: migrate now, which changes Guard's npm setting while `0.0.5` is in flight.

## Test Cases

These go in `engineering/release/release.test.mjs` and run in `npm run test:engineering`. They use fixture packages in a scratch directory and a fixture registry behind the engine's registry seam, with no network and no publish. Each is first observed RED against a deliberately wrong engine. A RED that shows only a missing module counts as blocked, not as evidence.

| Test | Checks | Deliberately wrong engine that makes it RED |
| --- | --- | --- |
| engineering/T62 | F29: a fixture missing each of the scoped name, `publishConfig.access: public`, `repository.directory`, `license`, `engines.node` and `files`, and one marked `private`, each gives the named finding, and nothing is packed | One that checks only `private` and the version |
| engineering/T63 | F29: `name@version` on the fixture registry is refused. A runtime dependency at a version the registry lacks is refused and named, and once that version exists the release proceeds | One that checks only the package's own version |
| engineering/T64 | F28: an unknown package, and a name given as a path, are refused. No list of releasable packages exists outside the manifests | One that accepts any directory |
| engineering/T65 | F31, F33: the SHA-256 shown is the tarball's. A repack whose SHA-256 differs is cannot judge (exit 2), and publish is never reached | One that publishes the second pack unchecked |
| engineering/T66 | F32: an installed verification line `verified` passes, `failed` fails, and no line, two lines or another package's line is `unknown`. A check that cannot run is shown as not run and never verified | One that trusts `npm test`'s exit status alone |
| engineering/T67 | F34: a name absent from the registry is a first publication. The Owner's steps carry the run's SHA-256, file name and package, Publish is refused before approval, and no `npm publish` is run | One that attempts the OIDC publish of a new name |
| engineering/T68 | F35: a registry tarball whose SHA-256 differs from the one released fails, and one whose sha512 differs from `dist.integrity` fails. Equal bytes and a verified installation are `verified` | One that compares only versions |
| engineering/T69 | F35: missing provenance fails a version published by F33, and is reported as none, first publication, for F34 | One that ignores provenance, or fails every first publication |
| engineering/T70 | N15: no engine path runs `npm publish` except F33's, and the engine reads no token variable | One that falls back to `NPM_TOKEN` |

## What Foundation needs before its `0.0.1`

Run against `main` at 8a5836b, F29 already finds two gaps in `packages/kaal-foundation/package.json`: it has no `repository`, and no `publishConfig.access: public`. Both are Foundation's to add, in a Foundation Change, with its manifest regenerated (`npm run manifest`). The review of #717 (comment 6544821400) found the same, and Foundation is adding both in its own Change. The engine does not edit packages.

## Order

1. **engineering/C12**, this PLAN, into `kaal/engineering`.
2. **engineering/C13 DO**: `engineering/release/` with T62–T70 written RED first, then GREEN, into `kaal/engineering`. It reuses `engineering/delivery/pack.mjs`, and engineering/C7's runner once that lands.
3. **engineering/C14 DO**: `.github/workflows/release.yml`, alone, through its own collector cut from `main`. It only runs once it is on `main`, as every `workflow_dispatch` workflow does.
4. **Foundation's manifest Change** (repository, publishConfig), in Foundation's collector.
5. The promotions of 2 to 4, in the queue the Owner keeps.
6. **The Owner**: run `release.yml` for `@kaihacksai/kaal-foundation` (Pack), take F34's steps, then the `registry` step.

Steps 2, 3 and 4 do not depend on each other and can proceed in parallel. If the Owner wants Foundation on npm before the engine reaches `main`, Guard's bootstrap A remains available today, by hand, with step 4 done first. The `registry` step can then accept that version once it lands.

## Not in this Change

- Any package's own tests, docs or manifest; Packaging's contract; Testing's conformance cases.
- Version bumps, changelogs, tags or GitHub Releases.
- Retiring or migrating Guard Release ([Decision 4](#decisions-for-the-owner)).
- Any npm-side setting. Those are the Owner's, by hand.
