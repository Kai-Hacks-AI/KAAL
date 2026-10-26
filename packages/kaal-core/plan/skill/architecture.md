# Canonical Skill Bytes: Architecture

Each element names, in brackets, the Requirements it answers.

- **core/A24** [core/F21, core/N13]: In `kaal-core/agent`, `realize` deploys each Skill file's source bytes unchanged at every root: the canonical `.agents/skills/<name>/` and each provider's `deploy` location. The placement table gains no transformation. A future provider that needs one gets it through a PLAN that names it in that provider's entry, and it applies only to that provider's derivative, never to the canonical location. `renderSkill` is retired from `kaal-core/agent` (Option A below). `kaal-core/agent` then no longer imports `kaal-graph/form`.

## Options considered

| Question | Recommended | Alternative | Why not |
| --- | --- | --- | --- |
| What happens to `renderSkill`? | **A.** Retire it. No placement uses a transformation, and Core keeps no Skill-format code (`core/N13`). `engineer-skill/C1` makes Engineer Skill the one reader of a `SKILL.md`, with `description` in the frontmatter only, which is this case. | B. Keep it exported, unused by `realize`. | B leaves Core owning a rendering of `## Description` into `description`, which is Skill-format policy. That is Engineer Skill's, and B gives it two owners. |

**Consumer note.** Under A, Architecture's planned `architecture/T3` (#485) stops being able to call `renderSkill`. That assertion changes through Architecture's own PLAN amendment, `architecture/C7` in the #485 map, before `architecture/C5` is revised.

## Change graph

| Change | Owner | Depends on |
| --- | --- | --- |
| `engineer-skill/C1` PLAN (#490): Engineer Skill is the one authority for reading a `SKILL.md`. The frontmatter `description` is the only description, CRLF and LF read alike, and installation preserves bytes | Engineer Skill | none |
| `core/C22` PLAN, this Change | Core | `engineer-skill/C1` |
| `core/C23` DO: `realize` deploys source bytes unchanged, `renderSkill` retired, README and Code tests | Core | `core/C22` |
| `architecture/C6` SYNC main → kaal/architecture, then `architecture/C7` and the revised `architecture/C5` (#485) | Architecture | `core/C23` promoted to main |

`core/C19` (#472, Core's lifecycle) is independent of this Change and does not wait for it.
