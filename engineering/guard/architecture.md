# Guard: Architecture (where)

Architecture places Guard's functions, gives each one positive ownership, and fixes its boundaries, relationships and dependencies. How each function is implemented is [Code](code.md)'s. Each element names, in brackets, the Requirements it serves.

## Elements

- **A1 Check list** [G1, G7]. `guard.json`, at the repository root, is owned by the repository. It says which checks exist, their commands, where they run, which facts they need, which checker is trusted and which outcomes are named. It knows nothing of how a check decides.
- **A2 Checks** [G1, G9]. The checks and their test content are the repository's. They know nothing of Git, GitHub or Guard beyond the facts G9 gives them.
- **A3 Runner** [G2, G3, G7, G9, G10, N2, N4]. The runner, in the package at `lib/runner.mjs`, runs a set of checks and reads their verdicts. It knows nothing of branches, remotes, pull requests, GitHub, the adapters or KAAL. It reads a Git object only to take a trusted checker from the base commit (G7).
- **A4 Git adapter** [G4, G6]. The `pre-push` hook, shipped in the package as `templates/pre-push`, passes Git facts to the runner and acts on its verdicts. It knows nothing of GitHub and names no check.
- **A5 GitHub adapter** [G5, G6, G10]. A workflow job passes pull request facts to the runner and acts on its verdicts. Reporting to GitHub (annotations and the step summary, `run --github`) and the static coverage check (`verify`) sit beside the runner, in `lib/github.mjs`. A new consumer is offered `templates/guard.yml`.
- **A6 Lifecycle** [G8, N3]. `init`, `upgrade` and `remove`, in the package at `lib/lifecycle.mjs`, own exactly the files recorded under `managed` and the `core.hooksPath` they set. Nothing else in a repository is theirs.
- **A7 Dependency direction** [G3, G6]. The command (`bin/kaal-guard.mjs`) and the adapters depend on the runner; the runner depends on `guard.json`; `guard.json` names the checks. Nothing depends on an adapter, and the runner depends on neither A5 nor the templates.
- **A8 Package independence** [N6]. The `kaal-guard` package, in `packages/kaal-guard/`, depends on no other KAAL element, declares none, imports none and references no Engineering path or KAAL Engine. It carries its own tests in `test/`.
- **A9 Engineer** [N7, N5]. `engineering/guard/` holds Guard's engineering documentation, the Engineering-only outer tests and, later, the External tooling. It may use any useful KAAL element. Nothing it uses becomes a package dependency.
- **A10 External** [G8, N5]. The External tooling, in `engineering/guard/external/`, produces and delivers a naked Guard Change for a target from the target's own commands. It uses no package internals and leaves no KAAL element in the target.
- **A11 KAAL integration** [N7, G5, G10]. KAAL is Guard's first consumer and installs the package from its workspace. Its lineage, Change Isolation and branching checks become entries in KAAL's `guard.json`, with their checkers trusted and `4` named held. Guard joins KAAL's existing workflows without replacing or consolidating them:
  - each existing job keeps its name, OS matrix and triggers: `Hosting (Windows/Linux/macOS)`, `Acceptance (Windows/macOS)`, `Workspaces`, `Acceptance`, `Engineering`, `Change Isolation`, `Promotion Source`, `Branching` and `Branching audit`;
  - only the step that runs the check changes, to `kaal-guard run --check <name>`;
  - CodeQL and Dependency Review are GitHub's own checks and stay outside Guard.

## Relationships

```mermaid
flowchart BT
  Hook[A4 Git adapter] --> Runner[A3 runner]
  WF[A5 GitHub adapter] --> Runner
  Runner --> List[A1 guard.json]
  List --> Checks[A2 repository checks]
```

```mermaid
flowchart LR
  E[A9 Engineer: engineering/guard, may use any KAAL element]
  E -->|build and pack| P[A8 Embed: kaal-guard package, no KAAL dependency]
  E -->|A10 implement and deliver naked| X[External: Change in target, no KAAL element]
  P --> C[consumer installs; adapters call the runner]
  X --> T[target's hooks and CI call its own commands]
```
