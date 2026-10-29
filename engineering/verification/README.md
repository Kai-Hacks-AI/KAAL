# Consumer verification conformance

> PLAN (engineering/C7): nothing below exists yet. This is the separate, bounded Engineering Change the Owner asked for on #625 (comment 6507308611). Engineering runs each KAAL package's consumer verification from its actual packed artifact, and checks with Testing's conformance cases that the verification honours KAAL's testing contracts. engineering/C6 (#625) keeps to the source lanes. Approving this PLAN authorizes only its DO, and only once the prerequisites below are on `main`.

## Two things, kept distinct

- **Consumer verification** is each installed package's own `npm test`. The package owns it, written with whatever framework it chooses, such as `node:test`. It answers whether the installed package works.
- **Engineering conformance** is an independent assessment of whether that installed verification honours KAAL's testing contracts. It answers whether a verification's verdict can be trusted.

Neither stands for the other. A package can pass its own verification and still fail conformance, for example by running zero tests.

## Who owns what

| Concern | Owner |
| --- | --- |
| Test Case, Run, result and evidence semantics. The reusable conformance Test Cases, negative scenarios included | Testing |
| The package entrypoint conventions: what installed `npm test` must be, and what a package ships for it | Packaging |
| Each package's shipped tests and its local runner | That package's Capability |
| Discovering packages, packing them, running the installed artifact and applying Testing's cases | Engineering, in this Change |
| Enforcing the integration gates that apply | Guard |

There is no shared runtime verifier. Guard is not the universal verifier implementation. A package depends on nothing of Engineering's or Guard's in order to verify itself.

## What the DO does

- **engineering/F7. Discover and run the actual artifact.**
  1. Find every shipped workspace, meaning every one not marked `private`.
  2. Pack it, and each workspace it depends on at runtime, with Engineering's packer.
  3. Install those tarballs offline into a clean directory outside the repository, with its own `HOME` and npm cache.
  4. Run the installed package's `npm test` there, and capture its result and output.
- **engineering/F8. Apply Testing's conformance cases** to each captured run. Engineering adds no assertion of its own to them. Each verdict names the package, the case and the evidence.
- **engineering/N5.** The run gives the installed package no path into the repository. Engineering writes none of the package's files.
- **Not ready yet, listed.** A shipped package whose installed verification does not yet conform is listed by name with its owner, and reported as **not conforming** on every run, never as passing. The list only shrinks, through each owner's Change.

## The negative scenarios

These are Testing's cases, named here only so the dependency is explicit. Each must turn a fixture package's conformance RED, naming its cause:

- **zero tests:** installed `npm test` runs no Test Case and exits 0;
- **missing inventory or files:** a test the package declares is not in the packed artifact;
- **skipped required tests:** a required Test Case is skipped or marked todo;
- **failures:** a Test Case fails, but the run reports success;
- **misleading GREEN:** the exit status says pass, while the result says otherwise;
- **tampering:** the installed files differ from the packed artifact's;
- **incorrect provenance:** the result names a different package, version or artifact than the one that ran.

Engineering runs each against a fixture package in a scratch directory. A case counts only once it is observed RED.

## Dependencies

| Prerequisite | Owner | Kind | State today |
| --- | --- | --- | --- |
| Reusable consumer-verification conformance cases, the negative scenarios included | Testing | Technical: the DO imports and runs them. Order prerequisite | **Not delivered.** `kaal-testing`'s existing model defines the semantics, but it is not yet a conformance suite. Testing plans one in its own Change |
| The entrypoint convention for installed `npm test`, and what a package ships for it | Packaging | Semantic reference: the cases test against it. Order prerequisite | Not yet stated. Packaging plans it in its own Change |
| Engineering's packer, `engineering/delivery/pack.mjs` | Engineering | Technical, already on `main` | Available |
| Integration gates on these results | Guard | None for this Change. Guard decides separately whether a gate applies | Unchanged |

**Order.** First Testing's conformance cases and Packaging's entrypoint convention land on `main`, in either order, each under its own authorization. Then a separately authorized synchronization into `kaal/engineering`. Then this DO. Running the lane in CI is a separate `.github/` Change.

## What stays as it is

- **Guard's consumer documentation and its installed-test quality bar** stay where they are. Guard's own consumer acceptance (`engineering/guard/consumer/`) keeps running, and this Change does not replace it.
- **engineering/C6** keeps the source lanes. Nothing here changes how a source workspace's `npm test` runs.

## Test Cases

These go in `engineering/verification/verification.test.mjs`. Each runs on fixture packages in a scratch directory and is first observed RED against a deliberately wrong implementation.

| Test | Checks | Deliberately wrong implementation that makes it RED |
| --- | --- | --- |
| engineering/T12 | The run installs from the packed tarball. A file in the source tree but not in `files` is absent where the installed test runs | One that installs from the source directory |
| engineering/T13 | An installed test that reads a path in the repository fails | One that runs with the repository as its working directory |
| engineering/T14 | Each of Testing's negative scenarios, run on its fixture, is reported as not conforming, naming the case | One that reports the exit status as the verdict |
| engineering/T15 | A listed package is reported as not conforming, never as passing. An unlisted one that fails turns the run RED, naming it | One that skips listed packages silently |

The numbers follow T10 and T11, which engineering/C5 (#610) plans.

Approving this PLAN authorizes the engineering/C7 DO only, after its prerequisites are on `main` and a synchronization is authorized. It authorizes no synchronization, promotion or publication, and no Change in Testing's, Packaging's, Guard's or any package's tree.
