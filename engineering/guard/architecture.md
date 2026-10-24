# Guard: Architecture (where)

Architecture places Guard's functions, gives each one positive ownership, and fixes its boundaries, relationships and dependencies. How each function is implemented is Code's, written in DO; the Changes that deliver it are in [Change](change.md). Each element names, in brackets, the Requirements it serves.

## Elements

- **guard/A1 Check list** [guard/F1, guard/F7]. `guard.json`, at the repository root, is owned by the repository. It says which checks exist, their commands, where they run, which facts they need, which checker is trusted and which outcomes are named. It knows nothing of how a check decides.
- **guard/A2 Checks** [guard/F1, guard/F9]. The checks and their test content are the repository's. They know nothing of Git, GitHub or Guard beyond the facts guard/F9 gives them.
- **guard/A3 Runner** [guard/F2, guard/F3, guard/F7, guard/F9, guard/F10, guard/N2, guard/N4]. The runner, in the package at `lib/runner.mjs`, runs a set of checks and reads their verdicts. It knows nothing of branches, remotes, pull requests, GitHub, the adapters or KAAL. It reads a Git object only to take a trusted checker from the base commit (guard/F7).
- **guard/A4 Git adapter** [guard/F4, guard/F6]. The `pre-push` hook, shipped in the package as `templates/pre-push`, passes Git facts to the runner and acts on its verdicts. It knows nothing of GitHub and names no check.
- **guard/A5 GitHub adapter** [guard/F5, guard/F6, guard/F10]. A workflow job passes pull request facts to the runner and acts on its verdicts. Reporting to GitHub (annotations and the step summary, `run --github`) and the static coverage check (`verify`) sit beside the runner, in `lib/github.mjs`. A new consumer is offered `templates/guard.yml`.
- **guard/A6 Lifecycle** [guard/F8, guard/N3]. `init`, `upgrade` and `remove`, in the package at `lib/lifecycle.mjs`, own exactly the files recorded under `managed` and the `core.hooksPath` they set. Nothing else in a repository is theirs. They read `guard.json` through the same schema as `run` (guard/F1, guard/F18), refuse a file it rejects before writing anything, and write it only in Guard's canonical serialization, only when Guard's own entries change.
- **guard/A7 Dependency direction** [guard/F3, guard/F6]. The command (`bin/kaal-guard.mjs`) and the adapters depend on the runner; the runner depends on `guard.json`; `guard.json` names the checks. Nothing depends on an adapter, and the runner depends on neither guard/A5 nor the templates.
- **guard/A8 Package independence** [guard/N6]. The `kaal-guard` package, in `packages/kaal-guard/`, depends on no other KAAL element, declares none, imports none and references no Engineering path or KAAL Engine. It carries its own tests in `test/`.
- **guard/A9 Engineer** [guard/N7, guard/N5]. `engineering/guard/` holds Guard's engineering documentation, the Engineering-only outer tests and, later, the External tooling. It may use any useful KAAL element. Nothing it uses becomes a package dependency.
- **guard/A10 External** [guard/F8, guard/N5]. The External tooling, in `engineering/guard/external/`, produces and delivers a naked Guard Change for a target from the target's own commands. It uses no package internals and leaves no KAAL element in the target.
- **guard/A11 KAAL integration** [guard/N7, guard/F5, guard/F10]. KAAL is Guard's first consumer and installs the package from its workspace. Its lineage, Change Isolation and branching checks become entries in KAAL's `guard.json`, with their checkers trusted and `4` named held. Guard joins KAAL's existing workflows without replacing or consolidating them:
  - KAAL adopts Guard as an executor, not as a manager. **KAAL-owned:** the `checks` of `guard.json`, the check scripts and their policy, `.githooks/pre-push`, which holds KAAL's branching policy (it resolves each push's target), and every workflow's orchestration (names, OS matrices, triggers, trusted checkouts). **Guard-managed:** nothing; KAAL's `guard.json` has no `managed` or `config`. **Executed by Guard, not managed:** the hook's call to `kaal-guard run --local`, each job's `kaal-guard run --check` step and the `Guard` job's `verify`. KAAL keeps all three as they are and adopts no managed asset (guard/N8, guard/F17). The target is consumer-owned, not Guard-managed and not mixed, because Guard's templates cannot carry what KAAL's surfaces hold: the hook resolves each push's target by KAAL's branching policy, and the workflows carry the OS matrices, `pull_request_target` trusted checkouts and check identities KAAL's rulesets require (guard/N7). Managing either would move KAAL policy into Guard or lose an identity. KAAL therefore needs no adoption of pre-existing assets, and migration stays separate from the published-version upgrade;
  - each existing job keeps its name, OS matrix and triggers: `Hosting (Windows/Linux/macOS)`, `Acceptance (Windows/macOS)`, `Workspaces`, `Acceptance`, `Engineering`, `Change Isolation`, `Promotion Source`, `Branching` and `Branching audit`;
  - only the step that runs the check changes, to `kaal-guard run --check <name>`;
  - CodeQL and Dependency Review are GitHub's own checks and stay outside Guard.

- **guard/A12 Consumer acceptance** [guard/F11–guard/F18, guard/N8, guard/N9]. Engineering's acceptance of a published version, with KAAL as the consumer, in `engineering/guard/consumer/`. It belongs to Engineer (guard/A9) and may use Hosting and Testing. Each run clones KAAL's commit into a disposable directory and changes nothing in KAAL's working tree. In the clone only:
  - the development dependency is replaced by a published `@kaihacksai/kaal-guard` from the registry, and the lockfile records the registry's integrity;
  - `core.hooksPath` is set as a KAAL developer sets it, and a local bare remote lets Git run the hook on a real push;
  - the clone moves to a candidate version, back to the earlier one, and forward again; for KAAL that is a package-code update only (guard/F11), since KAAL has and adopts no managed asset;
  - `init` and `remove` run with KAAL's real `guard.json`, to show how Guard treats an existing integration (guard/F17, guard/F18).

  The managed-asset cases (guard/F12–guard/F14, guard/F16) need a consumer that has managed assets. KAAL has none and adopts none, so guard/A12 creates a minimal repository beside the clone: a simulated consumer with its own check and no integration of its own, where `init` installs both assets. guard/A12 needs the network to reach the registry. That is guard/A12's, not the package's, so guard/N2 still holds for the package. What KAAL's real CI and branch protection show is guard/A11's evidence, from the development package; guard/A12 claims none of it.

- **guard/A13 Skill source** [guard/F19, guard/F20, guard/N11]. The Embed Skill is in the package at `skills/kaal-guard/`, and the package ships it (`files`). Its text names the package's commands. It assumes no host, as KAAL's Agent Skills do, and Engineering checks it with `kaal-engineer-skill` (guard/A9). The package itself never depends on that check.
- **guard/A14 Skill placement** [guard/F23, guard/F24, guard/F26, guard/F27, guard/N10, guard/N12]. The lifecycle (guard/A6) installs, upgrades and removes the Skill as a managed asset at its canonical location, as the contract (guard/A17) states. It holds no provider convention and reads no provider declaration. The Skill's text depends on no location. It never writes an instruction file.
- **guard/A15 Reminder** [guard/F21, guard/F22]. The reminder is reporting, so it sits with the command and the GitHub reporting (guard/A5). It reads the Skill paths recorded under `managed`, or else the package's copy. The runner (guard/A3) and the hook (guard/A4) are unchanged, and the hook shows the reminder only because it forwards `kaal-guard`'s output.
- **guard/A16 External Skill** [guard/F25, guard/F26, guard/N12]. The External tooling (guard/A10) carries its own variant of the Skill as a template and writes it at the canonical location with the hook and the workflow. Where Core's realization is available in KAAL's workspace, the tooling may ask it at delivery for the target's further deployments and pointers, write the deployments, and list the pointers in `GUARD.md`. It uses no package internals, and no Core or Hosting element reaches the target.
- **guard/A17 Installation contract** [guard/F27, guard/N12]. `contract.json` is in the package, and the package ships it. It is Guard's instance of Core's Installation Contract schema, which Guard neither copies nor imports. The lifecycle (guard/A6) reads its assets and rules from it, so no second list of assets exists in Guard's code. Core reads the same file when it realizes Guard. KAAL Engineering (guard/A9) runs Core's conformance Test Cases against it, at engineering time only.

## Relationships

```mermaid
flowchart BT
  Hook[guard/A4 Git adapter] --> Runner[guard/A3 runner]
  WF[guard/A5 GitHub adapter] --> Runner
  Runner --> List[guard/A1 guard.json]
  List --> Checks[guard/A2 repository checks]
```

```mermaid
flowchart LR
  E[guard/A9 Engineer: engineering/guard, may use any KAAL element]
  E -->|build and pack| P[guard/A8 Embed: kaal-guard package, no KAAL dependency]
  E -->|guard/A10 implement and deliver naked| X[External: Change in target, no KAAL element]
  P --> C[consumer installs; adapters call the runner]
  X --> T[target's hooks and CI call its own commands]
  E -->|guard/A12 clone KAAL, install published, upgrade| K[disposable KAAL clone: published-npm consumer]
```
