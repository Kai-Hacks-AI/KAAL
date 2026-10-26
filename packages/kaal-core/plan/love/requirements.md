# Core as a Package, and LOVE: Requirements

Each Requirement names, in brackets, the Intents it serves.

## Nonfunctional

- **core/N11** [core/I9, core/I11]: Core depends on no discipline. kaal-core declares no KAAL package other than `kaal-graph`, `kaal-hosting` and `@kaihacksai/kaal-foundation` in any of its dependency fields (`dependencies`, `devDependencies`, `peerDependencies`, `optionalDependencies`). No file kaal-core delivers or tests with imports any other KAAL package. This holds however a discipline uses Core: Testing may consume Core's types and admission, and the dependency then runs from Testing to Core, never back.

## Functional

- **core/F39** [core/I10]: Core's payload carries a `LOVE` Definition beside `CASE`, typed by `KAAL Definition`. It states:
  - the four criteria;
  - that meeting them is a maturity judgment, not a mandate to publish;
  - that a packaging decision never authorizes a release.

  Its Verification criterion names Testing's contract evidence as the meaning of independent evidence, by Definition name only (`core/I11`). Adding it changes neither the Kernel's bytes nor the id of any existing Node.
- **core/F40** [core/I9, core/I10]: Core is a Capability of its own. A `Core` Node typed by `KAAL Capability` names what Core is responsible for (`core/I9`). An ownership claim, `packages/kaal-core/ownership.kaal.json` in Testing's claim format, names that Node and claims Core's tree. It is repository data and is not delivered. Core owns its claim. How a claim is read and attributed is Testing's.
- **core/F41** [core/I10]: Core's consumer-visible interface is declared, and nothing else can be reached:
  - **Declared:** every entry point in kaal-core's `exports`, and every value each entry point exports, is named in Core's README.
  - **Unreachable:** a module that `exports` does not list does not resolve.

  An exported value the README does not name is either documented as interface or stops being exported. No value is exported "for KAAL's own packages only".
