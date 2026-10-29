# Engineering's test lanes

> PLAN (engineering/C6): nothing below exists yet. This PLAN applies the Owner's test-entry convention (#625, comment 6504401799) to Engineering's lanes. It was first raised for Core's release PLAN, core/C28 (#622, core/A36). It replaces the premise of that first draft: that a source workspace's `npm test` becomes consumer-only. That premise is no longer agreed. Approving this PLAN authorizes only its DO, on `kaal/engineering`.

## The convention, as the Owner set it

- **In the source workspace,** `npm test` is the comprehensive entry. It runs the publisher suite, the consumer suite and any other declared `test:<name>` suites, and it never invokes itself.
- **In the installed package,** `npm test` runs consumer verification only. The shipped artifact needs neither the publisher tests nor KAAL's Engineering repository.
- **Each package owns its suites, its scripts and their implementations.** Engineering orchestrates them in the package's own directory. It never copies, relocates or redefines a package's tests. A lane may select a named suite, such as `test:publisher`, explicitly.
- **Consumer verification exercises the packed artifact,** installed, not the source tree.

## What Engineering does

- **engineering/F1.** A source lane runs each workspace's own `npm test` in that workspace's own directory, as `npm test --if-present -w <name>`. The Workspaces lane and the evidence lane do this today, and so does Testing's coverage runner (`kaal-testing/coverage`). They need no change.
- **engineering/F2.** A lane that needs one suite selects it by name in the lane itself, as `npm run test:<name> -w <name>`. The selection is the lane's own. The package's script is never edited or rewritten for it. No lane selects one today.
- **engineering/F3.** A new Consumer lane covers every workspace that is not `private`, which is every package KAAL ships. It runs each one's consumer verification against its packed artifact:
  1. pack the workspace, and each workspace it depends on at runtime, with Engineering's packer (`engineering/delivery/pack.mjs`);
  2. install those tarballs, offline, into a clean directory outside the repository;
  3. run `npm test` in the installed package's directory.

  It passes only on the installed package's verdict.
- **engineering/N2.** Engineering copies, relocates and redefines no package's tests. Every suite runs from the package's own directory, and from its installed directory in the Consumer lane.
- **engineering/N3.** The Consumer lane gives the installed package no path into the repository. Its working directory, `HOME` and npm cache are temporary directories outside the repository. An installed test that reaches the repository fails there, as it would for a consumer.

## Not ready yet, listed

A package whose installed `npm test` does not yet verify as a consumer would fail the Consumer lane. Each such package is listed in the lane, named, with its owner. The lane reports it as **not consumer-ready** on every run, and never as passing. The list only shrinks, through each owner's Change. This follows the "uncovered" pattern in engineering/C3 (#585).

Today's `main`, read from each `package.json`:

| Package | Ships | `npm test` in source today | Ready? |
| --- | --- | --- | --- |
| `@kaihacksai/kaal-guard` | yes | `node test/verify.mjs`, consumer verification only | Consumer-ready. Its source `npm test` is not yet comprehensive (Guard, below) |
| `kaal-core` | yes | builds, then runs its publisher tests, which do not ship | Listed until core/C29 |
| `kaal-hosting` | yes | builds, then runs its own tests, which do not ship | Listed |
| `kaal-graph`, `kaal-testing`, `kaal-engineer-skill` | yes | their own tests, which do not ship | Listed |
| `@kaihacksai/kaal-foundation` | `private` today | | Joins when Foundation's own Change publishes it (Owner, #622) |

## What other Capabilities own

These are reported for alignment. Engineering decides none of them.

- **One script, two meanings.** npm ships the same `scripts.test` it reads in the source tree. So each package needs its own way for `npm test` to be comprehensive in source and consumer-only once installed. One way: `npm test` runs a package-owned runner that runs every declared suite whose files are present, and the publisher suites are left out of `files`. Each package chooses its own way. The Consumer lane only checks the result.
- **Core.** core/C29 keeps source `npm test` comprehensive and makes the installed `npm test` consumer-only. Core then leaves the not-ready list. Core's C28 (#622, core/A36) is to be revised from "`npm test` becomes the consumer entry, today's script becomes `test:publisher`" to this convention.
- **Testing.** Its coverage runner runs `npm test`, which stays comprehensive in source. No change is needed. The earlier ask for a script option on `cover` is withdrawn.
- **Guard.** Guard's source `npm test` is consumer verification only today. Making it comprehensive is Guard's own Change. Guard also assesses what evidence consumer verification must give, publisher and consumer kept distinct (the Owner's point 4 on #625). The Consumer lane runs Guard's installed verdict as it stands.
- **Every other shipped package** leaves the not-ready list through its owner's Change.

## Order

1. **engineering/C6 DO** into `kaal/engineering`, then Engineering's promotion. The Consumer lane lands with every non-ready package listed, so it is GREEN on landing and blocks no one.
2. **Each owner's Change, in any order after that,** each removing its package from the list: core/C29, Guard's comprehensive source entry, Foundation's publication, and the rest.
3. **Core's C29 promotion** needs nothing from Engineering beyond step 1. Neither the source lanes nor Testing change.

Each promotion goes through the one-pair queue.

## Test Cases

These go in `engineering/lanes/consumer.test.mjs` and join `npm run test:engineering`. Each runs on fixture workspaces in a scratch directory, never on a KAAL package, and each is first observed RED against a deliberately wrong lane. A RED that shows only a missing module counts as blocked, not as evidence.

| Test | Checks | Deliberately wrong lane that makes it RED |
| --- | --- | --- |
| engineering/T5 | A fixture package whose source `npm test` runs a publisher suite and whose installed `npm test` runs only its consumer suite gives each verdict in its own lane | One that runs the source `npm test` for the Consumer lane |
| engineering/T6 | The Consumer lane installs from the packed tarball. A file that is in the source tree but not in `files` is absent where the installed test runs | One that installs from the source directory |
| engineering/T7 | An installed test that reads a path in the repository fails | One that runs the installed test with the repository as its working directory |
| engineering/T8 | A listed package is reported as not consumer-ready, never as passing. An unlisted package that fails turns the lane RED, naming it | One that skips listed packages silently |
| engineering/T9 | No lane writes, copies or rewrites a file of a package's tests or scripts. The package tree is byte-identical before and after each lane | One that writes a script into the fixture's `package.json` |

The numbers follow engineering/T1–T4, which engineering/C5 (#610) plans.

## Not in this Change

- Any package's scripts, suites or `files`. Those are each owner's.
- Guard's evidence assessment, and Testing's runner.
- Any workflow job, ruleset or required check. The DO adds the Consumer lane as a script, `npm run test:consumer`. Running it in CI is a `.github/` Change, which Change Isolation keeps separate and which is raised on its own.

Approving this PLAN authorizes the engineering/C6 DO only. It authorizes no synchronization, promotion or publication, and no Change in another Capability's tree.
