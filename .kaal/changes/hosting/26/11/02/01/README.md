# Hosting release interoperability for Core

Capability: Hosting. Supporting root lock derivation: Engineering's existing C16.
Collector base: `23796c979eaae412b366a10d2dd7cef50155e0d4`.
Proposed Change `hosting/C29`; identifiers are provisional until integration.

The accepted runtime already serves Core. Its release was refused because its
four direct dependencies were ranges and its verification summary did not carry
the Release engine's required exit/causes evidence. Pin existing resolved runtime
versions and add those fields on every result, preserving the existing cause
field, all verdict meanings, case outcomes and assertions. Unexpected verifier
failure uses the same summary path. No runtime API, CLI, dependency identity,
operation, version, gate, workflow or Foundation publication changes.

Five frozen assertion REDs become GREEN unchanged; existing verifier regressions
also pass, 11/11. Engineering's unchanged helper twice derives the complete proposed
root lock from immutable base bytes and all candidate manifests, with no external
resolution/integrity delta. Detailed evidence and limits are under
`packages/extensions/kaal-hosting/plan/release-interoperability/`.

Local full source and normal prepack remain blocked by existing sandbox socket
limitations; no local packed release acceptance is claimed. Fresh three-host
source/packed CI, independent Owner review and later separate integration decisions
remain required. No merge, synchronization, promotion or publication is authorized.
