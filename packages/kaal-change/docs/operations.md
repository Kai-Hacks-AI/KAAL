# Operations

Use Node 24 or later. Import `isolate` from
`@kaihacksai/kaal-change/isolation`, passing a proposal and Graph/owner model as
described in Architecture. Supply source snapshots independently of a candidate
when applying this to a repository; the product does not acquire them.

The model assessment is `isolated` when no violation/unknown finding is found
within the supplied model. It is `violated` for malformed proposals or selected
scope without an impact trace under complete supplied evidence. Missing facts are
`unknown`. Inspect all findings and qualifications rather than mapping the first
word to a repository GREEN.

A normal package install resolves its required Foundation, Graph and Hosting
dependencies. Run the delivered consumer checks without a separate provider
installation step:

```sh
npm explore @kaihacksai/kaal-change -- npm test
```

The final `kaal-change-verification` record contains result, exit, each Case,
causes and observed package/manifest identity. `verified` exits 0, a required
Case failure is `failed`/1, unavailable/malformed/tampered/incomplete evidence is
`cannot verify`/2. Missing providers are reported as cannot verify.

Before packing from source, run `npm run manifest` to regenerate the delivered
file/Case inventory from npm's actual pack list and an observed successful run.
`prepack` does the same. `node test/publisher/manifest.mjs --check` checks without
writing. Publisher/acceptance tests do not ship. No command publishes to npm,
modifies CI or edits a consumer's application files.

## Using the skill

The 0.0.1 package contains `skills/kaal-change/SKILL.md`, its references and a
controlled executable example. Configure discovery through the host's normal
mechanism; copying the whole skill directory preserves its relative resources.
Keep the installed package and its providers resolvable where the example runs.
Follow the skill in conversation even when an executable model is unavailable.
External use keeps that installation in the operator environment, outside the
managed target; it never requires embedding KAAL into that target.

For an existing Engine in Embed mode, register the Skill contribution with Core's
public command, substituting the actual installed package and Engine locations:

```sh
kaal register skill change <installed-package>/payload --engine <engine>
```

The host chooses the Agent Skill discovery location separately. Registration
admission alone does not install an agent's instructions or prove workflow use.
No install-to-target or workflow-writing command is delivered by Change.

Version 0.0.1 covers only this skill anchor and supplied-model isolation. Obtain
reviewed tarballs from the delivery process until registry publication is
separately authorized; no publication is implied by the package version.

## Production installation and release prerequisites

Change declares exact Foundation, Graph and Hosting versions as required package
runtime dependencies. The semantic module remains pure and imports only
Foundation; package installation also supplies the providers for shipped Cases
and examples. Verification performs no dependency installation or registry
acquisition. Removing a provider is an incomplete installation, reported as
cannot verify; no required Case is silently skipped or removed.

Registry publication requires those exact dependency versions to be published
first. Release readiness must refuse missing versions. Local artifact overrides
can exercise npm's production dependency resolution before publication, but do
not establish public registry availability or publication provenance.
