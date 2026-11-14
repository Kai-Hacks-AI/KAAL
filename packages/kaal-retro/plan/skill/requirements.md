# Requirements (retro/C1)

R1 Installed alone, the Skill is complete: `SKILL.md` and `references/4l.md`, with every link resolving inside that folder.

R2 The Skill depends on no KAAL package, WORK or PDCA definition, repository, GitHub, hook or CI, and names none as a prerequisite.

R3 `SKILL.md` owns the general behavior: establish subject, purpose, scope and participants where relevant; choose a method and say which; separate observations, interpretations and proposals; keep context and provenance; size the result to the subject; leave decisions and authorization to their owners.

R4 `references/4l.md` defines 4L (Liked, Learned, Lacked, Longed For) as one method, not as the definition of Retro. Every category may yield proposals; none is treated as more actionable.

R5 A retrospective record has one shape, so it can be checked: chapters `Subject`, `Method`, then the method's categories, then `Decisions`. Each entry is labeled `Observation:`, `Interpretation:` or `Proposal:`. `Decisions` reads `None made.` or `Decided by <owner>: <decision>`.

R6 No prerequisite of completed work, a Change or a cycle: an ongoing subject is valid.

R7 Nothing creates or authorizes a Change. A record that does is reported.

R8 An advisory checker, `scripts/check-retro.mjs`, reads a record and returns `clear`, `report` or `unknown` with reasons. An unreadable record is `unknown`, never `clear`. It reads text only and changes nothing. It is helper tooling: nothing runs it automatically.

R9 Where the kaal-skills contract is on main by DO time, the package may declare `integration.kaal.json` with the checker and the Skill section as mechanisms. Nothing in R1 to R8 depends on it.
