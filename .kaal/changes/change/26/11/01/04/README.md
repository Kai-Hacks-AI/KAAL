# Change production verification dependencies

Capability: Change. Integration scope: Change and Engineering.
Collector: kaal/change-isolation. Destination: main through a separate promotion.
Current base: 9a4942d3c51899698e49d576bd2fa4197e6d55a6, the #809 promotion.
Original verification base: 772293d9d4cf997ae40aa93a28e03a2d8bcb154d (#808).
Those two bases have the identical tree d10b43a2b64abca6effa21039f340a5e5e1e1fdb.

## Request and correction

The Owner asked to close the package-release gap before the focused main
promotion. The previous package declared Graph and Hosting as optional peers,
although its shipped verifier and all delivered Cases require them. Engineering's
normal release consumer installs only the candidate package, so those providers
were absent and verification could not complete. Previously installing all
provider tarballs explicitly in acceptance did not qualify that path.

Declare exact Graph and Hosting versions as required production dependencies,
alongside Foundation. No evaluator code, traversal, Case assertions or required
Case inventory changes. The pure isolation module still imports only Foundation
and accepts a caller's Graph view. Package installation now truthfully supplies
the providers needed by its shipped verification. The verifier itself neither
installs dependencies nor turns missing providers into skipped/passing Cases.

Update active documentation, skill guidance and npm's derived root lockfile.
The approved PLAN and historical evidence remain unchanged. New contracts are
I23, F49, N13, A23 and T55–T57. Version stays 0.0.1 before first publication.

## Verification

- T55 is an automated publisher regression: both required providers must be
  ordinary exact production dependencies. It fails by assertion on the original
  package and passes on the correction; no missing module is counted as that RED.
- T56 is an explicit publisher integration probe consuming a caller's already
  packed artifacts. It creates a fresh consumer and empty npm cache, configures
  integrity-checked local-tarball overrides as transport substitutes, and runs
  `npm install --omit=dev <Change tarball>` with no provider install arguments or
  preinstallation. npm itself resolves the real production dependency metadata.
  It then invokes the installed npm test and Engineering's existing Release
  verification judge. Every installed required artifact must match the caller's
  integrity record, with no Core, Testing or Engineer Skill development packages.
- The unchanged final T56 probe fails by assertion against the old tarball:
  verification is unknown because its provider import reports ERR_MODULE_NOT_FOUND.
  With the corrected tarball, all nine delivered Cases verify and the process
  exits successfully. The explicit artifact probe is separate from Testing's
  acceptance ledger and does not claim all installations were recorded there.
- T57 consumes the existing Release readiness contract against this actual
  package manifest. Controlled observations qualify the complete dependency set;
  withholding either provider's version yields its named release-first finding.
  This exercises the release gate without inventing a second readiness policy.
- Full Guard Engineering: 237/237 pass, no skips/todos.
- Full Guard Acceptance: 38/38 pass; seven packages packed once, seven scenarios,
  eight recorded fresh installations. Its host-containment and unrecorded-
  installation findings remain unknown. Installed tamper/failing/skipped/empty
  inventory negatives remain intact.
- Trusted C16 #777 checker at 40fdf0e32e7170a790a636ca7c88d57a86f868fd derives
  the proposed lock twice offline from the exact base lock and candidate literal
  manifests. Candidate and derived SHA-256 both equal
  eb11005865c3ba03aca8d8489857df352993a0c25afed18a0d2ba57d2ad6debd.
  Node 24.22.1, npm 11.9.0. No trusted checker is copied into the deliverable.

The artifact probe's observations and hashes are retained in package-only-evidence.json.
The 22 earlier evaluator/skill mutation challenges remain historical evidence for
unchanged runtime code; this correction does not claim a fresh mutation run.

## Registry and promotion boundary

Public npm queries during preparation reported Foundation 0.0.1 available;
kaal-graph and kaal-hosting returned E404. The existing Release readiness gate
must therefore require their releases before a registry-only Change publication.
Local tarball overrides prove dependency installation mechanics and delivered
behaviour, not public registry availability or publisher provenance. This Change
performs no npm publication and does not claim public release readiness.

#809 subsequently promoted the earlier skill-and-isolation package without this
correction. Deleting its collector caused GitHub to retarget #811 onto main,
where squash ancestry made the previous delivery appear in its diff again.
Re-establish the now-deleted collector at main's exact new tip and rebase only
this correction onto it. This follows the collector lifecycle after promotion;
no unpromoted collector is replaced to avoid staleness.

The shipped package, test and root-integration bytes remain identical to the
tested af463a8d067515cd8a2c7f6899947b878fce7fc2 candidate. Only this unshipped
record's lifecycle explanation changes. The base root/lock bytes are identical,
so the recorded derivation and artifact evidence retain their exact inputs.
Integrate the correction by governed squash after its own review and current
CI, then prepare a separate focused promotion with its own order, freshness and
complete-diff review. No npm publication is authorized by resolving ancestry.
