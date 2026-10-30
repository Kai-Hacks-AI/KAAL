# kaal-core 0.0.1 Release and Consumer Readiness: Intent

This is `core/C28`, a PLAN Change. It ships no code and no document a consumer installs. `core/C29`, its DO, turns the planned tests GREEN. It authorizes no synchronization, promotion, version change or npm publication: those remain the Owner's.

The Owner decided the scope of kaal-core 0.0.1 on #600 (2026-10-29): **Option B**. Registration and capability composition are part of 0.0.1, not deferred to a later version. The order is the aligned `core/C30` PLAN (#600), then a bounded `core/C26` Registration DO (from #518), then explicit Core consumer readiness and release acceptance. This PLAN records that scope as Core's release dependency map, plans consumer readiness and release acceptance, and names what Core needs from other owners.

On #622 (2026-10-29) the Owner aligned two release dependencies. Core, Graph, Hosting and Foundation publish under the `@kaihacksai/kaal-*` namespace, consistent with Guard. Foundation becomes a separately installable, published package. Each owning capability plans its own rename or publication readiness and verifies its own packed consumer experience. Core renames only kaal-core.

The Owner also set the bar for what a consumer receives, and named `@kaihacksai/kaal-guard` as the standard: Core's published package must match or exceed Guard's **documents and tests actually delivered inside the installed package**. A fresh consumer, with no KAAL repository and no prior KAAL knowledge, must be able to:

- read a coherent Intent, Requirements, Architecture, limitations and operations of the package;
- run meaningful verification that ships with the package, with documented commands;
- tell the tests it can run from the publisher's Engineering tests, with their scope, expected results and honest coverage;
- learn the package's semantics, guarantees, boundaries, installation, use, verification and removal from the package alone, without unpublished repository plans.

Never claim that publisher-only tests ran in a consumer's installation, and never accept a zero-test false GREEN.

- **core/I22.** kaal-core 0.0.1 releases Core with registration and capability composition, and a consumer who installs it receives what Guard's consumers receive: documents that explain the package and tests that verify the installed copy.
  - Its registration scope is that of `core/C24` as revised by `core/C30`: scoped kind identities, owner-defined outgoing rules, derived incoming views, discoverable same-term ambiguity, and non-silent reporting compatible with PREACH.
  - Core gains no semantic ownership. What a kind means, and how a shared term is aligned, stay with their owners.
- **core/I23.** A release is accepted from the packed artifact in a clean installation, not from the repository: the shipped file list, the test entrypoint, the dependencies and the failure behaviour are observed where a consumer observes them.

## Revision: `core/C36`, alignment with the KAAL Package contract

`core/C36` is a PLAN Change that revises this one before `core/C29` starts. Like this PLAN, it authorizes no synchronization, promotion, version change or npm publication.

Packaging's generic KAAL Package contract (packaging/C4, #658) asks each product to state how it meets each generic duty, in the runtime-dependency order the Owner set: Foundation, Hosting, Graph, then Core. Engineering's release-baseline trace (#610, `engineering/research/release-baseline.md`) found where kaal-core falls short:
- `core/F70` decided `verified` on counts, with no declared inventory of cases. A delivered case that silently stops running would still read `verified`, which is the false GREEN `core/I22` rules out.
- kaal-core declared no supported platforms.
- No requirement kept the consumer's environment intact.
- Consistency with the shipped list was not told apart from provenance.

`core/C36` closes each gap by citing the generic duty and Testing's meaning, never by restating them. It revises `core/F70`, `core/F72`, `core/A33`, `core/A34` and core/T76, and adds `core/F85`, `core/F86`, `core/N23`, `core/A43`, core/T91 and core/T92. Each place it changes is marked "revised by `core/C36`".

