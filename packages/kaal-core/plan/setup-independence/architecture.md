# Setup independence: Architecture

Each element names, in brackets, the Requirements it answers.

- **core/A64** [core/F121]: A Definition of its own, `payload/core/Setup-Independence.md`, typed by `KAAL Definition`. It states the property, the two shared packages, and the three judgements (declared, demonstrated, accepted) in those words. The Installation Contract Definition is not touched, so its id, and every contract that names it as its `format`, stay valid. The Definition's digest and Core's pinned lists change visibly in the DO.
- **core/A65** [core/F122, core/F123, core/F124, core/N32]: `judgeSetupIndependence` in `src/installation.ts`, exported from `kaal-core/installation` with the contract's other checks. It takes the parsed `package.json`, never a path, so it reads no file and Core stays host-free. It returns `{ declared, demonstrated, acceptable, findings }`, where `demonstrated` is always `"unknown"`, and each finding is `{ field, name, accepted }` in a stable order by field then package. The two shared names are constants of the Definition, not a parameter.

## Design questions

| Question | Recommendation |
| --- | --- |
| **Q1.** Review's harness installs `kaal-core` and `kaal-graph` as the Engine it registers into. Are they setup-independent? | **No.** They are KAAL packages beyond Foundation and Hosting, so a package that needs them is `dependent`. A setup may accept them: the adopter lists them in `accepted`, the finding is marked accepted and the setup is `acceptable`. That judges the setup, never the package, and the verdict keeps both. |
| **Q2.** May Foundation depend on Hosting, never the reverse? | **Core does not judge it.** Both are the shared packages for every capability, and the direction between them is the layering those two packages own. |
| **Q3.** Is a declaration check enough for Core? | **For Core's judge, yes, and only as `declared`.** The verdict says `demonstrated: unknown` so the gap is in the data. The isolated installation needs a host, a pack and an install, which are Testing's and Engineering's harness, as in Review's `standalone` Case. |

## Options considered

| Option | What changes | Cost |
| --- | --- | --- |
| **A. A Definition of its own plus one pure judge** (recommended, the Owner's decision) | One new Definition and one function beside `checkContract`. | None to existing Contracts: the Installation Contract's bytes and id stay. |
| A0. A section in the Installation Contract Definition (the first version of this PLAN) | The same words, inside that Definition. | Its id changes, and `packages/kaal-guard/contract.json`, a published contract, pins the old id as its `format`, so Core's own check would reject it. |
| B. A section in the Skill standard | The rule beside the Skill's shape. | A Skill is a folder inside a package, and the package is the unit that installs. Wrong unit. |
| C. A rule in installation integrity (core/C53) | The rule beside content alignment. | That change compares installed assets to expected ones. Independence is what a package needs, not whether its files are intact. |
