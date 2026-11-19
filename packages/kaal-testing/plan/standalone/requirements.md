# Standalone use of kaal-testing: Requirements

Each Requirement names, in brackets, the Intent it serves. All answer testing/I41.

## Functional

- **testing/F146** [testing/I41]: **Installs alone and runs.** `npm pack` of the package, installed into an empty project outside any repository with `npm install`, leaves a working `kaal-testing` command in `node_modules/.bin`, resolves the package's exports (for example `kaal-testing/run`) from the project, and the command runs the consumer's own test files and prints the run report with ids relative to the consumer's project. Running writes nothing into the project.
- **testing/F147** [testing/I41]: **Declared dependencies only.** The package declares as runtime dependencies only Hosting, Foundation and `c8`, each as a published version. Every module its `lib/` and `bin/` import is built in, a declared dependency or its own export. Installing it brings no other KAAL package or Skill into the project, directly or as a transitive arrival: the family that arrived is checked against a fixed allowlist (the package itself, Hosting, Foundation), never against what happened to arrive. A dependency may be added to the allowed set only by a Change that says why; a KAAL package never is.
- **testing/F148** [testing/I41]: **Judged use.** A trial in the shape of `trial/protocol.md` is recorded: three runs, each an agent in a fresh empty project with only the installed package, given `trial/prompt.txt`, judged by another session against `trial/key.json`. Every `must` item is met in every run. The fixture yields the counts the key states with the installed package. Each run records its isolation (Node 24 or later, project empty before the install, no repository reachable, no other KAAL package, agent and judge sessions different), and each verdict quotes the transcript.

## Non-functional

- **testing/N32** [testing/I41]: **No name from outside.** The installed package's files (Skill, references, README, `lib/`, `bin/`, Nodes) name no KAAL repository path or folder (`engineering/`, `packages/`, `.github`, `.kaal/`), no other KAAL package or Skill, no role or team of a setup outside the package (Guard, Inspector, Dispatcher, CPO, Engineering) and no process vocabulary of another capability (FAR, Change folder, PROMOTION). The package's own vocabulary (Test Case, Test Plan, Run, `kaal-testing`, KAAL as a brand) is always allowed. The scan runs on the installed files, not on the repository.
