# Preserve Graph's public Core build inputs

Capability owner: Graph. Delivery: one focused correction through the existing
`kaal/hotfix` flow in `engineering/github/branching.md#hotfix`.
Base: main `01b5528848bb3b59c031bbfcc03f6a88ad7feff2`.

## Problem and exact correction

Core #816's newly enrolled installed verifier is GREEN on Linux/macOS but
correctly refuses Windows: `dist/node/form.d.ts does not match the manifest`.
Core's accepted F79/A38 delivery copies Graph's Node/Form modules and declarations
byte-for-byte and records their provenance. Windows checkout can turn the reviewed
LF input into CRLF before the copy. Changing Core's manifest or normalizing the
copy would conceal the wrong input, rather than preserving Graph's contract.

The product correction is exactly the six-line Graph-owned `.gitattributes`
already independently reviewed in #817, at head
`61628816e4423816ab52169f2f90617bae660d77`. It protects only `form.d.ts`, `form.mjs`,
`node.mjs` and `edges.d.ts` in Graph's existing public script directory. It changes
no module, declaration, API, requirement, Case, package/version, dependency,
workflow, manifest or assertion. This record is evidence and delivery scope,
not another product implementation or a new hotfix policy.

## Why a separate main delivery

#817 targets `kaal/hosting`, whose preparation remains independent. Core cannot
receive another collector directly. `kaal/graph` also holds unfinished release
work. Neither collector should be promoted wholesale just to deliver these byte
rules. The existing hotfix flow is for one urgent correction of an existing
capability while its owning collector has unfinished Changes. The owner remains
Graph, and every normal review/CI/freshness/order requirement still applies.

This proposal prepares that route; #817's approval into Hosting is not represented
as authorization to promote to main. After independent review and full required CI,
the ordinary correction lands by squash into `kaal/hotfix`. A separately reviewed
focused promotion goes by squash to main, with any promotion-order decision
explicitly recorded by Owner. Only then can Core receive the accepted main state
through a merge-commit SYNC, followed by rebasing #816 onto its actual collector
tip and fresh current-head three-host verification. No direct Graph/Hosting-to-Core
merge, gate bypass, protected-branch update, publication or consumer activation is
authorized by creating this candidate. Synchronize the correction back into any
existing affected owning collector after its promotion, as Branching requires.

## Evidence boundaries

The #817 correction independently demonstrated all five generated Node support
outputs match Core's unchanged manifest in a `core.autocrlf=true` checkout.
Core #816 independently reproduced the same five mismatches after restoring only
Core-owned inputs; restoring Graph's reviewed Git bytes makes its real verifier
pass 12/12. Those are controlled dependency experiments, not a claim that the
correction is already on main or that #816 has fresh three-host GREEN.

Local verification of this exact correction:

- Offline locked install and Hosting/Core build pass on Node 24.22.1 / npm 11.9.0.
- Graph's existing `npm test -w kaal-graph`: **48 passing, zero failing**, no
  skips/todos/cancellations. No existing Case was edited.
- The `.gitattributes` blob is exactly #817's reviewed
  `d18fb52affa69cf78a5b990f5e9098161776cade`; all four attributes are `text: unset`.
- A fresh `core.autocrlf=true` checkout combines #816's checked tree with this
  exact file in an isolated rehearsal, builds Core with its actual helper and
  packs/installs into an otherwise fresh consumer without Graph. Installed
  verification gives **12 declared / 12 executed / verified**; the public API
  admits the Skill Node and the installed CLI examples pass. Changed Skill
  bytes give cannot verify; a bad Skill Node with refreshed digest gives failed;
  restoring the candidate returns to 12/12 verified.
- Its Core tarball SHA-256 is
  `0cced018328a196abb6a2e669a96cfda054e3838e9320f5d3990ce8377bf06bd`,
  exactly the local ordinary-checkout candidate already recorded for #816.
  The same clean trial consumes Foundation's accepted 0.0.1 artifact digest
  `36be7a4d6e176a00ccf9d50e127261b481c4feb2661a0da35933fb2b2ed35ed0`.
- This is a Linux-hosted CRLF-checkout experiment using local dependency tarball
  transport. It is neither native Windows GREEN, registry resolution, nor an
  accepted cross-collector integration. Required remote CI remains independent.
- Whitespace and target Change Isolation checks pass for the two changed paths.

Remote CI for this exact candidate is recorded in the PR.
The required return evidence after the governed dependency delivery is unchanged:
installed Core 12/12 on Linux/macOS/Windows, exact candidate/manifest records and
all required current-head checks. Keep #816 draft, unarmed and unmerged until
its independently judged integration gates hold.
