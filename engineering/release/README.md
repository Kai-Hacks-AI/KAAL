# Engineering's Release engine

> PLAN engineering/C12 (#719, approved by the Owner in review 5723409257), realized by the engineering/C13 DO in `release.mjs` (the decisions, pure), `run.mjs` (the steps, through Hosting and npm) and `release.test.mjs` (engineering/T62–T70). The workflow, `.github/workflows/release.yml`, is engineering/C14. The Owner asked, on 2026-10-31 after #717 merged, for "a similar engine than kaal-guard for promotion" to npm, and for "a special download approach" for `0.0.1`. This generalizes Guard Release (`.github/workflows/guard-release.yml`, Guard's R1 on #321/#323, and its later corrections) into one release engine that any KAAL package uses, with Foundation as its first package. It authorizes no synchronization, promotion or publication, and creates no npm credential.

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
- **engineering/F31. Pack once: the tested tarball is the release artifact.** Pack runs once per release, with the npm pinned once for the engine. The summary shows the file list, the SHA-256 and the sha512 `integrity`. The tarball's exact bytes are kept as the run artifact (`archive: false`), and the artifact's digest must equal the SHA-256 shown, otherwise the result is cannot judge (exit 2). That artifact is the **authoritative release artifact**: every later step, F32's verification, F33's publish, F34's download and F35's comparison, uses these bytes, and nothing packs again. The run writes a **release record** to its summary and as a second artifact, `release.json`: package, version, commit, run id, artifact id and digest, SHA-256, `integrity`, and the publication path (`trusted` or `first`).
- **engineering/F32. The packed tarball is verified as a consumer installs it.** In a clean directory outside the repository, with its own `HOME` and npm cache, the tarball is installed, with its dependencies from the registry. That is also F29's dependency check observed. Then:
  - the installed package's `npm test` runs, and its whole summary record decides, never an exit status or a `result` field alone (the Owner's review of engineering/C13, comment 6545121034). The last line must be the package's one `<package>-verification {json}` line. Its record must be well formed, with `result`, `exit`, `cases` of `{ name, outcome }` and `causes`, and `exit` must agree with both the result and the process's exit status. `verified` counts only when every case the installed candidate's own `test/verify.json` declares ran exactly once and passed, no undeclared case ran, nothing was skipped or todo, and no cause is given. A failed case is `failed`. Anything else is `unknown`, so a false GREEN never qualifies a tarball;
  - Packaging's `conform` runs on the installed copy, once `kaal-packaging` is on `main` ([Decision 3](#decisions-for-the-owner));
  - Testing's consumer-verification conformance runs through engineering/C7's harness, once C7's DO is on `main`.

  The engine reuses `engineering/delivery/pack.mjs` and C7's runner, and writes no second packer or installer. A check that cannot run yet is shown as **not run**, with its reason, and is never counted as verified.
- **engineering/F33. Trusted Publishing publishes the tested bytes.** This is Guard Release's Publish job, generalized and changed in one respect, as the Owner asked on #719: it does not pack. It runs only on the default branch, only with `publish`, and only after the Owner approves the `npm` environment. It downloads F31's artifact from its own run, recomputes its SHA-256 and refuses one that differs from the release record (cannot judge, exit 2). Then it runs `npm publish <tarball> --access public` on those bytes. npm's OIDC exchange authenticates it, and npm attaches provenance. The hash comparison is a safeguard against a corrupted transfer, not a reproduction: no second pack exists to compare.
- **engineering/F34. First publication: the Owner publishes the tested bytes by hand.** When the package name does not exist on the registry (`npm view` gives E404), the release record's path is `first`. Publish is refused before it asks for approval, because npm has no trusted publisher to accept the job's identity yet. The Pack summary gives the Owner's steps, filled in with the run's own values. No step packs, and no step needs a checkout:
  1. **Download** F31's artifact, the exact tarball that was tested, through the artifact API: `gh api "repos/Kai-Hacks-AI/KAAL/actions/artifacts/<artifact-id>/zip" > <file>.tgz` (the summary looks the id up by name), or from the run page. `gh run download` refuses an artifact uploaded with `archive: false` ("would result in path traversal", seen on the first Foundation run, 41219302162). The endpoint is named `zip`, but serves the file as uploaded.
  2. **Verify** it: `sha256sum <file>.tgz` must print the release record's SHA-256. Stop if it does not.
  3. **Publish those bytes**, with 2FA: `npx npm@11.21.0 publish ./<file>.tgz --access public`. Never `npm publish` in a package directory, which would pack again.
  4. **Bind Trusted Publishing**: `npx npm@11.21.0 trust github <name> --file release.yml --repo Kai-Hacks-AI/KAAL --env npm --allow-publish`, or the same setting on npmjs.com.
  5. **Close the token path**: on npmjs.com, set the package's publishing access to "Require two-factor authentication and disallow tokens".
  6. **Accept it**: dispatch F35 with the Pack run's id.

  **Evidence.** Steps 1 to 5 are the Owner's hand, so the engine claims nothing about them. What it proves is F35's result: the bytes on the registry are, byte for byte, the bytes F31 packed and F32 verified. F35 cites the Pack run, its artifact digest and the release record, so the chain is commit → tested artifact → registry tarball → fresh install, each by hash. From the second version on, only F33 publishes.
- **engineering/F35. Registry acceptance is mandatory after every publication.** A release is **accepted** only when F35 gives `verified`. Until then it is published but not accepted, and the release record says so. After F33 it runs as the next job of the same run. After F34 the Owner dispatches it with the Pack run's id, and it reads the release record and artifact from that run, so nobody types a hash. It:
  - downloads the published tarball from the registry (`npm pack <name>@<version>`). Its SHA-256 must equal the tested artifact's, and its sha512 must equal both the release record's `integrity` and the registry's `dist.integrity`;
  - installs `<name>@<version>` from the registry into a fresh consumer, with its own `HOME` and npm cache, and runs F32's installed verification on that installation;
  - records provenance as it is, never stronger. On the `trusted` path the OIDC provenance attestation (`dist.attestations`) must exist and name this repository, `release.yml` and the release record's commit, and its absence fails. On the `first` path no OIDC provenance can exist, because the Owner published by hand. The record says **provenance: none (first publication by the Owner, manual bootstrap)**. That is neither claimed nor a failure. The byte-for-byte match above is the evidence that stands in for it, and the record says that too.

  The result is `verified`, `failed` or `unknown` (Kai's result vocabulary). F35 publishes nothing and needs no approval, so it can also re-check any released version later, Guard's included.
- **engineering/N15. No credential and no shortcut.** No npm token exists in the repository, its secrets or its environments. Nothing publishes without either the `npm` environment approval or the Owner's own hand. The engine never runs `npm publish` outside F33.
- **engineering/N16. Deterministic.** One pinned npm for the one pack and for the registry download, so that SHA-256s compare like with like. The same commit, package and registry state give the same findings, in the same order.
- **engineering/N17. Linux, as observed.** Release runs on one Linux runner, as Guard Release does. The commit's CI already ran the package's suites on Linux, Windows and macOS, and the release states that it relies on that evidence and does not repeat it. The engine's host operations go through Hosting, which keeps OS-specific code out of the engine (Kai on #668).

## Design

`engineering/release/release.mjs` holds the engine, and `.github/workflows/release.yml` is the adapter. The workflow takes the inputs `package` (a string, validated by the engine and not by a choice list that would repeat the workspaces), `publish` (a boolean) and, for `registry`, `run`, the Pack run whose release record and artifact it accepts. It runs `node engineering/release/release.mjs <step> …` in each job and acts on the exit status: 0 verified, 1 failed, 2 cannot judge. Each job keeps Guard Release's settings: actions pinned by SHA, `persist-credentials: false`, `contents: read`, and `id-token: write` only in Publish.

The registry is reached through `npm` (`view`, `pack <spec>`, `install <spec>`, `publish`), one seam that the tests replace with a fixture registry, so no test needs the network. One read has no npm command: F35's attestation bundle. `run.mjs`'s `attest` fetches it from the URL npm's own `dist.attestations` gives, and refuses any URL outside `https://registry.npmjs.org/-/npm/v1/attestations/`. It is a second seam, also replaced in the tests.

**The steps, as `run.mjs` names them.** `pack` (F28–F32, writes `record/release.json`, `report/summary.md` and the tarball under `artifact/`), `bind` (F31: the uploaded artifact's id and digest into the record), `publish` (F33) and `accept` (F35). Each prints `kaal-release <step>: <result>` and exits 0, 1 or 2.

Trusted publishers are set per package on npm, and each names the workflow file. Every package therefore names `release.yml`, so one environment, one approval rule and one adapter serve them all.

## Decisions for the Owner

1. **Where the logic lives.** **Option A (recommended):** a Node engine under `engineering/release/` and a thin workflow. It is testable under `npm run test:engineering`, and follows Guard's narrow-adapter rule ("supply facts, act on the exit code"). Option B: all logic in a reusable workflow's YAML, as Guard Release has it. Nothing tests it before a real run.
2. **The `0.0.1` path.** Settled by the Owner on #719: F34, where the Owner publishes the downloaded tested artifact with 2FA and nothing is repacked locally. Guard's bootstrap A, a local repack, is not used. A temporary token in the `npm` environment is not an option either: it is a credential, and N15 forbids it.
3. **Packaging's gate before Packaging is on `main`.** **Option A (recommended):** `conform` is required as soon as `kaal-packaging` is on `main`, and until then it is shown as **not run** beside the other results. Foundation, which has no dependencies, can then release first. Option B: no release until `conform` runs. Foundation then waits for Packaging's promotion (#686), while Packaging's own F7 waits for Foundation on npm.
4. **Guard Release.** Settled (the Owner asked on 2026-10-31 whether the engine replaces it; answered on #719): yes, after Guard `0.0.5`. `0.0.5` ships through today's `guard-release.yml`, unchanged, because it is in flight and the engine is not yet on `main`. After `0.0.5` is on npm, a Guard-owned `.github` Change retires `guard-release.yml`, the Owner repoints `@kaihacksai/kaal-guard`'s trusted publisher to `release.yml` by hand, and `0.0.6` is the first Guard version through the engine. Meanwhile F35 can already accept `0.0.5` from the registry, since it publishes nothing.

## Test Cases

These are in `engineering/release/release.test.mjs` and run in `npm run test:engineering`. They use fixture packages in a scratch directory and a fixture registry behind the engine's npm seam, with no network and no publish. Each was observed RED against the deliberately wrong engine in its row, recorded in engineering/C13's pull request.

| Test | Checks | Deliberately wrong engine that makes it RED |
| --- | --- | --- |
| engineering/T62 | F29: a fixture missing each of the scoped name, `publishConfig.access: public`, `repository.directory`, `license`, `engines.node` and `files`, and one marked `private`, each gives the named finding, and nothing is packed | One that checks only `private` and the version |
| engineering/T63 | F29: `name@version` on the fixture registry is refused. A runtime dependency at a version the registry lacks is refused and named, and once that version exists the release proceeds | One that checks only the package's own version |
| engineering/T64 | F28: an unknown package, and a name given as a path, are refused. No list of releasable packages exists outside the manifests | One that accepts any directory |
| engineering/T65 | F31, F33: the SHA-256 shown is the tarball's, and the release record carries it. Publish publishes the downloaded artifact and never runs `npm pack`. An artifact whose SHA-256 differs from the record is cannot judge (exit 2), and `npm publish` is never reached | One that packs again in Publish, or publishes the artifact unchecked |
| engineering/T66 | F32: a consistent verified record over exactly the declared cases verifies, and failed fails. Each of these is unknown: an `exit` that disagrees with the result or with the process, a missing, duplicate, undeclared, skipped or todo case, causes reported with verified, no declaration, and malformed summaries (no line, two lines, not last, another package's, not JSON, unknown result, malformed cases or causes). A verified record with a failed case fails. End to end, a false GREEN from the installed candidate makes Publish refuse the tarball. A check that cannot run is not run, never verified | One that trusts `npm test`'s exit status or the `result` field alone |
| engineering/T67 | F34: a name absent from the registry gives path `first`. The Owner's steps carry the run's id, file name, SHA-256 and package, contain no `npm pack` and no `npm publish` in a package directory, and Publish is refused before approval | One that attempts the OIDC publish of a new name, or whose steps repack |
| engineering/T68 | F35: a registry tarball whose SHA-256 differs from the tested artifact fails, and one whose sha512 differs from the record's `integrity` or from `dist.integrity` fails. Equal bytes and a verified fresh installation are `verified`, and only then is the release accepted. F35 reads the hash from the Pack run, not from an input | One that compares only versions, or accepts a typed hash |
| engineering/T69 | F35: on path `trusted`, a missing attestation, or one naming another repository, workflow or commit, fails. On path `first`, the record states provenance none (manual bootstrap), the result is not failed for it, and no attestation is claimed | One that ignores provenance, claims it for a first publication, or fails every first publication |
| engineering/T70 | N15: no engine path runs `npm publish` except F33's, and the engine reads no token variable | One that falls back to `NPM_TOKEN` |

## What Foundation needs before its `0.0.1`

Run against `main` at 8a5836b, F29 already finds two gaps in `packages/kaal-foundation/package.json`: it has no `repository`, and no `publishConfig.access: public`. Both are Foundation's to add, in a Foundation Change, with its manifest regenerated (`npm run manifest`). The review of #717 (comment 6544821400) found the same, and Foundation is adding both in its own Change. The engine does not edit packages.

## Order

1. **engineering/C12**, this PLAN, into `kaal/engineering`.
2. **engineering/C13 DO**: `engineering/release/` with T62–T70 written RED first, then GREEN, into `kaal/engineering`. It reuses `engineering/delivery/pack.mjs`, and engineering/C7's runner once that lands.
3. **engineering/C14 DO**: `.github/workflows/release.yml`, alone, through its own collector cut from `main`. It only runs once it is on `main`, as every `workflow_dispatch` workflow does.
4. **Foundation's manifest Change** (repository, publishConfig), in Foundation's collector.
5. The promotions of 2 to 4, in the queue the Owner keeps.
6. **The Owner**: run `release.yml` for `@kaihacksai/kaal-foundation` (Pack), take F34's steps, then dispatch F35 with the Pack run's id.

Steps 2, 3 and 4 do not depend on each other and can proceed in parallel. Foundation's `0.0.1` waits for the engine on `main`, so that its first publication is the tested artifact and is accepted by F35.

## Not in this Change

- Any package's own tests, docs or manifest; Packaging's contract; Testing's conformance cases.
- Version bumps, changelogs, tags or GitHub Releases.
- Retiring or migrating Guard Release ([Decision 4](#decisions-for-the-owner)).
- Any npm-side setting. Those are the Owner's, by hand.
