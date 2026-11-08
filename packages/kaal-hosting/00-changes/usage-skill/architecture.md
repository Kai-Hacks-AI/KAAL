# Hosting Usage Skill: Architecture

- **hosting/A23** [hosting/F57, hosting/F58, hosting/F61]: **Agent-facing adapter.** `skills/kaal-hosting/SKILL.md` carries a concise procedure and references inside `skills/kaal-hosting/references/`. One operations reference holds the selection guide, recovery guidance and executable examples; avoid copies of the authoritative five product documents. The procedure explains how to locate those documents from the installed package. The existing `skills/kaal-hosting-boundary/` remains separate; a sibling-relative link is not portable. The existing `payload/Hosting.md` remains unchanged.
- **hosting/A24** [hosting/F58, hosting/F59, hosting/F60, hosting/F61]: **One implementation of host behavior.** Bare consumers and agent examples use the same named public exports. The Script realization is the existing library, verifier and boundary command; this Change adds no general filesystem CLI or runtime wrapper. A consumer supplies the working directory and authorized operation. Fixture setup may use Node built-ins in tests; the demonstrated operation itself must use Hosting. Installed verification remains self-contained and depends on neither Core nor Engineer Skill. The Engineer Skill checker is a publisher tool, never a runtime dependency.
- **hosting/A25** [hosting/F62, hosting/N8]: **Test placement.** Delivered usage Cases join `test/embed/` in the appropriate outer/code loops, preserving the current runner and manifest format. Publisher-only relocation/standard checks and negative challenges live under `test/plan/` or `test/publisher/` and are selected by `test:publisher`. Reuse Hosting's fresh packed-consumer fixtures and Testing's existing acceptance/once-pack facilities where already available; do not add a parallel release or acceptance system. Exercise examples from the actual installed resources. Authoritative docs and README gain the new product contracts, traces and discovery pointers in DO; the existing `skills` and `test/embed` package file entries already admit these resources.

## Boundaries

No changes to `src/`, payload Node identity, root dependencies, Core, workflows, guard/checker policy, ownership claims or the existing boundary Skill are required by this PLAN. If implementation demonstrates such a dependency, return the specific finding for its owner's separate Change. Do not relax these boundaries to obtain GREEN.

## Delivery

| Step | Owner | Prerequisite and result |
| --- | --- | --- |
| C25 PLAN → `kaal/hosting` | Hosting; Engineering implements | Independent Owner review and required checks; ordinary Change, squash |
| TDD → bounded DO → `kaal/hosting` | Hosting; Engineering implements | Approved PLAN; immutable outer cases, RED/GREEN evidence, packaged Skill and three-host consumer evidence; separate review and squash |
| Collector preparation and incremental SYNC | Engineering and each affected owner | Resolve the existing package-identity/promotion-admission findings separately; preserve newer main work and judge genuine conflict resolutions; merge commits |
| Focused Hosting PROMOTE → `main` | Owner decision | Current-main freshness, exact net scope, all CI and independent review; squash; workflow-only delivery stays separate |
| Hosting publication and registry acceptance | Owner decision | Separately authorized tested artifact, first-publication procedure and registry acceptance; never inferred from a merge |
| Core dependency adoption/release | Core | Verified scoped Hosting dependency; Core's own requirements, tests, promotion and publication decisions |

Work on this Hosting-only PLAN/DO can proceed without waiting for unrelated workstreams. It does not lift the earlier hold on #786 or authorize a migration exception, synchronization, promotion or publication.
