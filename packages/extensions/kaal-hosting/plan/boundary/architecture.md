# Platform Coupling Conformance: Architecture

Each element names, in brackets, the Requirements it answers.

- **hosting/A12** [hosting/F27, hosting/F28, hosting/F29, hosting/F30, hosting/F32]: `couplings` and its types (`CouplingReport`, `Finding`) join `inspect` in `kaal-hosting/conformance`, the separate entry point that production code never loads. It reads sources with a scanner that knows JavaScript and TypeScript comments, strings and template literals, so a mention in a comment is never a finding. It decides `kind` from the enclosing test registration call, `if`, conditional expression or assertion call. It takes no new runtime dependency.
- **hosting/A13** [hosting/F31] (Option A below, supported by the Owner on #650, comment 6516704592): `boundarySuite` is publisher-only. It lives in `packages/extensions/kaal-hosting/conformance/boundary.mjs`, outside the package's `files`, so it never ships and no package depends on it at run time (the Owner's #607 ruling). Engineering's Boundary Test Plan, built on Testing's Plan → Suite → Case model, is the only Plan that runs it (engineering/C10, #649). It invokes the suite by its declared repository path, `packages/extensions/kaal-hosting/conformance/boundary.mjs`, either importing it or calling it as a command. engineering/C9 (#648) stays cross-platform inventory parity and runs no boundary suite, so no boundary execution is duplicated. Responsibilities follow the Owner's follow-up on #629 (comment 6510157341). Hosting owns the boundary rules, the suite's cases and its positive and negative fixtures. Engineering owns the target matrix (which capabilities, directories and hosts), the execution and the evidence. No capability imports Hosting or `node:test` to be inspected, so the suite adds no runtime dependency anywhere.

## Options considered for hosting/A13

| Option | What happens | Cost |
| --- | --- | --- |
| **A. The inspection ships, the suite does not** (supported by the Owner) | `couplings` ships in `kaal-hosting/conformance` beside `inspect`. `boundarySuite` is a publisher-only module that Engineering imports. | Engineering imports a Hosting file by repository path. |
| B. Both ship | `boundarySuite` is exported from `kaal-hosting/conformance` as well. | A published entry would load `node:test`: a test harness inside a runtime package. |
| C. Engineering writes the suite around `couplings` | Hosting ships only the inspection. | The suite's cases would be Engineering's, so Hosting would no longer own the test suite the Owner asked for. |

## Change graph

| Change | Owner | Depends on |
| --- | --- | --- |
| `hosting/C13` PLAN: I8, F27–F32, N5, A12, A13; hosting/T32–T39 | Hosting | the Owner's requirement on #629 and #641 |
| `hosting/C14` DO: `couplings`, `boundarySuite`, the fixtures, and hosting/T32–T39 in Hosting's lanes | Hosting | `hosting/C13` |
| engineering/C10 DO: the Boundary Test Plan's matrix runs `boundarySuite` per capability and reports it (#649) | Engineering | `hosting/C14` |
| each capability's corrections of its own findings | each owner | engineering/C10 |

It is independent of `hosting/C10`–`hosting/C12` (#629) and changes none of their files. Once `hosting/C11` renames the package, `hosting/C14` imports it by its new name.
