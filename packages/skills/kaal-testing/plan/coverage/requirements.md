# Coverage Script: Requirements

Each Requirement names, in brackets, the Intents it serves.

## Functional

- **testing/F34** [testing/I12]: **`cover` takes the script to run.**
  - `cover(workspace, delivered, { root, dir, script })` runs the workspace's script `script` under coverage.
  - With no `script`, it runs `npm test --if-present`, as today.
  - A named script the workspace does not declare is a failed measurement that names the script, never a passing run, and reports no coverage. A named script is never run `--if-present`.
  - A `script` that is not a script name is refused before anything runs. A script name is a nonempty string of letters, digits, `:`, `.`, `_` and `-`, not starting with `-`.
