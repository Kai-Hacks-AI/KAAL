# Change names Hosting as @kaihacksai/kaal-hosting

Capability: Change. Integration scope: Change only.
Collector: kaal/change. Destination: main through a separate promotion.
Base: 0e877ff, kaal/change after SYNC step 1 (#1237, main at 290ac1a).

## Request

Hosting 0.0.1 is `@kaihacksai/kaal-hosting` on main (#1179, #1180). The collector's
files under `packages/skills/kaal-change` still named the retired `kaal-hosting`, so
Hosting's repository-wide reference Case (hosting/T22) fails on the merged tree.
A synchronization may differ from git's merge only on conflicting paths, so these
references cannot be corrected inside the SYNC. Engineering's two-step route: SYNC
step 1 (#1237), this ordinary Change, then SYNC step 2 with no resolutions.

## Change

Move every reference to the retired name, at exactly the syntax sites hosting/T22
finds (a quoted name, a module specifier with its subpath, a workspace selector), to
`@kaihacksai/kaal-hosting`: the `package.json` dependency, the shipped verifier and its
embedded test, and the publisher, acceptance and collector tests. 12 files. No
Case assertion changes other than the name clause.

`pretest:collector` no longer builds Hosting as a workspace
(`npm run build -w kaal-core`), as Testing's rename Change did: Hosting is taken from
the registry under its scoped name.

The shipped manifest `test/verify.json` takes the new digests of the three shipped
files that changed (`package.json`, `test/embed/skill.test.mjs`, `test/verify.mjs`);
each old digest was checked to equal the SHA-256 of the old file bytes. The version
stays 0.0.1. Host-fact identities such as `kaal-hosting/special-entries` are opaque
ids, not specifiers, and are untouched. The planned Case text under `plan/` is not
changed.

## Verification

- Re-running the rewrite over `packages/skills/kaal-change` finds nothing further
  to change; no live reference to the retired name remains in this package.
- The package is not a workspace of this branch's root (main's `packages/kaal-change`
  is), so no lane runs its tests here and the root lock is unchanged. The new name's
  effect is therefore verified at SYNC step 2, where Hosting's T22 sees the merged
  tree, and after the relocation Change, where `test:collector` is discovered again.
  It is not claimed as run here.
- Nothing in `packages/kaal-change` (main's files) is edited.

## Boundary

No relocation, promotion, publication or version bump. The retired-name references in
main's own `packages/kaal-change` arrive already corrected through SYNC step 2.
