# Engineering standards

> PLAN (engineering/C5): nothing below exists yet. This PLAN answers the Owner's direction on #585 (comment 6495632668). KAAL Engineering owns the standards for how KAAL itself is engineered. Each standard states its authority, its scope, how an engineer or agent finds it, and which Test Cases prove that KAAL conforms. The first standard is representation. #609 holds the evidence for it.

## Scopes, kept apart

The contexts below can overlap. They are not one ownership hierarchy.

| Scope | What it is | Who owns it |
| --- | --- | --- |
| Repository-native | This repository's own structure and content outside `.kaal/`: `engineering/`, `.github/`, the root files | Engineering, for KAAL. A consumer owns its own |
| `.kaal` integration | KAAL's integration and configuration area, `.kaal/`, as `.github/` is GitHub's. It is not the repository, and not the repository's architecture | the Capability whose configuration it holds |
| Capability | A responsibility, its semantics, its contracts and its boundaries | that Capability |
| Package | A distributable realization, with the guarantees it gives its consumers | the Capability that ships it |

**Who is bound.** Engineering standards bind what KAAL engineers: this repository and every Capability and Package developed in it. Installing KAAL does not put them on a consumer, and no test here runs against a consumer repository. A consumer meets only what a Package guarantees, stated by that Package.

## The register

`engineering/standards/README.md` becomes the register, one entry per standard. Each entry states five things:

- the **statement**, cited from its **authority**, never restated as a competing definition;
- its **scope**, one or more of the four above;
- how it is **discovered**: the path an engineer or agent follows to reach it, starting from `AGENTS.md` and from the README of the tree they are changing;
- the **Test Cases** that prove conformance, by title;
- whether it is **enforced**, meaning a required gate runs those Test Cases (the Required tests control of engineering/C3, #585), or only **discovered**. Both are recorded, and neither stands for the other. A documented gate is not evidence that the gate operates. That evidence is Testing's to judge.

Testing owns what a test, a result and evidence mean. Each Capability keeps its own domain contracts. The register cites them and does not copy them.

## The first standard: representation

- **engineering/N1.** Human-facing artifacts, human–agent collaboration included, are Markdown. Their script-facing members go in validated YAML frontmatter, and their prose goes in the body. Machine-to-machine mechanics and machine-owned state may be JSON. That scripts consume an artifact does not by itself make it machine-only. **Authority:** Core's Deterministic Frontmatter `N1`–`N3` and `F8`. **Scope:** repository-native, `.kaal` integration, Capability, and Package, where the Package is KAAL-engineered. A consumer's own artifacts are out of scope.
- **Each JSON format is declared.** The register lists each JSON format KAAL keeps, by file name or path pattern, with its owner and why it is machine-only. Examples are an Installation Contract (`contract.json`), an installation record, Guard's `verify.json` manifest, and the tools' own `package.json`, `package-lock.json` and `tsconfig*.json`.
- **Known divergences are listed, not hidden.** These are the human-facing JSON that #609 found: `evidence.kaal.json`, `engineering/github/holds.json`, `.kaal/config/core/agents.json`, and `ownership.kaal.json`, which is borderline. Each is listed with its owner and the proposal that would close it. The list shrinks only through its owners' Changes.

## Test Cases

These live in `engineering/standards/standards.test.mjs` and join `npm run test:engineering`. Each behavioural case is first observed RED against a deliberately wrong fixture. A RED that shows only that a module or file is missing counts as blocked, not as evidence.

| Test | Checks | Negative fixture: must fail, naming the cause |
| --- | --- | --- |
| engineering/T1 | Every register entry cites an authority that resolves to an existing file and identifier, names a scope, a discovery path whose links resolve, and at least one Test Case whose title exists in a test file | An entry citing a missing authority. An entry with no Test Case: an obligation nothing protects. An entry no link from `AGENTS.md` reaches: an obligation nobody can find |
| engineering/T2 | Every Capability and Package is found from the tree, not from a list. Capabilities come through Testing's attribution of ownership claims (`kaal-testing/attribution`, as `engineering/inventory/attribute.mjs` reads them). Packages come from every tracked `packages/**/package.json`. Each Package lies within one Capability's claim | A new `packages/<x>/package.json` with no claim covering it fails as an ownership-boundary finding. A new claimed Capability is covered with no edit to the test |
| engineering/T3 (engineering/N1) | Every tracked `.json` in a KAAL-engineered tree matches a declared machine-only format or a listed divergence | A new `<capability>/notes.json` fails with: not a declared machine-only format, and human-facing artifacts are Markdown (Core frontmatter `N1`) |
| engineering/T4 | No Package's shipped tests name an `engineering/` path or need this repository, so a consumer can run them after a fresh install | A shipped test file in a fixture Package that reads `engineering/` |

**Each negative fixture must genuinely fail.** In the DO, each fixture above is built in a scratch copy of the repository: a new unregistered Package, a new undeclared JSON format, a register entry no link reaches, and a fixture Package whose shipped test reads `engineering/`. Its case is run and recorded RED, naming the cause, before the case counts as protection. A fixture that does not turn its case RED is a defect in the test, not a pass.

**Ownership conflicts are reported, not resolved.** When engineering/T2 finds a path claimed by two Capabilities, or a Package outside every claim, it names them, and the conflict returns to the Owner for alignment. Engineering moves no claim.

**Found today, before any DO.** `packages/kaal-guard/` has no `ownership.kaal.json` on `main`, so engineering/T2 will name it. Its owner adds the claim, or the DO lists it as a divergence. The DO does not write another Capability's claim.

## Not in this Change

- **Validating frontmatter against each owner's Type.** Engineering finds each Capability's typed Markdown and runs Core's frontmatter conformance cases on it. That waits on the same shape as #607, so both use one pattern. It is the next entry in the register, and it would have found `Guard/Check`'s gap against `F1` (#609 §4).
- **Converting any divergence.** Each conversion belongs to its owner (#609, P1–P5).
- **Controls and rulesets.** engineering/C3 (#585) stays as it is.

## Owner decision

**The discovery path.** **A (recommended):** `AGENTS.md` links the register, and each Capability's README links the entries that bind it. **B:** the register alone. B is simpler, but an agent changing a package may never reach it.

Approving this PLAN authorizes the engineering/C5 DO only, on `kaal/engineering` as it stands. It authorizes no synchronization, promotion, publication, control or ruleset change, and no Change in another Capability's tree.
