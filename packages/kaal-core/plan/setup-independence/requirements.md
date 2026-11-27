# Setup independence: Requirements

Each Requirement names, in brackets, the Intents it serves.

## Nonfunctional

- **core/N32** [core/I44]: The verdict supports the claim and never proves it. A package that declares no other KAAL package may still import one, or need one installed; a clean verdict says only what was declared. Anything that cannot be read is `unknown`, never independent.

## Functional

- **core/F121** [core/I44]: The Installation Contract Definition states setup independence. A capability package is setup-independent when its runtime needs name no KAAL package except the permitted shared ones. By default those are `@kaihacksai/kaal-foundation` and `@kaihacksai/kaal-hosting`. What a package needs only to be built or tested, its `devDependencies`, is not a runtime need and is out of scope. The Definition carries no list of packages beyond those two.
- **core/F122** [core/I44]: `judgeSetupIndependence(manifest, { permitted? })` is pure. It reads a package's declared `dependencies`, `optionalDependencies`, `bundleDependencies` and its `peerDependencies` unless `peerDependenciesMeta` marks that peer optional. Each KAAL package it names that is not permitted is one finding, naming the field and the package. A KAAL package is a name of the form `kaal-<name>` or `@kaihacksai/kaal-<name>`. The caller's `permitted` replaces the default and is the adopter's, so a package cannot grant itself an exception. The verdict is `independent` with no findings, `dependent` with them, or `unknown` when the manifest is not an object, or a dependency field it holds is not the shape it should be. A field that is absent is no dependency.
