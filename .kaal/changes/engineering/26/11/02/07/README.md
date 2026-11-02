# Hosting-only scoped promotion: architecture recommendation

Owner: Engineering. Target: kaal/engineering. Ordinary working Change (documentation only);
record numbering is provisional until integration.

Adds engineering/release/hosting-scoped-promotion/recommendation.md, answering the Owner's
reassessment on PR #862: Route A is not needed for Hosting; the blocker is the workspace-name
coupling, not the lockfile; package-local lockfiles are not recommended; Foundation 0.0.2
stays distinct. Evidence comes from scratch experiments on main f30221f with npm 11.

No code, workflow, manifest or lock change. No synchronization, promotion or publication.
Auto-merge is enabled; approval and required checks govern.
