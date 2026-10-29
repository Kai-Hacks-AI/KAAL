# Packaging Readiness (LOVE): Requirements

Each Requirement names, in brackets, the Intents it serves.

## Nonfunctional

- **requirements/N3** [requirements/I4]: Requirements keeps no scripts and no lifecycle of its own. An installer realizes its Installation Contract, so being installable adds no runtime dependency to the package. `requirements/N1` stays as it is.
- **requirements/N4** [requirements/I4]: The runtime prerequisite is Node 24 or later, as for Core.

## Functional

- **requirements/F7** [requirements/I4]: The package carries an Installation Contract instance, `contract.json`, in Core's format. It names the Capability `requirements` and the package's version. Its assets are its Nodes, each a `file` from `capability/<file>` to `.kaal/capabilities/requirements/<file>`, the location `register` publishes them to. It has no `surface`, and `provides` is empty, because it ships no Skill. Its catalogue holds, for every asset, the SHA-256 of the bytes the package ships at each version. Its record is `.kaal/state/requirements/installation.json`.
- **requirements/F8** [requirements/I4]: The contract's version and the package's version are the same, and the catalogue holds the current bytes of every asset.
- **requirements/F9** [requirements/I4]: Installed, upgraded and removed through its contract, Requirements follows the format's rules: install only where absent, keep a modified file and report it, remove only an unmodified file. After removal the Engine still verifies, and every `Placement Observation` and other record the consumer keeps is untouched. Which installer applies these steps is not Requirements': today none does for Nodes, and Core proposes `core/C29`, contribution lifecycle.
- **requirements/F10** [requirements/I5]: The Node `Requirements` states the boundary with a Defect: a condition that must not hold is still stated as a Requirement, and a Defect, the durable record that prohibited behaviour was observed, is its owner's, not Requirements'. Neither defines the other's terms. The wording is aligned with the Defect's owner before the DO.
- **requirements/F11** [requirements/I6]: The packed package holds its Nodes, `contract.json`, README, LICENSE and `package.json`, and nothing else. It exports only `./package.json`. The README names every Node it ships and the contract, and nothing else as interface.
