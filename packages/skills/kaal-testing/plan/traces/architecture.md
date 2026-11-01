# Case Traces: Architecture

Each element names, in brackets, the Requirements it answers.

- **testing/A26** [testing/F84–testing/F88, testing/N18]: `kaal-testing/traces` is one new module, `lib/traces.mjs`, exported as `./traces`. It imports `check` and `tested` from `kaal-testing/model` and nothing else. It exports:
  - `LOCATIONS`, frozen: `["test/embed/", "test/engineer/", "test/plan/", "test/acceptance/"]`. `testing/C45` removes the legacy entry when it ends the legacy read (testing/F77);
  - `derive(files, { owner? })`, `edges(model)`, `incoming(model, target)` and `impact(derived, target)` (testing/F88).

  The caller reads the files through Hosting and gives them as `{ path, text }`, relative to the capability's root. It gives every `.test.mjs` file in a case location, and one it cannot read as `{ path, text: null }`, so that a file left unread becomes a finding rather than a gap. That the caller lists every file is the caller's part of completeness. Testing cannot see a file it is not given. It also gives the `owner` from that location's ownership claim. The export inventory row for `./traces` (testing/A8) covers the module.

## Who uses it

| Who | Uses it for |
| --- | --- |
| Engineering (engineering/C11, P2) | the Case hop of reverse traceability: from a Requirement, `impact` gives the Cases that test it, and their location gives the capability they impact. Engineering reports `findings` and `untraced` with them, and on `unknown` the isolation check fails closed (testing/F88). engineering/C11 needs its own negative scenario, in which an incomplete Case inventory yields no isolation pass. |
| Testing (`testing/C34`, coverage) | the model's Case traces, from source rather than from a manifest |
| Testing (`scripts/manifest.mjs`, `testing/C38`) | a later DO may generate `test/verify.json`'s `model` from `derive`, so the manifest is a copy of the source, never its own source |

Real case files on `kaal/testing` at this PLAN's base read cleanly:
- Testing, with no owner given: 81 Cases, none untraced, no finding. The 4 titles a line-only reader listed as untraced were `it(` lines inside a multi-line template fixture in `test/plan/evidence.test.mjs`. Under testing/F88 they would have made Testing's impact unknown for every target, so the reader skips strings, templates, comments and regular expressions across lines.
- Foundation, with no owner given: 8 Cases, no finding.
- Core: 38 Cases, no finding, because its Cases name `core/T<n>`.
- Guard: 29 Cases, no finding, with `owner: "guard"` from its claim. Without the owner it has 29 findings, since its identities are bare.

## Prerequisite P3 for Testing

Testing's ownership claim, `packages/skills/kaal-testing/ownership.kaal.json`, already exists in the format #609 settled (JSON, machine-oriented, P4 not migrated). It names Testing's capability Node by its current id. The claim format admits a claim file at the repository root (`scopeOf` gives `""` there), so whoever owns the root files every workspace shares can claim them with no format change. Who that owner is, is not Testing's to decide.

## Change graph

| Change | Owner | Depends on |
| --- | --- | --- |
| `testing/C48` PLAN, this Change | Testing | none |
| `testing/C49` DO: `kaal-testing/traces`, testing/T98–testing/T103 GREEN in Testing's `npm test`, its README and docs entries | Testing | `testing/C48` |
| engineering/C11 DO: the Case hop through `incoming` | Engineering | `testing/C49`, and P1 and P3 |
