# The loop applied to npm

This applies the loop in `SKILL.md` where the target is an npm registry package. These are not requirements on any other consumer.

1. **Context.** The target is the npm registry. A published version cannot be unpublished in practice, so treat the release as one that cannot be reversed.
2. **Identity.** A Semantic Versioning 2.0.0 version in `package.json`, unused on the registry. Check that it is unused with `npm view <package>@<version>`.
3. **Readiness.** Verification evidence for the exact tarball, and a validation of the result.
4. **Controls and authority.** Decide who approves publication and keep author and approver apart.
5. **Artifact identity.** Run `npm pack` once. Test that tarball, and publish that same tarball. Never rebuild between test and publish.
6. **Publish.** Use npm trusted publishing (OIDC) so that no long-lived token exists, and publish with npm provenance so that the package states where and how it was built.
7. **Verify.** Install the published version into a clean directory with `npm install` and run what a consumer would run.
8. **Announce.** Release notes or a changelog entry, and a tag that names the version.
9. **Recover.** `npm deprecate <package>@<version> "<message>"` marks a version as not to be used, then release a fixed version. Unpublishing is possible only under the registry's narrow rules.
