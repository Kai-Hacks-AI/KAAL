# Recorded decisions: a package published to a public registry

Consumer: a library published to a public package registry, consumed by strangers. Recorded by following `SKILL.md` and `references/npm.md` step by step.

## 1. Assess the context
Released: one package. From the repository to the public registry. A published version cannot be taken back in practice and strangers install it, so a failure is expensive. Decider: the maintainer who owns the package.

## 2. Choose the identity of the release
A Semantic Versioning 2.0.0 version, unused on the registry. Check with `npm view <package>@<version>` that it is unused.

## 3. Establish readiness
Verification evidence for the exact tarball, and a validation of the result. The version must not exist yet.

## 4. Choose the controls and the authority
One approval by a maintainer who is not the author of the change, because the release cannot be reversed. The author never approves.

## 5. Preserve the identity of the artifact
Run `npm pack` once. Test that tarball and publish that same tarball. No rebuild between test and publish.

## 6. Promote or publish
Use npm trusted publishing (OIDC) so no long-lived token exists, and publish with npm provenance.

## 7. Verify what arrived
Install the published version into a clean directory and run what a consumer would run. A maintainer validates what was observed.

## 8. Announce
A changelog entry and a tag that names the version.

## 9. Recover
`npm deprecate <package>@<version>` with a message, then release a fixed version. Name the earliest step at which the failure could have been found.
