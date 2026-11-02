# Foundation 0.0.2 declaration delivery

foundation/C15 PLAN; foundation/C16 is the bounded DO. C13/C14 and T37–T45
remain reserved for #747; none of that boundary-testing work is a prerequisite.

- **foundation/I10**: An installed Foundation package supplies Foundation's own
  authoritative Capability Node for an explicitly requested Core registration,
  without transferring declaration ownership to Core or adding a dependency.

## CHECK, 2026-11-02

| Subject | Observed head | State |
| --- | --- | --- |
| main | f30221f481c4682e81b092e6a772365f3d7a9f6d | Published-state package is 0.0.1; no Capability Node ships |
| kaal/foundation | f77de4efc57ddc239a6fb118fbdbe2e4b6a8326f | #743 C11 PLAN integrated; declaration absent |
| #743 | 73003c01f266b0dc9b7ddcdf05e7e5dfc4e94db7 | Owner-approved, merged by squash |
| #749 C12 | 2ab6d3bf4092e1bc0f1fe2885cb200b0b5fdae42 | Open; Node and ownership claim implemented; deliberately neither ships |
| #747 C13 | ddec6627e834b2705470dc14c780dde0f45908db | Open; semantic clarification supplied; no Owner approval observed |

#749's Node is suitable. It names Foundation, uses Core's existing KAAL Capability
type reference 56fe97bfa390114264f234bc3198103cb46da306736200af7bc47c0484bcf02e,
and hashes to 649fbafb81a8d976b65a4e8c0db7228a194ec515385820d489e4a74041dc27c5.
Its claim names that identity and exactly packages/kaal-foundation/. No identity
or claim rewrite is needed. Node identity follows exact bytes, not npm version.

The last independently observed #749 KAAL run is 41237340218, success, with
Workspaces and Linux/macOS/Windows Acceptance. The bot reports no findings on
2ab6d3b; no formal APPROVED review is present. Those results predate declaration
delivery and do not establish this release candidate's acceptance.

Published 0.0.1 is immutable. The existing SHA-256 subpath, CLI and bootstrap
remain compatible. No npm tag, version, tarball or release record is rewritten.
