# Identity and numbering: Architecture

Each element names, in brackets, the Requirements it answers.

- **core/A66** [core/F125, core/F126, core/N33]: `InstanceStatement` in `registration.ts` gains an optional `guid`, `KindDefinition` an optional `numbered`, and `REGISTRATION_SCHEMA` accepts both: `guid` as opaque text, `numbered` as capital letters only. `assemble` builds one claim for each `guid`, and reports a second as `guid-claimed-twice`, in the same pass that resolves traces.
- **core/A67** [core/F127, core/F128, core/F129, core/N33]: `Assembly` gains `checkID(claim)` and `nextID(namespace, kind)`, derived from the assembled claims, pure and independent of order like the rest of it. `checkID` ignores the assembly's own claim for the same `guid`, so a renumbering is judged as a proposal. Neither reads a file, takes a branch name or a clock.
- **core/A68** [core/F130, core/F131, core/F132]: `Target` gains `{ guid }`, which resolves through the claim of that technical identity before the existing resolution runs. `adoptGuid` and `newGuid` are two small functions in a module of their own, `guid.ts`, exported with `kaal-core/registration`. It is the one place that imports the platform's `node:crypto`, so `assemble` still imports nothing and the judgments stay pure. An unadopted instance is listed in the assembly's report as `unadopted`, a report and never a finding, like `untraced` (core/F55).

## Design questions

| Question | Recommendation |
| --- | --- |
| **Q1.** Are Test Case ids and Change ids claimed per namespace? | **Yes.** A technical identity is the thing, and the identifier is qualified by the namespace that holds it: `core/T134` and `release/T134` are two things. The Owner confirmed per-namespace claims. Every existing identifier keeps its spelling. |
| **Q2.** How are claims recorded in files? | **In the Registration a capability already writes** (core/F47): its scope is its namespace claim, each instance states its `guid` and identifier, and `numbered` on a kind is its owner's claim of the grammar. There is no new artifact and no central registry. Where the file lives is the adopter's choice, Engineering's for this repository. |
| **Q3.** Why is an identifier not the identity? | **So it can be renumbered.** An identifier is a rendering a person reads and a branch may have to change when it loses a race. If it were the identity, every reference to it would break at each renumbering. |
| **Q4.** How does `checkID` see an open branch or a merge queue? | **It does not, by design.** Hosting supplies the claims of main, of the open branches and of the entries in a queue, and Core judges the union (core/F129). `nextID` proposes from what it is given and reserves nothing, so a competing proposal is found by `checkID` at integration. |
| **Q5.** What does adoption cost, and who writes the first `guid`? | **Nothing is renumbered.** An unadopted instance keeps working as today and is reported. Each capability adopts its own instances in its own Change, with `adoptGuid` so that branches agree. A new instance gets its `guid` from `newGuid`, a random UUID version 4, and an existing one from `adoptGuid`, a name-based UUID version 5 under a fixed namespace constant. The CTO chose both. |

## Options considered

| Option | What changes | Cost |
| --- | --- | --- |
| **A. A technical identity beside a namespace-qualified identifier, with `nextID` and `checkID` over supplied claims** (recommended, the CPO's cut) | Two optional members, two derived functions and one pure adoption function. | Each adopter writes a Registration and calls the contracts in its own Change. |
| B. The identifier is the identity, with `numbered` and a finder (the first version of this PLAN) | One optional member and one derived function. | A renumbering breaks every reference, and one thing has one name for two purposes. |
| C. A central registry that issues numbers | An always-on service or one shared file. | A new always-on dependency, or a conflict on one line in every branch. The CPO excluded it. |
| D. Leave numbering to each capability | Nothing in Core. | The clash and the hand count stay, and three retros stay unanswered. |

## Effects outside Core

| Change | Owner | Why |
| --- | --- | --- |
| A Registration per capability, and the supply of claims from main, open branches and merge-queue entries | Engineering, with Hosting for the platform reads | Core judges the claims it is given and reads no file. |
| `checkID` in CI on the integration union, and the merge queue | Engineering, Release | The CPO wants the guard at integration, where competing changes meet. |
| The guidance for Case and Change ids calls `nextID` | Change, Testing | The retros ask it. |
| Adoption of existing instances, then retiring Branching's repo-wide Change-number claim and Testing's catalog duplicate check | Each capability, in its own Change | One identity rule in place of one per capability. Later, and never by renumbering. |
