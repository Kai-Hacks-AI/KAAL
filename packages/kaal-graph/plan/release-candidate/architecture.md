# Graph release candidate: Architecture

Each element names, in brackets, the Requirements it answers.

- **graph/A10** [graph/F10, graph/N8]: The blocker is a governance conflict, not a code defect. The atomic rename of Hosting's package touches Graph and Core, and Change Isolation requires Core to travel alone. #823 (47 non-Core paths) and #825 (15 Core paths) pass the check separately, but neither half installs alone. Graph does not choose the route. This PLAN offers the options for the Owner:
  - **Route 1, ordered halves.** Land the Core half first and the non-Core half after, each as its own Change, with the Owner accepting that the intermediate state does not install.
  - **Route 2, Hosting-first.** Wait for Hosting 0.0.1 to reach `main` as one scoped migration (Route A, ledger rule #862 first), then bring `main` into `kaal/graph` by the governed SYNC. #823 and #825 then reduce to Graph's own references. This is the recommended route: it adds no second migration path, and Graph publishes after Hosting anyway.
  - **Route 3, exception.** An Owner-granted Change Isolation exception for the one migration PR.
- **graph/A11** [graph/F11]: `graph/C6` uses the repository's mechanisms and builds none:
  - Pack: `engineering/delivery/pack.mjs`, once. The same tarball is installed, measured and, later, published. No repack.
  - Install and accept: `engineering/lanes/acceptance.mjs` with Testing's acceptance method (install, accept, discover).
  - Quality: Packaging's `conform` and `measure`, plus Graph's own cases.
  - Publication stays outside this route: a first publication is the Owner's 2FA publish of the verified Release artifact, then Trusted Publishing.
  Engineering is asked for any gap in these mechanisms and does not own the Graph Changes.
- **graph/A12** [graph/F12]: `test:publisher` joins root CI when #655 reaches `kaal/graph`, through the freshness SYNC (graph/F10 item 4). Until then the evidence says plainly that the publisher cases ran locally only.

## Change graph and dependencies

| Change | Owner | Waits on |
| --- | --- | --- |
| `graph/C11` PLAN (this) | Graph | — |
| Ledger rule on `main` (#862), Hosting 0.0.1 on `main` | Process, Hosting | Owner gos already given for Hosting SYNC steps and the ledger-rule promotion |
| Owner decision on graph/A10's route | Owner | `graph/C11` review |
| `main` → `kaal/graph` SYNC (freshness; brings #655 and the Hosting scope) | Owner-authorized | route decision |
| #823, #825 reduced to what remains, accepted | Graph, Core | the SYNC |
| `graph/C5` (#659) refreshed, regenerated manifest, T8–T12, T14, T15 GREEN | Graph | #823, #825 |
| `graph/C6` acceptance, graph/T13 GREEN with graph/F11 evidence | Graph | `graph/C5`; Hosting's scoped tarball |
| #621 returns for promotion approval | Owner, CPO | `graph/C6` |
| Promotion to `main`, then publication after Hosting | Owner | each authorized separately |

Graph's release is last in the publish order after Foundation and Hosting, and Core's does not wait on it (core/C32). The route is therefore not urgent, which is why Route 2 costs nothing.
