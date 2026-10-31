# KAAL Packaging: Limitations

<!-- Shipped with kaal-packaging. The plan/ documents in the source repository record each Change that set these. -->

What Packaging does not claim, and where a result depends on something outside it.

- **Known provenance only.** `measure` asks the ecosystem's own tool to describe an artifact. npm's time and memory grow with the artifact, and neither npm nor Hosting bounds them, so `measure` is for artifacts whose producer the caller trusts, such as one a lane just packed (packaging/N5).
- **npm 11.18.0 or later.** An older npm expands a decompression bomb instead of refusing it, so `measure` refuses it, naming both versions (packaging/N6).
- **One ecosystem.** Only npm artifacts (`.tgz`, `.tar.gz`, `.tar`) and npm install records are read. Another ecosystem needs its own realization (packaging/A5).
- **Registry resolution is read from the install record.** packaging/F7 decides where each runtime dependency came from by reading the consumer's npm lockfile, and fetches nothing (packaging/F19, packaging/A14). A consumer without a lockfile leaves packaging/F7 `unknown`. Packaging does not check that the registry still serves the package, or that the recorded integrity matches what the registry serves today.
- **Packaging's own packaging/F7.** Packaging depends on `kaal-hosting` and `@kaihacksai/kaal-foundation`. Until both install from a registry, a consumer can only install them from local tarballs, so Packaging's own `conform` reports packaging/F7 `failed` and names them (packaging/T27).
- **Traceability needs Testing's model functions.** packaging/F13 reads a shipped model only through the `check` and `tested` its caller hands in. The `kaal-packaging conform` command hands in none, so a package that ships a model is `unknown` for packaging/F13 there (packaging/F13, packaging/N8).
- **Results until testing/C29.** Until Testing's verifier contract is approved, a result line is checked only for the three results and their exit codes 0, 1 and 2 (packaging/A8).
- **Imports are read from text.** packaging/F9 and packaging/N8 read import specifiers from the shipped modules' text, so an import built at run time is not seen.
- **Behaviour, not adequacy.** packaging/N9's probe shows that a verification depends on the modules' behaviour. Whether its assertions are adequate stays its owner's.
- **Private.** `kaal-packaging` is not published (packaging/A1). It is used from this repository's workspace or from a packed tarball.
