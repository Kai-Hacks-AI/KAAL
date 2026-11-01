# Proposal validation

Date: 2026-11-02. Engineering collector base
`add3abf8e9c6df05dcd9f3139f696524890b1f2f`.

The selector patch is derived from accepted main
`f30221f481c4682e81b092e6a772365f3d7a9f6d`. Exactly three occurrences of the
old name-based workspace build are replaced with the directory selector. The
patch applies cleanly to that immutable workflow. No live workflow is changed.

The exact proposed directory selector, `npm run build
--workspace=packages/extensions/kaal-hosting`, succeeds both in accepted main's
unscoped Hosting workspace and in #830's scoped workspace after clean npm ci.
This is build/selector compatibility, not release or workflow acceptance.

#830's uploaded tree `4ad48b95760ea6806f6d954ecbc2747090d9ddbd` equals its
locally tested tree. Current trusted-main Branching classifies it as an ordinary
Change into Hosting, squash; unchanged target isolation accepts all ten paths.
Current main reports Change Record numbering not yet in force because its
record-rule module is absent. C29 records its proposed claim for later judgment.

No behavioral test is added for this documentation/proposal-only Change. Its
negative/positive admission obligations are proposed cases for a future reviewed
DO, not executable GREEN. Historical complete Hosting and new local controlled
results are explicitly attributed in route.md. Actual required CI runs separately
on every draft; Branching's auto-merge-off hold is retained. Neither local
selector success nor a proposed admission design is independent Owner approval.

First-publication preparation must verify the download method for the actual
artifact format. Existing Engineering #737 proposes the artifact-API download
correction. Re-evaluate its exact current delta if needed; never promote the
whole Engineering collector based on its historical three-file description.
The Owner must receive the one tested tarball and matching bound record, not a
local repack. This proposal dispatches or publishes nothing.
