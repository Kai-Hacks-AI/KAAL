# Initial CHECK evidence, 2026-11-02

Read-only upstream inspection used main f30221f and collector f77de4e plus exact
#743/#749/#747 heads in intent.md. No protected branch or existing PR was changed.

Local reference: Node 24.22.1, npm 11.9.0, Linux. Foundation #749's 46 tracked
package files were materialized byte-for-byte through GitHub, with its referenced
AGENTS/Core Node and the repository's .kaal and package payload Markdown files.
This is a Foundation verification snapshot, not a complete repository checkout;
root Workspaces/Engineering/Acceptance were not rerun locally.

- Existing Foundation source npm test: 9 Embedded cases passed; 34 publisher
  tests passed; final result verified. Existing tests were not changed.
- New T46: RED, exact owner Node/claim checks pass first, then the missing public
  ./capability export fails. New T50: RED, ERR_PACKAGE_PATH_NOT_EXPORTED.
- New normal-pack/consumer T47: RED because the declaration is absent from the
  packed inventory. T48: RED because installed declaration bytes do not exist.
  T49: RED at public resolution after installation; not a tooling/setup failure.
- T51's ledger-backed scenario is planned and not run at this stage. A complete
  source checkout and existing lane supply Testing/Hosting and native host jobs.
- #749 upstream KAAL run 41237340218 succeeded, including Workspaces and native
  Linux/macOS/Windows Acceptance. That demonstrates the old candidate only.
  Bot review on 2ab6d3b reports no findings; no formal APPROVED review observed.

These observations establish the delivery gap. They do not establish 0.0.2
acceptance, Core initialization integration, registry resolution or publication.
The release workflow currently pins npm 11.21.0; local npm 11.9.0 evidence is not
represented as the authoritative Release artifact.

Root-lock inspection confirms packages/kaal-foundation version 0.0.1 and Core's
exact 0.0.1 dependency. Main's existing Core Acceptance asserts that pin and no
nested Core dependencies. This exposes the separate owning compatibility and
trusted-main admission work described in architecture.md; neither is solved by
Foundation's clean standalone tarball trial.
