# Requirements (retro/C1)

R1 Installed alone, the Skill is complete: `SKILL.md` and `references/4l.md`, with every link resolving inside that folder.

R2 The Skill depends on no KAAL package, WORK or PDCA definition, repository, GitHub, hook or CI, and names none as a prerequisite. An agent needs no lookup of earlier retrospectives, PR templates or conventions to produce one.

R3 `SKILL.md` owns the general behavior: establish subject, purpose, scope and participants where relevant; choose a method and say which; separate observations, interpretations and potential improvements; keep context and provenance; size the result to the subject; leave decisions and authorization to their owners. It states no completed-work or lifecycle prerequisite.

R4 `references/4l.md` defines 4L (Liked, Learned, Lacked, Longed For) as one method, not as the definition of Retro. Every category may yield potential improvements; none is ranked above another.

R5 The Skill creates and authorizes nothing: no Change, decision or approval comes out of a retrospective.

R6 `references/4l.md` states what a 4L result contains, each expectation with the reason the method gives for it: the method and subject named; all four questions asked, a category with nothing to report saying so; every entry labeled observation, interpretation or potential improvement; whose views are included and whose are missing; no decision, approval or assignment recorded. The expectations belong to 4L. They are not a schema for other methods or for Retro in general.

R7 Deterministic Cases challenge 4L result records against R6: a conforming record raises no finding and each defective record raises its finding. The challenge lives in the test folder. It is not shipped with the Skill and nothing runs it automatically.

R8 The Skill's execution is nondeterministic and is judged separately from R1 to R7. A Skill-only agent trial and a baseline trial (an agent working as today, looking up earlier retrospectives and templates to copy their shape) run the same subjects. External lookups, tool calls and context used are recorded per arm. Behavioral quality is reported apart from the deterministic Cases, with its limitations, and claims no pass.

Deliberately not required: a universal record schema, a checker shipped with the Skill, and an `integration.kaal.json` declaration.
