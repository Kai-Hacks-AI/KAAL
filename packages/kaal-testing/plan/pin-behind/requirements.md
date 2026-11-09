# Pin-behind in the acceptance evidence: Requirements

Each Requirement names, in brackets, the Intents it serves.

## Functional

- **testing/F117** [testing/I34]: **A manifest entry carries the packed version.** A manifest entry is `{ tarball, sha256, integrity, version }`, where `version` is the packed package's own `version`. The packer (Engineering's `engineering/delivery/pack.mjs`) records it; Testing only reads it. An entry without a `version` cannot support a `pin-behind`.
- **testing/F118** [testing/I34]: **Nested and older is `pin-behind`.** A held entry for a packed package whose integrity differs from the packed one, whose path is nested (it has more than one `node_modules/` segment, so some consumer holds it) and whose version is strictly lower than the manifest's `version`, gives a finding of kind `pin-behind` and no verified failure. The finding names `subject` (the scenario), `consumer` (the package that nests it, the segment before the last `node_modules/`), `package`, `held` (its version), `packed` and `host`.
- **testing/F119** [testing/I35]: **Everything else stays a verified failure.** A differing entry is a verified failure when it is top-level (one `node_modules/` segment), when it is nested with a version equal to the packed one (a duplicate with other bytes) or above it, when either version is not a plain `x.y.z`, when the held entry has no version, or when the manifest entry has none. The evidence names which of these it is.
- **testing/F120** [testing/I34]: **`passed` is not decided by `pin-behind`.** `accept` returns `passed` true with `pin-behind` findings present, as with `unknown` findings (the existing rule: only `verified failure` decides). The findings stay in the result in full, so a gate that wants to fail on them says so itself.
- **testing/F121** [testing/I35]: **An entry equal to the packed bytes is no finding.** A nested or top-level held entry whose integrity equals the packed integrity is neither a failure nor a `pin-behind`, whatever its version.

## Nonfunctional

- **testing/N25** [testing/I35]: The change is only in how `findings` classifies a differing held entry. The records, ledger, install and runner behaviour, and every existing finding text for the cases that stay failures, are unchanged, and no existing Case is weakened.
