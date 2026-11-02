# Independent interoperability harness for the scoped Testing package: PLAN

Date: 2026-11-02. Engineering PLAN for independent Owner review. It answers Testing's
contract in PR #858 (step 4 of C36) and builds on the closure in PR #857. It adds no
harness, test, workflow or runtime byte. Nothing here is executable GREEN.

## What is being verified

Testing's contract (#858, section 2): one scoped Testing tarball, packed once by the
release engine from `main`, installed from packed files into Engineering, Change, Graph
and Engineer Skill consumers on Linux, macOS and Windows. Every public subpath of the
export map and `package.json` must resolve by the scoped specifier; the old unscoped
name must not resolve; the tarball inventory must equal the declared one; unknown is
not pass. Engineering supplies the independent verifier, using Node built-ins only and
importing no Testing code.

## Independence, stated precisely

The harness must be able to reject Testing, so what it trusts is limited:

| Input | Treated as |
| --- | --- |
| The tarball bytes, and the release record's digest of them | The subject. The harness hashes the bytes itself and compares with the record. |
| `package.json` inside the tarball | Read by the harness; export map and `files` are what it checks against. |
| `test/verify.json` hashes and Testing's installed verifier (`test/verify.mjs`) | A claim and an observation, never authority. The harness records what the verifier reports but never counts it as a pass; its own recomputed inventory decides. |
| The declared inventory | Derived by the harness from the source `package.json` `files` at the release commit and the tarball's actual entries, so Testing's own `verify.json` cannot define it alone. A difference between the two is a failure. |
| Hosting and Testing code | Not imported. The harness uses `node:fs`, `node:crypto`, `node:zlib`, `node:child_process` and `node:path` only, including a small ustar reader for the tarball. |

This costs the convenience of Hosting's `execute`; the harness therefore owns a small
process wrapper with a timeout and a recorded exit status and environment. That
wrapper is part of what the DO must test.

## Result model

Each consumer on each platform yields exactly one of `pass`, `fail` or `unknown`,
with the observation behind it. `unknown` covers a consumer that cannot run, a host
without the platform, a timeout, an unreadable output or a missing required input.
The harness exits 0 only when every required cell is `pass`; 1 on any `fail`; 2 when
any cell is `unknown` and none failed. A matrix with a missing cell is `unknown`, not
smaller. No consumer, subpath or platform is skipped silently.

## Checks per cell

1. Tarball digest equals the release record; inventory equals the independently derived one; no file outside it.
2. Fresh temporary consumer created outside the repository; the scoped tarball and the accepted scoped Hosting tarball installed from packed files only, offline where the host allows, no workspace link.
3. The installed tree is read: `node_modules/.package-lock.json` must record the packed tarball as `resolved` with the packed integrity, not a registry copy or a link. One copy of each package, no nested duplicate.
4. For each key of the export map and `package.json`, import by the scoped specifier in a fresh Node process; resolution must land inside the consumer's `node_modules`.
5. The unscoped `kaal-testing` specifier must fail to resolve, and the old name must be absent from the installed tree.
6. Testing's own installed verifier is run and its report recorded, labelled as a claim.
7. The consumer's own acquisition path is exercised for each of Engineering's acceptance lane, Change, Graph and Engineer Skill: the harness runs each consumer's declared install and import step, not a copy of it. A consumer whose acquisition path still names the old identity fails.

## Required negatives (the harness must show it can fail)

Run against deliberately wrong inputs and expected to produce `fail`, never `pass`:
one altered byte in the tarball; an extra and a missing file; a digest that does not
match the record; the old unscoped name installed instead; a workspace link in place of
the packed copy; a registry-resolved copy; a missing export subpath; a scoped specifier
that resolves outside the consumer; a nested duplicate Hosting. Each negative is a
mutation of a good run; the DO records that each mutation is detected.

An `unknown` negative-run cell is itself a failure of the harness test. The harness's
own tests run on all three platforms, since path and tar handling differ there.

## Delivery and ownership

Engineering owns the harness and its tests, in a new `engineering/verification/interop/`
directory, with its own Change Record. It touches no Testing, Change, Graph or Engineer
Skill path. Consumers' acquisition paths are read, not edited. It is wired into no
workflow in the DO, so it needs no `.github` change; whether it later joins the Release
engine's acceptance is a separate Owner decision and `.github` isolation applies.

## Sequence

1. This PLAN accepted. Testing confirms or amends the contract on #858.
2. Harness DO with its negatives, reviewed independently. Its tests run on the three platforms.
3. The harness runs against the real packed candidate after the rename route is decided (#854) and the Hosting scoped version is accepted.
4. Result recorded for the Owner. Registry-only acceptance after publication is a separate, later check by the existing Release step `registry`.

## Open points for Testing and the Owner

- Is the declared inventory allowed to be derived by Engineering from `files` plus the tarball, with `verify.json` treated as a cross-check? This plan assumes yes.
- Does the consumer list (Engineering, Change, Graph, Engineer Skill) include any consumer that cannot install a scoped Testing until its own owner's Change lands? If so those cells are `unknown` until then, by design.
- Which accepted scoped Hosting version the harness installs. This depends on the Hosting thread.

No synchronization, promotion or publication is authorized by this PLAN.
