# kaal-change 0.0.1 Release: Requirements

Each Requirement names, in brackets, the Intents it serves.

**The generic contract is Packaging's.** `@kaihacksai/kaal-change` is a KAAL package, and conforms to the generic KAAL Package contract, packaging/F7–F14 and packaging/N7–N10 (`packaging/C4`, #658), as Packaging states it. The Requirements below do not restate it. They state only what is specific to Change, and each one names the generic Requirement it realizes (the Owner's review 5717447317).

- **change/F30** [change/I12, change/I13, change/I14]: **Which Change Requirement realizes which generic one.**
  - packaging/F7, identity: change/F18 and change/N6.
  - packaging/F8, shipped documents: change/F20 and change/F21.
  - packaging/F9 and packaging/F14, the installed and the source `npm test`: change/F22 and change/A15.
  - packaging/F10, the result: change/F22, through Testing's verifier contract.
  - packaging/F11, the manifest: `test/verify.json` (change/F22, change/F24).
  - packaging/F12, runtime and platforms: change/F31.
  - packaging/F13, coverage: change/F32.
  - packaging/N7 and packaging/N8, an intact consumer and a self-contained verifier: change/N7 and change/F26.
  - packaging/N9, behaviour and not presence: every case in change/T24–change/T35.

  Where a Change Requirement and a generic one disagree, the generic one governs, and the disagreement is a defect of this plan.

## Nonfunctional

- **change/N6** [change/I11, change/I14]: The package has no runtime dependency.
  - Graph is an optional peer, needed only by the delivery entry point (`change/C1`).
  - Core is never required. Registering the package's Nodes with a KAAL Engine is an optional complement the consumer chooses (`change/N5`).
  - Testing is never imported. Change reads Testing's Case Results as data (`change/A10`).
- **change/N7** [change/I13]: It realizes packaging/N7–N8. Consumer verification uses only Node's built-ins and the installed package. It reads no source checkout, no workspace and no network, and writes nothing outside a temporary directory it removes.

## Functional: the package

- **change/F18** [change/I11]: The package is published as `@kaihacksai/kaal-change`, version 0.0.1, under the MIT license.
  - Its public entry points are `./record`, `./lifecycle` and, from `change/C1`, `./delivery`.
  - It ships `capability/`, `lib/`, `docs/`, its consumer tests and their manifest, and nothing else.
  - `plan/`, Change Records and publisher-only tests are not shipped.
- **change/F19** [change/I11]: Without Graph installed, every entry point but `./delivery` works.
  - `./delivery` still loads. `assess` returns no verdict, no views and no exchange, only one finding: `cannot-assess`, naming the missing optional peer.
  - It never throws an unexplained module error, and never reads as delivered or as not delivered.
- **change/F29** [change/I11, change/I13]: **`cannot-assess` is a diagnostic a consumer can act on** (the Owner's follow-up 6517590098). Its one finding is `{ kind: "cannot-assess", peer, next }`.
  - **It names what is missing.** `peer` is exactly `@kaihacksai/kaal-graph`.
  - **It says what to do next.** `next` is Change's own recovery guidance for this case, in this order, and nothing else:
    - `{ action: "install", peer: "@kaihacksai/kaal-graph" }`: install or enable Graph in the consumer, then assess again;
    - `{ action: "analyze" }`: read the Change Nodes as Bare content, with an agent's or a person's help. It is offered because no more precise action is known without Graph.
  - **No invented remedy.** No other action is offered, and none names a file, a command or a package other than the peer.
  - **Inability is not failure.** It is never a delivery result. Nothing reads as delivered, not delivered, satisfied or failed.
  - **Nothing is done on the consumer's behalf.** `assess` installs nothing, resolves nothing from the network, and writes nothing.
  - **Whose contract.** The form of a diagnostic is Testing's. Change supplies only the guidance of its own case. Testing defines no diagnostic form yet, so these members are Change's own (change/F13), and adopting a later Testing form is a Change of Change's own.
  - **Consumer verification carries it.** Without Graph, the evidence's reason for each Graph case that does not apply names `@kaihacksai/kaal-graph` and the same next step.

## Functional: documentation

- **change/F20** [change/I12]: The package ships the documents of packaging/F8. What is Change's is their content:
  - `intent.md`, `requirements.md`, `architecture.md` and `testing.md` consolidate the product contracts of the Changes the release includes;
  - `limitations.md` lists what 0.0.1 does not establish, including what cannot be assessed without Graph;
  - `operations.md` is the authoritative Operations document (change/F21);
  - every identifier a shipped case cites is defined in one of them.

  No document cites a PLAN, a Change Record, an Engineering path or a Change as its authority.
- **change/F21** [change/I12, change/I15]: `docs/operations.md` states operation, and is authoritative for it (packaging/F8, the Owner's D2 on #658). The README gives the overview and links every shipped document, `docs/operations.md` included. It does not state operation a second time. Operations covers:
  - **Start.** Install, and optionally install Graph.
  - **Platforms.** The runtime and platforms of change/F31.
  - **Use.** Each entry point, with a working example.
  - **Verify.** Run the installed package's tests and read the result.
  - **Register.** An optional complement, with how to retract it.
  - **Remove.** What uninstalling leaves in place.
  - **Release notes.**

## Functional: consumer verification

- **change/F22** [change/I13]: `npm test`, run inside the installed package, is Change's Embedded verification. It realizes packaging/F9–F11, which Change does not restate. What is Change's own:
  - **Its cases and manifest.** The cases are in `test/consumer/`. `test/verify.json` is the packaging/F11 manifest, and declares when each case applies (change/F23) and what each Requirement is traced to (change/F32).
  - **Locating the package.** It locates the installed copy by resolution, never by a source path.
  - **The result.** Its result line and exit statuses are Testing's verifier contract (testing/C29, #639), as Packaging references it (packaging/F10). Until that contract is approved, it gives the three results with exit statuses 0, 1 and 2 that every product agrees on. An installed file that differs from the manifest is unknown (testing/F43).
- **change/F23** [change/I13, change/I11]: **Verifying the package is not assessing a Change** (the Owner's review 5705681738). The installation decides which cases apply, explicitly, and an absent optional complement is not an untested gap.
  - **Applicability is declared.** The manifest declares, for each case, when it applies: always, with Graph installed, or with Graph absent.
  - **Without Graph.** The absence cases apply: `./delivery` loads and returns the documented `cannot-assess` result (change/F19). They are real consumer tests of the optional-complement contract, so passing them can verify the installation. The cases that need Graph do not apply, and are listed as not applicable because Graph is absent.
  - **With Graph.** The full delivery path applies and must pass. The absence cases do not apply, and are listed as such.
  - **What stays unknown.** An applicable case that did not run or was skipped, a missing manifest, or a manifest that does not match is unknown, never verified. A case that failed is failed.
  - **Never empty.** Every installation has applicable cases. A scope with none is unknown.
- **change/F24** [change/I13]: The evidence names what was exercised: the package name, its version, where it is installed, the digest of its installed bytes, and Graph's name and version or its absence. It lists the applicable cases with their results, and the cases that do not apply with the reason. Each case is labelled consumer evidence. Publisher-only evidence, such as the repository's own tests and plan tests, is never counted in the consumer result and is named as publisher-only wherever it is reported.

- **change/F31** [change/I11, change/I13]: **Runtime and platforms** (packaging/F12). `engines` declares Node.js 24 or later. Operations declares Linux, Windows and macOS.
  - **Why the platforms do not differ for Change.** `lib/` imports no host module, and the verifier uses only Node's built-ins. It starts each case with the running Node executable, never through a shell.
  - **Whose meaning.** What host compatibility means, and how a platform difference is tested, is Hosting's (hosting/N1). Not-applicable cases follow testing/F47.
- **change/F32** [change/I13]: **Coverage** (packaging/F13). The manifest traces every Requirement that `docs/requirements.md` defines, either to the shipped cases that decide it or to an explicit allocation, such as a Requirement decided by publisher acceptance or validated by review.
  - **Untraced.** A Requirement with neither is reported unresolved.
  - **An absent complement is unresolved, honestly.** Without Graph, a Requirement traced only to Graph cases is decided by no case in this installation. The evidence reports it as unresolved, names `@kaihacksai/kaal-graph` and gives change/F29's next step. It is never reported as covered or verified.
  - **What the result does with it.** The result is still the result over the applicable cases (change/F23), so an absent complement does not by itself make it unknown. What covered, allocated, unresolved and not applicable mean is Testing's (testing/F47).

## Functional: acceptance and removal

- **change/F25** [change/I14]: Acceptance packs the package and installs the artifact into fresh directories with no workspace links. It then runs consumer verification in each scenario:
  - **With Graph's packed artifact installed:** verified, covering the full delivery path.
  - **Without Graph:** verified, covering the `cannot-assess` contract, with the Graph cases listed as not applicable.
  - **A case that fails:** failed.
  - **An installed file that differs from the manifest, or a missing manifest:** unknown.
  - **An applicable case that does not run:** unknown.
- **change/F26** [change/I15]: It realizes packaging/N7 for Change's own knowledge. Uninstalling the package leaves every file outside its installed directory unchanged, including the consumer's Change Records and Change Nodes. Verification writes nothing outside its temporary directory.
