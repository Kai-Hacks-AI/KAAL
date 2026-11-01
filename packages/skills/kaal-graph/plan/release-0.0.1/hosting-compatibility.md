# graph/C10: scoped Hosting compatibility on the Graph collector

## Intent and authority

Complete the dependency preparation already required by graph/C4 (graph/A7, graph/A8)
and Hosting's approved hosting/C10 and hosting/C11 (#629, #657), following Owner's
focused-integration direction on #659. This does not authorize a collector SYNC,
promotion, publication or merger of this Change.

## PLAN

Apply only #657's scoped package identity, public package metadata and reference
updates to the current Graph base. Update the non-Core importers and workspace commands, including their lockfile
entries, sorted reference expectations and Testing's changed boundary-case digest.
Core's 14 reference-only edits are a separate Core-owned draft Change. The two
namespace halves are not independently installable: neither order closes the
workspace dependency graph without both. Do not infer merge readiness from
path isolation; Owner and importer owners must resolve admission and ordering. Preserve every Hosting runtime source file.
Do not bring Hosting's later boundary, portability, release or Skill work across.
Existing tests keep their contracts; only package specifiers change.

Core on this collector predates its accepted standalone implementation on main.
This non-Core Change leaves that entire Core tree unchanged from its target.
The separate Core draft changes only its Hosting specifiers. It neither imports that older
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

## Split review and lockfile correction

The original 61 paths are split into 47 non-Core paths and a separate 14-path
Core namespace adaptation plus its own root-lock support file. Both scopes
conform to unchanged Change Isolation. No protected ref or main Core content
is changed. The split Core reference patch is collector-local, not a replacement
for standalone Core on main and not a promotion candidate.

The original lock incorrectly declared `kaal-hosting-boundary`, absent from
this Hosting package manifest. Independent offline npm lock generation on the
combined candidate removes that leaked bin entry; it is absent from both halves.
Each half's lock records only that half's manifest delta without fabricated
registry metadata. Independent offline lock generation for either half fails
because the other Hosting identity is unavailable. Combined-candidate evidence
does not establish either half's installed acceptance or authorize integration.

Required reviews: Core for its separate namespace patch and the standalone
preservation boundary; Hosting for eight identity/reference paths; Testing for
eight paths and its evidence digest; Engineer Skill for seven paths; Engineering
for nineteen paths including root metadata, lock and command selections.

After review, any refresh must use actual integrated collector tips. C5 #659
is still stacked on the historical combined candidate and needs a separately
reviewed refresh after the dependency route is accepted. C6/T13, #621 promotion,
SYNC and publication remain separate. Never merge these drafts merely to make
the next draft's dependencies resolve.
