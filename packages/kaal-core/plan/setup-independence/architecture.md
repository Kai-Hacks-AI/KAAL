# Setup independence: Architecture

Each element names, in brackets, the Requirements it answers.

- **core/A64** [core/F121]: A "Setup independence" section in `payload/core/Installation-Contract.md`, beside the runtime a contract states. It states the rule and the default permitted set and nothing else. Its bytes change the Definition's digest, so the DO updates the pinned ids visibly.
- **core/A65** [core/F122, core/N32]: `judgeSetupIndependence` in `src/installation.ts`, exported from `kaal-core/installation` with the contract's other checks. It takes the parsed `package.json`, never a path, so it reads no file and Core stays host-free. It returns `{ verdict, findings }`, findings in a stable order by field then package.

## Design questions

| Question | Recommendation |
| --- | --- |
| **Q1.** Review's harness installs `kaal-core` and `kaal-graph` as the Engine it registers into. Are they permitted? | **Not by default.** The default is exactly Foundation and Hosting, as the CPO stated it. A capability that registers Nodes into an Engine has that Engine as its consumer's host, and the adopter lists it in `permitted`. The exception is then explicit, traceable and the adopter's, as with repo-free's `allow`. |
| **Q2.** May Foundation depend on Hosting, never the reverse? | **Core does not judge it.** Both are permitted for every capability, and the direction between them is the layering those two packages own. Core's judge treats them alike. |
| **Q3.** Is a declaration check enough for Core? | **Yes.** The isolated installation proves that nothing else is needed at run time, and it needs a host, a pack and an install, which are Testing's and Engineering's harness, as in Review's `standalone` Case. Core states the rule and judges the declaration; a clean verdict says what was declared (core/N32). |

## Options considered

| Option | What changes | Cost |
| --- | --- | --- |
| **A. Installation Contract Definition plus one pure judge** (recommended) | One section and one function beside `checkContract`. | None to existing Contracts: a Contract names no dependencies today. |
| B. A section in the Skill standard | The rule beside the Skill's shape. | A Skill is a folder inside a package, and the package is the unit that installs. Wrong unit. |
| C. A rule in installation integrity (core/C53) | The rule beside content alignment. | That change compares installed assets to expected ones. Independence is what a package needs, not whether its files are intact. |
