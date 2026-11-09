# Engineering: the Boundary Engine's applicability by detector and file kind

Capability: Engineering. Target: `kaal/engineering-boundary-engine`. Record number provisional until integration. DO of the approved PLAN `engineering/boundary/scope/PLAN.md` (#1310). It authorizes no promotion, version bump, SYNC, ledger entry, release dispatch or npm publication.

- **Applicability:** `file-identity` applies to every regular file; the code detectors apply to JS/TS and the `js`/`ts` code blocks of Markdown; JSON and YAML are parsed as data. A file kind with no parser is recorded in `coverage.notApplicable` as `{ path, detectors, reason }`, is not counted as read, and no longer makes the result unknown. An empty read set is still unknown.
- **Lists supply the reasons:** `engineering/boundary/scope.mjs` and the global list `engineering/boundary/scope/not-applicable.md` (`LICENSE`, `.gitignore`, `.gitattributes`, `CODEOWNERS`, the `.git` pointer); a definition may carry `not-applicable:` locally. Entries are exact names or extensions with a reason; a parsed kind, a glob, a path, a target, a role, a missing reason or a duplicate is refused.
- **A parse failure is never hidden:** a supported file that does not parse is `unreadable`, so the result is unknown, whatever a list says.
- **Cases:** T20 changed (unsupported kind is not applicable), T21 to T25 added, on fixtures.
- Not in this Change: Foundation's local list, the invalid YAML template fix (`guard.yml`), the shell ports.
- **Evidence kept per provider (CPO review):** each `notApplicable` entry carries `provider`, its `detectors` and `byteChecked`; entries are merged only for the same file, provider and reason, with detectors unioned in sorted order, so one definition never hides another's. `read` means the structural detectors read the file (parsed source or data); `byteChecked: true` says `file-identity` ran on the bytes of a file no parser read. Case T26.
