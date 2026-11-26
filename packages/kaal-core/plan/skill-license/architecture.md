# Skill License: Architecture

Each element names, in brackets, the Requirements it answers.

- **core/A60** [core/F117]: `judgeLayout` gets one more allowed top-level name, matched on the whole name with `^LICENSE(\.[^/.]+)?$` and only for a file (a path with a further segment below it is a directory and stays a finding). It stays pure over relative paths.
- **core/A61** [core/F118]: The Definition gets one short paragraph under Layout: the product requirement, the external difference and the separation of enforcement.

## Options considered

| Option | What changes | Cost |
| --- | --- | --- |
| **A. Allow a top-level `LICENSE*` file** (recommended) | One name in the layout rule and one paragraph. | A Skill may carry a file Core does not read. |
| B. Make Core's check require it | A Skill without a file is a finding. | Presence needs the product requirement enforced where the adopter decides, so it is separate adopter work. The Definition still states the requirement. |
| C. Put it under `assets/` | No rule change. | The agentskills.io example places `LICENSE.txt` beside `SKILL.md`, and consumers look for it there. |
