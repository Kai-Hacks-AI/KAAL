# Installation Integrity: Architecture

Each element names, in brackets, the Requirements it answers. The assessment behind it is in the project files, `core/c52-installation-integrity-assessment.md`.

- **core/A53** [core/F100, core/F101, core/F102, core/F103, core/F108, core/F109, core/N28, core/N29]: One pure module, provisionally the entry point `kaal-core/integrity`, with `verifyInstallation({ entity, version, comparison, evidence, observed, ownership, selected })` returning `{ entity, version, comparison, establisher, sources, status, missing, unexpected, modified, reason, differs }` and `exitStatus(result, { enforce })`. `evidence` is `{ establisher, sources }` as `core/F101` states, with `variants` (each `{ suppliedBy: { owner, path }, sources }`) for the owner's other sets, `ownership` the declaration `{ owner, paths }`, and `selected` the set a location is verified against, the base set unless a variant is named. The entry point and the shapes are provisional, the contracts are not, and the Cases in `testing.md` are written against them. The module holds no entity, no inventory and no path of any capability, and imports only what Core already depends on.
- **core/A54** [core/F106, core/F107]: The expected set of a selected version is the content its Installation Contract's assets name in that version's published package. The contract already carries the entity's name, version and assets, and the record carries each installed file's SHA-256 and version. Whether this suffices is decision D1.
- **core/A55** [core/N28, core/F107]: Dependency direction. A capability supplies identity, version and expected assets as data and imports nothing of Core, as an Installation Contract already requires. Core owns the format and the pure verdict and depends on Hosting and Foundation, as it does today. Hosting reads the installed location, as Core's realization does. A control (Release or Controls) supplies the expected set from the selected source and decides detective or preventive. The Skill standard in `core/C52` consumes the verdict and is no part of it.
- **core/A56** [core/F104]: A control reads `exitStatus` and decides what a finding blocks. Core reports and never decides (`core/N26` of `core/C52` is the same rule).

## Closed product decisions (CPO review of ac8ae7d)

| Question | Decision | Contract |
| --- | --- | --- |
| Who establishes entity, version and source identity, and completeness? | The establisher: the control that runs from the protected base or default branch with direct access to the registry and Git, receiving the candidate and the installation as data. It states the manifest, the digests and a tree digest. Core cross-checks them against each other and against the claimed entity and version. | core/I37, core/F101, core/F108 |
| What if the evidence is unavailable, incomplete, inconsistent, or the artifact and its tag disagree? | The verdict is `unknown` with a reason, never `aligned` and never a difference against one of the sources. | core/F108 to core/F110 |
| How are owner variants authenticated? | By the ownership declaration, supplied as evidence from the base branch: the variant must come from a path the declaration gives the entity's owner. What the set says about itself counts for nothing. | core/F105 |
| Does Core stay pure and independent? | Yes. Core never fetches, never trusts a label, and names no entity. | core/N28, core/N29 |

## What is reused

| Existing | Use | Where |
| --- | --- | --- |
| Installation Contract | An entity's name, version, assets (source in the package, target, kind), catalogue, record path | `kaal-core/installation` |
| Installation record | The SHA-256 and version of each installed file, per capability, at `.kaal/state/<cap>/installation.json` | `checkRecord`, `register` |
| Realization plan | Already tells a file unchanged, changed since deployed, or present and not deployed | `kaal-core/agent` |
| Ownership declaration | Which repository paths a capability owns | `ownership.kaal.json` |
| Registration | Which entities are registered, by kind | `kaal-core/registration` |
| Hosting | All reading of files | `kaal-hosting` |

## Technical decisions, the CTO's

D1 to D6 are the CTO's. The product contracts above hold whichever options are chosen; the recommendations are mine.

| | Decision | Options | Recommendation |
| --- | --- | --- | --- |
| D1 | What is the authoritative expected set for a selected version? | (a) The published package of that version: its contract's assets and their source files. (b) The contract's catalogue extended to say which version has which digest. (c) Both. | (a). It needs no change to the format. The catalogue lists every digest a target has had but not which version had which. |
| D2 | How does an owner state a variant? | (a) A second Installation Contract instance in the owner's package. (b) A member added to the contract. (c) The owner's declared transformation applied to the base set. | (a), until Guard's `guard/C105` shows whether a transformation is needed. |
| D3 | How far does `unexpected` reach? | (a) Files inside directory assets only. (b) Any file under the entity's location. | (a), and (b) where the entity owns the whole location, such as `.kaal/<capability>/`. |
| D4 | Which entities need a contract first? | Only Core and Guard have one. Hosting has proposed its own. A Skill delivered without a contract has no expected set. | Each owner raises its own, in the order its Skill is delivered. |
| D5 | Who supplies the artifact and the tag, and how is the tag named? | Release, with Hosting reading. No tag exists in the repository yet. | Release, in its publication Change. |
| D6 | The entry point and names. | `kaal-core/integrity` as in A53, or a function of `kaal-core/installation`. | The new entry point, so the contract module stays the format. |

## Who confirms what

| Owner | Asked |
| --- | --- |
| Release | D5: the artifact and tag supply, the tag convention, and the control that runs the verdict, detective first. |
| Hosting | D4: its own contract, and that reading remains Hosting's. |
| Guard | D2: whether its External variant is a second contract or a transformation (`guard/C105`). |
| Controls | Only the mechanism that runs the verdict. |
| Engineering | Which source is selected for each deployment, and the N+1 package. |

## Change graph

| Change | Owner | Depends on |
| --- | --- | --- |
| `core/C53` PLAN, this Change | Core | none |
| `core/C53` DO: the verdict and its entry point | Core | the merged PLAN and the decisions D1 to D3 and D6 |
| `core/C52` DO | Core | the C53 DO |
| The control that runs the verdict, detective first | Release and Controls | the C53 DO |
| Each owner's contract | each owner | none |
