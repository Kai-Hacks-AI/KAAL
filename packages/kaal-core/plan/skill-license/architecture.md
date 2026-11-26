# Skill License: Architecture

Each element names, in brackets, the Requirements it answers.

- **core/A60** [core/F117]: `judgeLayout` gets one more allowed top-level name, matched on the whole name with `^LICENSE(\.[^/.]+)?$` and only for a file (a path with a further segment below it is a directory and stays a finding). It stays pure over relative paths.
- **core/A61** [core/F118]: The Definition gets one short paragraph under Layout.

## Options considered

| Option | What changes | Cost |
| --- | --- | --- |
| **A. Allow a top-level `LICENSE*` file** (recommended) | One name in the layout rule and one paragraph. | A Skill may carry a file Core does not read. |
| B. Require it | Every Skill needs one. | Breaks the agentskills.io floor, where `SKILL.md` alone is complete. |
| C. Put it under `assets/` | No rule change. | The agentskills.io example places `LICENSE.txt` beside `SKILL.md`, and consumers look for it there. |
