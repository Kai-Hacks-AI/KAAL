# Setup independence: Requirements

Each Requirement names, in brackets, the Intents it serves.

## Nonfunctional

- **core/N32** [core/I45]: A declared verdict supports the claim and never proves it. A package that declares no other KAAL package may still import one, or need one installed. Core never reports a package as demonstrated independent, because it runs nothing. Anything it cannot read is `unknown`, never independent.

## Functional

- **core/F121** [core/I44]: Core's payload carries a `Setup Independence` Definition Node, typed by `KAAL Definition`, that states setup independence as a property of a capability package: its runtime needs name no KAAL package except `@kaihacksai/kaal-foundation` and `@kaihacksai/kaal-hosting`. What a package needs only to be built or tested, its `devDependencies`, is not a runtime need and is out of scope. The two names are the Definition's and no caller changes them.
- **core/F122** [core/I44, core/I45]: `judgeSetupIndependence(manifest, { accepted? })` is pure. It reads a package's declared `dependencies`, `optionalDependencies`, `bundleDependencies` and its `peerDependencies` unless `peerDependenciesMeta` marks that peer optional. Each KAAL package it names beyond Foundation and Hosting is one finding, naming the field and the package. A KAAL package is a name of the form `kaal-<name>` or `@kaihacksai/kaal-<name>`. It returns `declared`, which is `independent` with no findings, `dependent` with any, or `unknown` when the manifest is not an object or a dependency field it holds is not the shape it should be. A field that is absent is no dependency. `accepted` never changes `declared`.
- **core/F123** [core/I45]: The verdict states what was shown. It carries `demonstrated`, which Core always reports as `unknown`, so a declared `independent` is never read as a demonstrated one. The demonstration is another's evidence: an isolated installation of the packed package, by the capability's acceptance harness.
- **core/F124** [core/I45]: `accepted` is the adopter's list of KAAL packages it accepts in a setup. A finding for an accepted package is marked `accepted`, and the verdict carries `acceptable`: true only when `declared` is not `unknown` and every finding is accepted. A package cannot grant itself an acceptance, and an accepted dependency leaves `declared` as `dependent`.
