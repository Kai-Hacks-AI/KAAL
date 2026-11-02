# Engineer Skill npm release completion: PLAN

Status: proposed Engineer Skill-owned PLAN for independent review, following the Owner's
2026-11-02 two-track delivery decision. Engineering coordinates dependency versions and the
delivery route (it does not own this package's content or version). This PLAN proposes; it
does not accept, authorize integration, synchronization, promotion or publication, and it
claims no executable GREEN. The BASS guidance Change (#845, #853) is delivered and is not part
of this release programme; it only changes what the package ships.

## Starting point (read from the package on `kaal/engineer-skill`)

| Gap | Observed |
| --- | --- |
| Identity | `name` is `kaal-engineer-skill`. The proposed public identity is `@kaihacksai/kaal-engineer-skill`. |
| Runtime dependency | `dependencies` names unscoped `kaal-hosting` `0.0.1`; the checker imports it at run time (`scripts/check-skill.mjs`). Hosting's published identity will be scoped. |
| Shipped files | `files` is `payload` and `skills` only. README, LICENSE (npm adds LICENSE and README) and any installed verification are not an explicit, declared inventory. |
| Installed `npm test` | `pretest` builds `kaal-core` and `kaal-hosting` workspaces and `test` runs source tests that are not shipped. Neither works in a consumer. |
| Declared test dependencies | Tests import `kaal-testing/acceptance` and `kaal-hosting`; `devDependencies` names only `kaal-core` and `kaal-graph`. Imports resolve today only through the root workspace. |
| Self-reference | Tests import the package by its own unscoped name (`kaal-engineer-skill`), which changes with the identity. |

## Proposed requirements

- **R1. Scoped identity.** Name `@kaihacksai/kaal-engineer-skill`. The Agent Skill's own `name`
  (`kaal-engineer-skill`, its directory) is a different identity, governed by the Agent Skills
  standard, and does not change. The `kaal-engineer-skill` command stays, so existing use and the
  Skill's step 5 wording remain true.
- **R2. Scoped runtime dependency.** The one runtime KAAL dependency becomes exactly
  `@kaihacksai/kaal-hosting@<accepted version>`. Core and Graph stay development dependencies
  and are not publication prerequisites; development and consumer testing can use accepted
  packed dependencies before the registry holds them. Publication requires the selected scoped
  Hosting version on the registry (Hosting's release, not this package's).
- **R3. Declared, exact inventory.** `files` lists everything delivered, including the verification
  entry and manifest of R4, README and the documents the Skill points to. The normal pack
  (with the package's own prepack, never `--ignore-scripts`) contains exactly that inventory
  and nothing else. No source-only test, plan or fixture ships by accident.
- **R4. Standalone installed verification.** `npm test` in an installed copy runs consumer
  verification with no repository, build or workspace: it checks the installed files against a
  shipped manifest of digests, exercises the checker against delivered fixtures, and reports
  exactly one of verified, failed or unknown. The source suite moves to a separate script name,
  as Testing did (`test:consumer`, `test:publisher`). The verification imports only Node built-ins
  and the declared runtime dependency, so a broken library cannot mask itself. Reuse Testing's
  consumer-verification contract rather than a new vocabulary; Testing owns it.
- **R5. Declared tests dependencies.** Every module the source tests import is declared
  (`kaal-testing` as a development dependency with the scoped name once Testing's rename lands),
  or the import is removed. The self-import moves to the scoped name.
- **R6. Own version sequence.** The first publication is `0.0.1` of the scoped package. The version
  is not shared with Hosting, Core or Graph. Engineering records which dependency versions each
  published version was verified with; it does not impose one number.

## Verification and validation design

No executable Cases are added by this PLAN. After acceptance, freeze the obligations in tests
before the DO, using the smallest discriminating Cases and leaving existing assertions unchanged.

| Obligation | Evidence and discriminating negative |
| --- | --- |
| Source | Package tests pass at the exact candidate, unchanged. |
| Normal pack | `npm pack` with prepack gives exactly the declared inventory; an extra source test, a missing document and a file outside `files` are each detected. |
| Clean consumer | Packed tarballs (this package and its scoped Hosting) install in a fresh directory outside the repository; `npm test` there ends verified. |
| Altered install | One altered byte, a deleted shipped file and a stray extra file each make verification fail, never verified. |
| Relocation | The installed Skill moved to another supported Skill location still checks a Skill; the checker's dependency resolution is stated and tested, not assumed (a Skill directory outside the package's `node_modules` cannot resolve `@kaihacksai/kaal-hosting` unless the `kaal-engineer-skill` command or installed path is used). |
| Identity | The old unscoped name is not packed, installed or resolved; no `file:` or workspace link leaks into the tarball's manifest. |
| Dependencies | A tarball whose manifest names unscoped Hosting, or a dependency absent from the registry map, fails the release check. Dev-only packages (Core, Graph, Testing) do not appear in the installed tree. |
| Platforms | All of the above on Linux, macOS and Windows; an unavailable platform is unknown, not pass. |

Structural and consumer observations are verification. Whether the delivered Skill is useful and
proportionate to a new author is independent validation. The existing agent-use trial for the BASS
guidance remains part of delivery acceptance.

## Delivery sequence (each step has its own review and authorization)

1. This PLAN accepted. Engineering confirms the route and dependency versions.
2. DO: manifest, `files`, scoped dependency, consumer verification, test script split, test
   dependency declarations. Ordinary Change into `kaal/engineer-skill`, squash.
3. Verify the coherent candidate (table above). No registry dependency is needed to develop it.
4. Governed `main -> kaal/engineer-skill` SYNC if needed, then a focused promotion of this
   package only; the whole collector is not promoted and `.github` isolation applies. Separate
   Owner authorization.
5. Release workflow on `main`: pack once, verify, publish that artifact (first publication follows
   the Owner's 2FA bootstrap and then Trusted Publishing). Separate Owner authorization.
6. Registry acceptance: identical bytes and integrity, provenance, and a fresh registry-only consumer.

## Dependencies on others

- Hosting: the selected scoped version published to npm before step 5.
- Testing: the consumer-verification contract (reused), and the scoped `kaal-testing` name once its
  rename lands (closure in #857). This package's tests are listed there as an importer.
- Packaging: its generic package conformance, where it is in force at execution time.
- Engineering: route, ordering, and the independent harness plan (#859) for interoperability evidence.

## Open decisions for the Owner

1. That Engineer Skill qualifies for npm distribution under the Owner's rule that reusable
   general engineering knowledge justifies publication (Packaging #850 is deciding the criteria).
2. The exact scoped Hosting version this package depends on.
3. Whether installed `npm test` should include the agent-use trial or leave it to delivery acceptance.

No synchronization, promotion, auto-merge change or publication is authorized by this PLAN.
