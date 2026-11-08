# Release interoperability candidate evidence

Date: 2026-11-02. Collector base `23796c979eaae412b366a10d2dd7cef50155e0d4`.
This candidate is for independent Owner review. It changes neither protected
branch, release gate nor publication state.

## Frozen regression identity

Local test-first commit `68384e98631baaf76b8cbb6e6217b910e16e9b5f` precedes
implementation. GitHub API-uploaded commit metadata may differ; the authoritative
test-file Foundation SHA-256 is
`722f69f93d52314e107a560057f3618ea794059b57c03fbf79536e031e0e9e4f`.
All five regressions first failed by assertion: T83 observed ranged runtime
dependencies; T84–T87 observed absent exit evidence on actual positive, failing,
unavailable and unexpectedly failing verifier executions. No module, syntax or
setup error is counted as behavioral RED. Their bytes are unchanged after DO.

## Current local results

Node 24.22.1 / npm 11.9.0, Linux:

- T83–T87 and existing verifier hook/failure regressions: 11/11 pass, no skips or
  todos. The real verifier and inventory generator execute controlled consumer
  cases. Engineering's release readiness/verification judge is imported unchanged;
  its file is byte-identical to accepted main. This is interoperability evidence,
  not installed packed-product acceptance.
- The actual dependency manifest now passes the unchanged readiness judge against
  controlled registry facts. Withholding each required version independently
  refuses readiness. Fresh npm registry queries separately confirmed the four
  pinned versions exist. Scoped Hosting itself remains unpublished.
- Complete source command: 142/144 in its first group; existing T43/T66 fail because
  the sandbox cannot create the Unix socket that the Linux host guide requires.
  Zero skips/todos. The chain stops before the existing mutations/release group;
  those later groups are not claimed executed by this command.
- Normal prepack with pinned npm 11.21.0 was attempted. It fails closed at T66,
  before the manifest is written. No local normal packed artifact, digest,
  fresh installed-product acceptance or final release GREEN is claimed. No
  ignore-scripts diagnostic tarball is substituted.

## Independent complete-lock reconstruction

`lock-evidence.json` is the unchanged C16 helper's result, read from Engineering
collector `add3abf8e9c6df05dcd9f3139f696524890b1f2f` at its admitted #777 helper.
It ran from the original immutable collector lock and every literal workspace
and local-file manifest, twice offline with scripts disabled. The helper's own
dependencies were the real accepted unscoped main packages, outside this candidate;
no scoped/unscoped package alias was introduced or shipped.

Base lock: `5f982b88b5a46c07acd9ef6e439810325b4233fc09359d482d67d5c94f75c156`.
Candidate and twice-derived lock:
`65b91b53e84641af2252d5c304074cc72c63254c86376f5e9b2face1d3f55424`.
Verdict: passed. The diff is only the four workspace dependency range-to-exact
declarations; no external resolution, integrity, package identity or bin changes.

## Remaining independent gates

Fresh exact-head required CI must run the unchanged normal source, real prepack,
packed inventory and installed consumer suites on Linux, macOS and Windows.
Earlier collector 139/139 + 15/15 results are historical baseline evidence only.
Known C27 defects and proposed C28 contract reconciliation remain independently
reviewable; this Change neither includes nor approves them. Current-main admission,
staged SYNC, queue-compliant promotion, Release Pack, publication authorization and
registry-only acceptance are separate prerequisites. C41 is unchanged.
