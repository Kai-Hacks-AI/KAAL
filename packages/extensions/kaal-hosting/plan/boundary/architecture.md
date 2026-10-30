# Platform Coupling Conformance: Architecture

Each element names, in brackets, the Requirements it answers.

- **hosting/A12** [hosting/F27, hosting/F28, hosting/F29, hosting/F30, hosting/F32]: `couplings` and its types (`CouplingReport`, `Finding`) join `inspect` in `kaal-hosting/conformance`, the separate entry point that production code never loads. It reads sources with a scanner that knows JavaScript and TypeScript comments, strings and template literals, so a mention in a comment is never a finding. It decides `kind` from the enclosing test registration call, `if`, conditional expression or assertion call. It takes no new runtime dependency.
- **hosting/A13** [hosting/F31, hosting/F34] (Option D below): the suite ships, beside the inspection, with its command and its review instructions.
  - `boundary` and `boundarySuite` live in `src/boundary.ts`, built to `dist/boundary.js` and exported as `kaal-hosting/boundary`. It is the only entry that imports `node:test`, and only a runner loads it.
  - The command is `bin/kaal-hosting-boundary.mjs`, declared in `bin`. It calls `boundary` without `node:test`, so a consumer runs it with `npx` and no test framework.
  - The review instructions are `skills/kaal-hosting-boundary/SKILL.md`, in the shape of kaal-guard's Skill: Bare first, then the judgment per `kind`.
  - `bin` and `skills` join `files`. Hosting's tests of the suite, with their fixtures, stay in `test/` and are not shipped (the Owner's #650 comment 6516996102).
  - No inspected capability imports Hosting or `node:test` to be inspected. The runner (Engineering, a consumer repository, an agent workflow or release acceptance) depends on Hosting, as a development dependency or through `npx`.
- **hosting/A14** [hosting/F33]: the result keeps two channels apart. `result` and `cases` are deterministic and use Testing's vocabulary (testing/F13: verified, failed, unknown). `reviews` and `review` are requests for judgment, which Review owns, with agent → human escalation through PREACH. Hosting never reads a judgment back into `result`. A runner that wants to gate on judgment does so through Review's record, not by treating a review request as passed or failed. The command's exit code 3 lets a runner tell "verified, review requested" apart from both a pass and a failure.

## Options considered for hosting/A13

The Owner first supported Option A, then corrected it on #650 (comment 6516996102): Option A is too restrictive, because boundary assurance is not Engineering-only.

| Option | What happens | Cost |
| --- | --- | --- |
| A. The inspection ships, the suite does not | `couplings` ships; `boundarySuite` is publisher-only and Engineering imports it by repository path. | Superseded: consumer repositories, agent workflows and release acceptance cannot run it. |
| B. The suite ships from `kaal-hosting/conformance` | `boundarySuite` joins `couplings` in the existing entry. | Anyone who loads the inspection also loads `node:test`. |
| C. Engineering writes the suite around `couplings` | Hosting ships only the inspection. | Hosting would not own the Test Cases or the review instructions. |
| **D. The suite, a command and a Skill ship from their own entries** (proposed) | `kaal-hosting/boundary` for `node:test` runners, `kaal-hosting-boundary` for anything else, `skills/kaal-hosting-boundary` for reviewers. | Two more shipped surfaces to keep in Hosting's consumer verification (hosting/C12, #629). |

## Change graph

| Change | Owner | Depends on |
| --- | --- | --- |
| `hosting/C13` PLAN: I8, F27–F34, N5, A12–A14; hosting/T32–T40 | Hosting | the Owner's requirement on #629 and #641, and correction on #650 |
| `hosting/C14` DO: `couplings`, `kaal-hosting/boundary`, the command, the Skill, the fixtures, and hosting/T32–T40 in Hosting's lanes | Hosting | `hosting/C13`; the output contract agreed with Engineering (#649) and Review |
| engineering/C10 DO: the Boundary Test Plan's matrix runs the suite per capability and reports it (#649) | Engineering | `hosting/C14` |
| Review's record of judgments on review requests, with PREACH escalation | Review | `hosting/C14` |
| each capability's corrections of its own findings | each owner | engineering/C10 and Review |

It is independent of `hosting/C10`–`hosting/C12` (#629) and changes none of their files. Whichever lands second adds the other's shipped files to the consumer verification manifest. Once `hosting/C11` renames the package, the command and entry are reached by the new name.
