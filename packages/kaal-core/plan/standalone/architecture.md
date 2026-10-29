# Core Standalone: Architecture

Each element names, in brackets, the Requirements it answers.

- **core/A37** [core/F76, core/F77, core/F78]: The dependency position becomes:

  ```
  kaal-foundation    kaal-hosting        (technical, mandatory)
         ↑   ↖           ↑
     kaal-form           |               (technical, mandatory; Graph-owned, under A)
         ↑    ↖          |
     kaal-core    kaal-graph ────────────┘   (Graph optional for Core)
  ```

  It replaces the earlier ruling "kaal-hosting ← kaal-graph ← kaal-core, no shims". There are still no shims: Core imports Form directly, and nothing re-exports Graph for Core.
  - `src/node.ts`, `frontmatter.ts`, `installation.ts` and `engine.ts` import Form instead of `kaal-graph` and `kaal-graph/form`.
  - `engine.ts`, `bootstrap.ts`, `register.ts` and `cli.ts` replace `new Graph(…)` with Core's own index of admitted Nodes by name and id.
  - `core/C26` computes registration's incoming views and cycles itself, with no graph/C3 dependency.

## Change graph and the 0.0.1 release map

| Order | Change | Owner | Depends on |
| --- | --- | --- | --- |
| 1 | `core/C32` PLAN, this Change | Core | the Owner's A, B or C |
| 2 | Form split: the Form package, with Graph depending on it | Graph (under A) | 1 |
| 3 | `core/C33` DO: core/T81–T83 GREEN, Core's imports and lookups | Core | 2 |
| 4 | `core/C26` DO, without graph/C3 | Core | 3 |

For `core/C28`'s release map (#622), this removes:
- graph/C3 on `main` and the sync carrying it into `kaal/core` (rows 3–4);
- Graph's rename and publication (rows 7 and 12, for Graph).

It adds the Form package's split, its rename to `@kaihacksai/kaal-*`, and its publication, beside Foundation and Hosting. `core/C29` revises C28's map and T79's dependency walk when it runs.
