# Guard: Architecture (where)

Architecture places Guard's functions, gives each one positive ownership, and fixes its boundaries, relationships and dependencies. How each function is implemented is Code's, written in DO; the Changes that deliver it are in [Change](change.md). Each element names, in brackets, the Requirements it serves.

## Elements

- **A1 Check list** [F1, F7]. `guard.json`, at the repository root, is owned by the repository. It says which checks exist, their commands, where they run, which facts they need, which checker is trusted and which outcomes are named. It knows nothing of how a check decides.
- **A2 Checks** [F1, F9]. The checks and their test content are the repository's. They know nothing of Git, GitHub or Guard beyond the facts F9 gives them.
- **A3 Runner** [F2, F3, F7, F9, F10, N2, N4]. The runner, in the package at `lib/runner.mjs`, runs a set of checks and reads their verdicts. It knows nothing of branches, remotes, pull requests, GitHub, the adapters or KAAL. It reads a Git object only to take a trusted checker from the base commit (F7).
- **A4 Git adapter** [F4, F6]. The `pre-push` hook, shipped in the package as `templates/pre-push`, passes Git facts to the runner and acts on its verdicts. It knows nothing of GitHub and names no check.
- **A5 GitHub adapter** [F5, F6, F10]. A workflow job passes pull request facts to the runner and acts on its verdicts. Reporting to GitHub (annotations and the step summary, `run --github`) and the static coverage check (`verify`) sit beside the runner, in `lib/github.mjs`. A new consumer is offered `templates/guard.yml`.
- **A6 Lifecycle** [F8, N3]. `init`, `upgrade` and `remove`, in the package at `lib/lifecycle.mjs`, own exactly the files recorded under `managed` and the `core.hooksPath` they set. Nothing else in a repository is theirs.
- **A7 Dependency direction** [F3, F6]. The command (`bin/kaal-guard.mjs`) and the adapters depend on the runner; the runner depends on `guard.json`; `guard.json` names the checks. Nothing depends on an adapter, and the runner depends on neither A5 nor the templates.
- **A8 Package independence** [N6]. The `kaal-guard` package, in `packages/kaal-guard/`, depends on no other KAAL element, declares none, imports none and references no Engineering path or KAAL Engine. It carries its own tests in `test/`.
- **A9 Engineer** [N7, N5]. `engineering/guard/` holds Guard's engineering documentation, the Engineering-only outer tests and, later, the External tooling. It may use any useful KAAL element. Nothing it uses becomes a package dependency.
- **A10 External** [F8, N5]. The External tooling, in `engineering/guard/external/`, produces and delivers a naked Guard Change for a target from the target's own commands. It uses no package internals and leaves no KAAL element in the target.
- **A11 KAAL integration** [N7, F5, F10]. KAAL is Guard's first consumer and installs the package from its workspace. Its lineage, Change Isolation and branching checks become entries in KAAL's `guard.json`, with their checkers trusted and `4` named held. Guard joins KAAL's existing workflows without replacing or consolidating them:
  - each existing job keeps its name, OS matrix and triggers: `Hosting (Windows/Linux/macOS)`, `Acceptance (Windows/macOS)`, `Workspaces`, `Acceptance`, `Engineering`, `Change Isolation`, `Promotion Source`, `Branching` and `Branching audit`;
  - only the step that runs the check changes, to `kaal-guard run --check <name>`;
  - CodeQL and Dependency Review are GitHub's own checks and stay outside Guard.

- **A12 Consumer acceptance** [F11–F16, N8, N9]. Engineering's acceptance of a published version, with KAAL as the consumer, in `engineering/guard/consumer/`. It belongs to Engineer (A9) and may use Hosting and Testing. Each run clones KAAL's commit into a disposable directory and changes nothing in KAAL's working tree. In the clone only:
  - the development dependency is replaced by a published `@kaihacksai/kaal-guard` from the registry, and the lockfile records the registry's integrity;
  - `init` runs with KAAL's real `guard.json`. It installs `.github/workflows/guard.yml` as a managed asset and leaves KAAL's own `.githooks/pre-push` untouched, as it was there before Guard;
  - `core.hooksPath` is set as a KAAL developer sets it, and a local bare remote lets Git run the hook on a real push;
  - the clone then moves to a candidate version, back to the earlier one, and forward again.

  KAAL's own `guard.json` records no managed asset, so `upgrade` in KAAL itself changes nothing; the clone is where managed assets exist. A12 needs the network to reach the registry. That is A12's, not the package's, so N2 still holds for the package. What KAAL's real CI and branch protection show is A11's evidence, from the development package; A12 claims none of it.

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
  E -->|A12 clone KAAL, install published, upgrade| K[disposable KAAL clone: published-npm consumer]
```
