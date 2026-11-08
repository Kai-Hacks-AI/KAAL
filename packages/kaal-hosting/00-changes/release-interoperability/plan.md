# Hosting release interoperability for Core 0.0.1

Proposed bounded Change hosting/C29, based on collector `23796c9`. This records
the Owner's request to prepare the Hosting dependency for Core; independent review
of this candidate does not authorize integration, synchronization or publication.

Core already consumes the accepted Hosting runtime. This Change introduces no
operation, export, command, dependency or package version. It closes two existing
Release contract gaps: exact direct runtime dependency versions (engineering/F29)
and the verification result record the Release judge consumes (engineering/F32).

Pin the four existing dependencies to the versions already resolved by the
accepted lock. Retain verified/0, failed/1, cannot verify/2 and every existing
assertion, case inventory and applicability rule. Add the corresponding `exit`
and string-list `causes` to every final summary. Preserve the existing `cause`
field on non-verified results. Unexpected verification failure follows the same
record path. Source suites remain source suites; absent case observations are
never presented as passing cases.

T83 drives Engineering's unchanged release readiness on the actual Hosting
manifest; controlled registry observations establish policy behavior only, not
registry availability. T84–T87 drive the real copied verifier and manifest
generator with controlled four-loop consumer cases, then use Engineering's
unchanged verification judge. These publisher fixtures are not packed-product
acceptance. Existing normal prepack, package inventory, installed consumer,
negative and three-host tests remain mandatory on the exact candidate.

Freeze the five new regressions before implementation and record assertion RED
then GREEN without altering their bytes. Regenerate the complete root lock from
the immutable base and candidate manifests twice; retain registry resolutions.

C27 defect correction and C28 sibling-footprint semantics are independently
prepared Changes. This Change neither imports nor approves them. It does not
change Release's judge, Packaging or Testing semantics, C41, Graph publication,
Foundation 0.0.1, workflows, migration admission, promotion order or branch policy.
