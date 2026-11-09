# Requirements of the `10-npmjs` station

Controls of a station are its requirements, split into **in** (what may enter the stock) and **stock** (what must hold of what is in it). Each names what exists today (`engineering/release/`, `.github/workflows/release.yml`) and the gap. Verified against `main` at 251e814; GitHub settings (the `npm` environment, rulesets, the npmjs trusted-publisher binding) are not readable from the repository and are listed as unverified.

## In

- **release-management/F1 [I1, I2]. Version Package.** A package version entering npm is a semantic version, named once, greater than every version already published, and traceable to the Change that set it.
  - Exists: `readiness()` in `engineering/release/release.mjs` rejects a non-semver version and a version already on the registry ("raise the version"). Dependencies must be exact and already on the registry.
  - Gap G1: no check that the new version is *greater* than the latest published (a lower, unpublished version passes). G2: no tag marks the released commit. G3: no check that the version in `package.json` was set by a recorded Change, so a bump has no owner of record. G4: no changelog or bump tooling; versions are hand-edited.
- **release-management/F2 [I2]. Approve Publishing.** A publication runs only when a named person has approved it for this package, this version and these bytes.
  - Exists: `release.yml` starts by hand (`workflow_dispatch`) on the default branch only; the Publish job waits for the `npm` environment (Owner as required reviewer, per the file's header) and publishes the tested tarball through Trusted Publishing, no token, no repack (`publishable()` binds record, run, commit and digest).
  - Gap G5: the approval is a GitHub environment gate; the release record does not carry who approved. G6: the environment and trusted-publisher settings are outside the repository and unverified here. G7: a first publication of a package is manual (F34) and outside the workflow. G8: the trusted publisher lapses without a workflow publish (observed 10 Nov), and nothing in the repository reminds of it.

## Stock

- **release-management/F3 [I2]. Verify Package Promotion.** For each version in npm, the published bytes are the bytes `main` promoted: same tarball, same provenance, same commit.
  - Exists: the Accept job (step `registry`) downloads the published tarball, compares it with the tested one in `release.json` and checks the OIDC provenance against `Kai-Hacks-AI/KAAL`, `release.yml` and the release commit (`provenance()`); a fresh registry install follows.
  - Gap G9: nothing records *which promotion* put the commit on `main` (promotion PR, ledger entry), so "promoted main state" is true by the dispatch restriction only, not by evidence. G10: acceptance runs once after publication; there is no later re-check that the registry still serves those bytes. G11: for a package published by hand (F34) provenance is "none" by design.
