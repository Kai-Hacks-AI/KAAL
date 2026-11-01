# graph/C10: scoped Hosting compatibility on the Graph collector

## Intent and authority

Complete the dependency preparation already required by graph/C4 (graph/A7, graph/A8)
and Hosting's approved hosting/C10 and hosting/C11 (#629, #657), following Owner's
focused-integration direction on #659. This does not authorize a collector SYNC,
promotion, publication or merger of this Change.

## PLAN

Apply only #657's scoped package identity, public package metadata and reference
updates to the current Graph base. Update each importer and workspace command
together, including the lockfile, sorted reference expectations and the digest
of Testing's changed boundary case. Preserve every Hosting runtime source file.
Do not bring Hosting's later boundary, portability, release or Skill work across.
Existing tests keep their contracts; only package specifiers change.

Core on this collector predates its accepted standalone implementation on main.
This Change changes only its Hosting specifiers. It neither imports that older
implementation into main nor resolves a future SYNC: Core's accepted standalone
implementation, registration, tests and verification must win that reconciliation.

## TDD and DO

The scoped dependency import is RED before workspace installation is aligned:
`import('@kaihacksai/kaal-hosting')` exits 1 with ERR_MODULE_NOT_FOUND.
After the reference changes and `npm ci`, the same import is GREEN and exposes
Hosting's existing `read` and `execute` functions. Existing Workspaces, Acceptance
and Engineering lanes verify the importers; Hosting's existing suite verifies its
runtime. The integration adds no runtime algorithm and no parallel recorder.

Graph's scoped identity, shipped contract, case relocation and final manifest
remain graph/C5 (#659). The exact packed-consumer release acceptance remains
graph/C6. Engineering's comprehensive publisher orchestration is an independent
dependency: #655 is on main but is absent from this collector.

## Independent validation

Hosting reviews its identity and unchanged runtime boundary. Core, Testing,
the Engineer Skill and Engineering review their own reference-only changes.
Owner reviews the focused integration and any later SYNC independently. Ordinary
integration uses a squash merge; #621 remains HELD.
