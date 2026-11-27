# Identity and numbering: Architecture

Each element names, in brackets, the Requirements it answers.

- **core/A66** [core/F125, core/F126, core/N33]: `KindDefinition` in `registration.ts` gains an optional `numbered` prefix, and `REGISTRATION_SCHEMA`'s kind record accepts it as a parameter of capital letters only. `assemble` checks each instance of a numbered kind in the same pass that checks its traces, and reports `unnumbered-id` as a finding of Core's verdict like every other. No new artifact, no new Type: the claim stays in the Registration a capability already writes.
- **core/A67** [core/F127, core/F128]: `Assembly` gains `nextFree(scope, kind)`, derived from the assembled instances and pure like the rest of it. It scans the ids of one scope under the kind's prefix. It reads no file, takes no branch name and no clock.

## Design questions

| Question | Recommendation |
| --- | --- |
| **Q1.** Are Test Case ids claimed per namespace? | **Yes.** Testing owns the kind and its numbering, and each capability's Cases are instances in its own scope: `core/T134` and `release/T1597` are two identities, so a clash across capabilities cannot exist and a clash inside one is found. Every existing id keeps its spelling. |
| **Q2.** Are Change ids claimed per namespace, or from one global series? | **Per namespace.** Change owns the kind and its numbering, and each capability holds its own Changes: `core/C164` and `release/C164` are two identities. Today `core/C162` and a bare "C162" in Release both appear, so a bare number is not an identity. One global series in scope `change` would make every capability ask Change for a number and serialize the parallel development the Owner wants, so it is the alternative to choose only if the Owner wants one counter. Branching's repo-wide claim of a Change number stays until Change and Release adapt it in their own Changes. |
| **Q3.** How are claims recorded in files? | **In the Registration a capability already writes** (core/F47): its scope is its namespace claim, its instances are its id claims, and `numbered` on a kind is its owner's claim of the grammar. Where the file lives is the adopter's choice, Engineering's for this repository. |
| **Q4.** How does the finder see an id on an open branch? | **It does not, by design** (core/F128). Seeing branches is a platform mechanic, so Hosting passes the union of main and the open branches and Core judges it. Without that union an answer from main alone can clash at merge, and the collision finding catches it there. |

## Options considered

| Option | What changes | Cost |
| --- | --- | --- |
| **A. `numbered` on a kind, and `nextFree` on the assembly** (recommended) | One optional member and one derived function. | Each adopter writes its Registration and calls the finder in its own Change. |
| B. A second artifact for namespace claims | A "Namespace Claim" file beside the Registration. | The same claim stated twice in two files, with a new collision between them. |
| C. A central counter file in Core | One file lists the next number per series. | Every Change edits it, so parallel branches conflict on the one line they all touch. |
| D. Leave numbering to each capability | Nothing in Core. | The clash and the hand count stay, and three retros stay unanswered. |

## Effects outside Core

| Change | Owner | Why |
| --- | --- | --- |
| A Registration per capability, and the merge-time assembly from the files of main and open branches | Engineering | Core judges the files it is given and reads none. |
| The Skill's Case-id and Change-id guidance calls the finder | Change | The retros ask it, and it owns the kinds C and its Cases' guidance. |
| The catalog's duplicate check and the Change-number claim defer to Core's collision finding | Testing, Release | One identity rule instead of one per capability. Each is its own Change, later. |
