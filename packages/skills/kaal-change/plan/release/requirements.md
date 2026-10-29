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
  - **Running the cases.** It runs every case the manifest declares applicable to this installation (change/F23) against the installed copy.
  - **The result.** It gives exactly one result, each with its own exit status and its own summary:
    - **failed** when any case failed;
    - **unknown** when none failed but an applicable case did not run or was skipped, or the manifest is missing or does not match;
    - **verified** only when every applicable case ran and passed.
  - **Zero cases.** A manifest declaring no case is unknown, never verified.
- **change/F23** [change/I13, change/I11]: **Verifying the package is not assessing a Change** (the Owner's review 5705681738). The installation decides which cases apply, explicitly, and an absent optional complement is not an untested gap.
  - **Applicability is declared.** The manifest declares, for each case, when it applies: always, with Graph installed, or with Graph absent.
  - **Without Graph.** The absence cases apply: `./delivery` loads and returns the documented `cannot-assess` result (change/F19). They are real consumer tests of the optional-complement contract, so passing them can verify the installation. The cases that need Graph do not apply, and are listed as not applicable because Graph is absent.
  - **With Graph.** The full delivery path applies and must pass. The absence cases do not apply, and are listed as such.
  - **What stays unknown.** An applicable case that did not run or was skipped, a missing manifest, or a manifest that does not match is unknown, never verified. A case that failed is failed.
  - **Never empty.** Every installation has applicable cases. A scope with none is unknown.
- **change/F24** [change/I13]: The evidence names what was exercised: the package name, its version, where it is installed, the digest of its installed bytes, and Graph's name and version or its absence. It lists the applicable cases with their results, and the cases that do not apply with the reason. Each case is labelled consumer evidence. Publisher-only evidence, such as the repository's own tests and plan tests, is never counted in the consumer result and is named as publisher-only wherever it is reported.

## Functional: acceptance and removal

- **change/F25** [change/I14]: Acceptance packs the package and installs the artifact into fresh directories with no workspace links. It then runs consumer verification in each scenario:
  - **With Graph's packed artifact installed:** verified, covering the full delivery path.
  - **Without Graph:** verified, covering the `cannot-assess` contract, with the Graph cases listed as not applicable.
  - **A case that fails:** failed.
  - **An installed file that differs from the manifest, or a missing manifest:** unknown.
  - **An applicable case that does not run:** unknown.
- **change/F26** [change/I15]: Uninstalling the package leaves every file outside its installed directory unchanged, including the consumer's Change Records and Change Nodes. Verification writes nothing outside its temporary directory.
