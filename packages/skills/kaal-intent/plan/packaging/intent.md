# Packaging readiness (LOVE): Intent

> PLAN (`intent/C5`), the first change of `intent/C4`'s product plan. It ships no code, Node or test, and authorizes no synchronization, promotion, version change or npm publication. It plans what `kaal-intent` needs before it can be offered as a reusable, independently versioned package: Lifecycle, Ownership, Verification and Encapsulation (LOVE), in the form `requirements/C5` took for Requirements. Readiness is not authorization to publish: publishing, and any package name or registry it needs, is a separate Owner decision.

- **intent/I8.** A consumer who installs `kaal-intent` gets exactly what its documents say, can tell what an installation is, and can verify the installed copy without this repository. Nothing about Intent's meaning moves to another owner on the way.
- **intent/I9.** Intent plans only its own package. It asks Core for no new behaviour, Hosting for nothing, and does not wait for either to plan.

## Where `kaal-intent` stands

The package ships Nodes and an Agent Skill, and no runtime dependency (`devDependencies` only: `kaal-core`, `kaal-engineer-skill`, `kaal-graph`, `kaal-hosting`). Measured against LOVE:

| | Today | Gap |
| --- | --- | --- |
| Lifecycle | The README installs it with `kaal register skill kaal-intent …/payload`; `files` lists `payload` and `skills` | No Installation Contract instance (no `installation.kaal.json`, the format Core's own package uses), so no installer can say what an installation of Intent is. Core's upgrade and removal path for a registered contribution was recorded as absent in `requirements/C5`; this PLAN does not re-verify it |
| Ownership | `ownership.kaal.json` claims `packages/skills/kaal-intent/` for `Intent` by name and id (`intent/C2`). The Skill Node bounds Intent against Requirements, Changes and storage | The claim names a path that the repository's flat-layout move (#964) changes for packages on main. Intent's own claim must follow its package, in its own Change. The Skill and its README do not yet state the boundary with a Defect or a trigger (`intent/C8`, a CPO question) |
| Verification | 14 cases in `test/intent.test.mjs` run in this repository against Core, Graph, Engineer Skill and Hosting | `test/` is not in `files`, so no case ships to a consumer, and no scenario installs the packed package into a clean consumer and registers its Nodes |
| Encapsulation | `files` is `payload` and `skills`; the package declares no `exports` | Nothing checks that the packed package holds exactly its Nodes, Skill and declared documents, or that the README names every Node a consumer may rely on |
