# kaal-packaging: Limitations

- **Known provenance only.** `measure` runs npm on the artifact, and neither npm nor Hosting bounds npm's time or memory. Measure artifacts whose origin you know, such as one a lane just packed (packaging/N5).
- **Recorded resolution is not provenance.** packaging/F7 reads where the consumer's install recorded each runtime dependency as resolved from, with its integrity. That is what the install recorded, not independently verified provenance (testing/F14). A dependency the install records nothing for is unknown.
- **Testing's model functions are the caller's.** Packaging takes no dependency on Testing. Without Testing's model functions, packaging/F13 is unknown for a package that ships a model. The `conform` command hands in none, so it reports F13 unknown for such a package; call `conform` from the library with Testing's `check` and `tested` to decide it.
- **One realization.** Only npm artifacts are read today (packaging/A5). Another ecosystem needs its own realization.
- **Private.** `kaal-packaging` is not published. It holds itself to the contract it enforces all the same (packaging/F15).
