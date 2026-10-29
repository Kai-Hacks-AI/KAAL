# kaal-change 0.0.1 Release: Requirements

Each Requirement names, in brackets, the Intents it serves.

## Nonfunctional

- **change/N6** [change/I11, change/I14]: The package has no runtime dependency.
  - Graph is an optional peer, needed only by the delivery entry point (`change/C1`).
  - Core is never required. Registering the package's Nodes with a KAAL Engine is an optional complement the consumer chooses (`change/N5`).
  - Testing is never imported. Change reads Testing's Case Results as data (`change/A10`).
- **change/N7** [change/I13]: Consumer verification uses only Node's built-ins and the installed package. It reads no source checkout, no workspace and no network, and writes nothing outside a temporary directory it removes.

## Functional: the package

- **change/F18** [change/I11]: The package is published as `@kaihacksai/kaal-change`, version 0.0.1, under the MIT license.
  - Its public entry points are `./record`, `./lifecycle` and, from `change/C1`, `./delivery`.
  - It ships `capability/`, `lib/`, `docs/`, its consumer tests and their manifest, and nothing else.
  - `plan/`, Change Records and publisher-only tests are not shipped.
- **change/F19** [change/I11]: Without Graph installed, every entry point but `./delivery` works.
  - `./delivery` still loads. `assess` returns no verdict, no views and no exchange, only one finding: `cannot-assess`, naming the missing optional peer.
  - It never throws an unexplained module error, and never reads as delivered or as not delivered.

## Functional: documentation

- **change/F20** [change/I12]: The package ships `docs/` with these documents:
  - `intent.md`, `requirements.md`, `architecture.md` and `testing.md`, consolidating the product contracts of the Changes the release includes;
  - `limitations.md`, listing what 0.0.1 does not establish;
  - every identifier a shipped case cites, defined in one of them.

  No document cites a PLAN, a Change Record, an Engineering path or a Change as its authority.
- **change/F21** [change/I12, change/I15]: The README states operation:
  - **Start.** Install, and optionally install Graph.
  - **Use.** Each entry point, with a working example.
  - **Verify.** Run the installed package's tests and read the result.
  - **Register.** An optional complement, with how to retract it.
  - **Remove.** What uninstalling leaves in place.
  - **Release notes.**

## Functional: consumer verification

- **change/F22** [change/I13]: `npm test`, run inside the installed package, is the consumer verification.
  - **Locating the package.** It locates the installed copy by resolution, never by a source path.
  - **Checking the files.** It compares the installed files with the shipped manifest.
  - **Running the cases.** It runs every case the manifest declares against the installed copy.
  - **The result.** It gives exactly one result, each with its own exit status and its own summary:
    - **failed** when any case failed;
    - **unknown** when none failed but a declared case did not run, was skipped, or the manifest does not match;
    - **verified** only when every declared case ran and passed.
  - **Zero cases.** A manifest declaring no case is unknown, never verified.
- **change/F23** [change/I13, change/I11]: The optional peer is an explicit scope, never a silent pass.
  - **Without Graph.** The delivery cases do not run, are reported as not run because the optional peer is absent, and the result is unknown.
  - **Narrowing the scope.** A consumer that does not use delivery may name it as excluded. Excluded cases are listed under that exclusion in the evidence, and the result covers only the rest.
  - **What is never allowed.** An exclusion is never implicit, never hides a case that ran, and never empties the scope.
- **change/F24** [change/I13]: The evidence names what was exercised: the package name, its version, where it is installed, the digest of its installed bytes, Graph's name and version or its absence, and any exclusion. Each case is labelled consumer evidence. Publisher-only evidence, such as the repository's own tests and plan tests, is never counted in the consumer result and is named as publisher-only wherever it is reported.

## Functional: acceptance and removal

- **change/F25** [change/I14]: Acceptance packs the package and installs the artifact into a fresh directory with no workspace links. It then runs consumer verification there twice: with Graph's packed artifact installed, and without it.
  - With Graph, the result is verified.
  - Without Graph, the result is unknown, and becomes verified once delivery is excluded.
- **change/F26** [change/I15]: Uninstalling the package leaves every file outside its installed directory unchanged, including the consumer's Change Records and Change Nodes. Verification writes nothing outside its temporary directory.
