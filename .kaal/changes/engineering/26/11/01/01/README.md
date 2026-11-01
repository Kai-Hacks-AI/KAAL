# PLAN: capability collectors and release-process assurance

Capability: Engineering. Collector: kaal/ci-gates.
Base: 84fccd9873f21dc4c02ff7a3e2021814c57e6968 (#807).

Owner redirected Simplify Check Setup toward existing GitHub Actions mechanisms,
capability collectors, independently reported Product and Engine assurance, and
target-based release-process policies. Propose KAAL, KAAL Capability and a future
Hotfix route backed by a separate kaal-hotfix Skill. main-to-collector SYNC uses
the target policy and tests the resulting tree.

The focused PLAN in engineering/impact-ci/actions-native-plan.md records native
versus App trade-offs, existing Hotfix/Branching incompatibilities, source and
same-SHA limitations, negative/live Cases, dependency inventory and staged
delivery/migration prerequisites. Existing full matrix comes first. #810 stays
held; no SQLite/receipt/service dependency is imposed on the native path.

Documentation only: one new PLAN, current-direction notices in three existing
documents, and this record. No evaluator/policy/test/package/workflow changes,
selective execution, Skill implementation, App/credentials, live publication,
ruleset/protection changes, synchronization, promotion or merge authorization.
Ordinary Change: squash after independent Owner review and required CI.
