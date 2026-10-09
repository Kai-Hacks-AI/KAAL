# Recommendation: TALL

## The answer

**Adopt TALL as a reading lens for what KAAL enables an Agent to do, not as an organizing model of KAAL's parts.** Keep it proposed vocabulary. Its place, if Kai wants it, is one short paragraph in `architecture/overview.md` once #74 has landed. Do not establish a Node, a Skill, a registry or an AGENTS.md line for it now.

Why a lens and not a model: TALL describes an interaction (the Agent thinks, acts, learns, lives *through* KAAL), and one capability serves several dimensions (`kaal-retro`, `kaal-collecting`, `kaal-github`). A model of parts would have to place each package in exactly one dimension and would be wrong for the ones that matter. As a lens it adds no ontology, which is what the Intent requires.

## Boundaries

1. **KAAL is not the actor.** Every dimension is stated as what the Agent does with KAAL. Thinking is the Agent's; KAAL only holds what can be found.
2. **Three axes, not one.** Parts (overview columns), Work (Six Ds), enablement (TALL). TALL never replaces or maps onto a D, and the overview diagram is not redrawn.
3. **Acting versus Living is the trust boundary, not an execution boundary.** Acting: authority from the Owner's grants and KAAL's seals. Living: content from a party KAAL cannot govern, where KAAL contributes identity, refusal and a record. The same script can serve both.
4. **Thinking versus Learning is read versus write on one BRAIN.** The only interface between them is the line a Learning states for when to recall it, which `find` prints on every card.
5. **Modes are orthogonal.** Engineer, Embed and External say where Engine, Record and Subject are; all four dimensions mean the same in each.

## Dependencies and consequences

- **#72 is untouched.** One Skill `kaal-learning` stays, read side first (its transition step 1). `kaal-thinking` is a reserved name for the dimension, not a package. Split only when the read side has a consumer that is not a BRAIN (#72 Fork 7 marks the seam as the possible `kaal-graph`).
- **#73 is untouched.** Consulting held knowledge before Requirements is a Process's business, composing `find` like any Skill; no dimension owns it.
- **#74 (the overview).** It is open and this Change must not touch it. After it merges, a follow-up documentation Change adds, to `overview.md` only: a short "Reading the architecture by what it enables" paragraph, marked proposed, with the table in `02-investigation.md` section 1 in compact form. No diagram change, no new column, no AGENTS.md line.
- **Core, `.github`, Nodes and seals** are not touched.

## Smallest useful next realization

For `kaal-thinking`: nothing separate. The smallest realization is #72's step 1 as already agreed: the three Nodes and the read side (`find`, `near`, `show`), useful before any Learning exists. The one adjustment this investigation supports is in the Skill's `description`: lead with what an Agent wants ("find what KAAL already holds: Skills, Changes and Learnings") so Thinking is reached by the question and not by the package name.

For `kaal-learning`: #72 step 2 after step 1 (`check`, `establish`), then the first Learnings through a Change. CEIL goes in there, below.

Independent of TALL, the test found two cheap gaps worth their own Changes if Kai wants them: the optional Skills (`kaal-review`, `kaal-intent`, `kaal-incident`, `kaal-request`) exist in `packages/` but are not installed in `.kaal/`, and nothing in the repository says in one place what is built and what is target. #74 closes the second.

## CEIL, without reopening #72

CEIL fits the anatomy #72 already settled, and is better read as the order of the establishing practice than as four fields:

| CEIL | In a Learning (#72) | Role |
|---|---|---|
| Cue | the situation section (`Applies when`, proposed `Situation`) | what a later Agent matches against; `find` prints it |
| Evidence | the evidence section (`<ID>  <path>`, mandatory, sealed artifacts) | traceability |
| Insight | the understanding prose | what is drawn |
| Learning | the Node as a whole | the outcome, not a section |

So three of CEIL's terms already exist and the fourth is the result. Consequences: no new field, no fourth mandatory section, nothing in frontmatter (Core's Form admits none). In the Skill's `establish` practice the steps can follow C, E, I, L (look first with `find`, gather sealed evidence, draw the insight, establish), which gives an Agent a memorable route. Fork 3 (section names) stays open for the birth Change: `Cue` is the better word for the role, because `find` reads that line; `Situation` is the safer word for the heading, because #72 rejected terms that suggest a script can match a condition. I lean to `Situation` as the heading and "cue" as what it is for, but this is the Owner's call at the birth of `Learning`.

## Forks for the Owner, with my recommendation

1. **Adopt TALL?** Recommend: as a proposed lens in `overview.md` only, after #74 merges. Alternative: a mnemonic KAAL Definition Node `TALL` in a package (precedent: RATIFICATION), only if you want it reachable from Core by reference. I advise against it until a Skill or Process would cite it.
2. **Separate `kaal-thinking`?** Recommend no; reserve the name and split on the trigger above.
3. **Heading: `Cue` or `Situation`?** Recommend `Situation`, decided when `Learning` is born.
4. **Should the optional Skills be installed in `.kaal/`?** Recommend a separate Change, not here.
5. **More evidence?** The discovery test is one run per arm and showed no gain from TALL. If you want it decided harder, a fourth arm (a status table without TALL) and a second model would separate the effects. I did not run them.

Process state: the Reviewer seat is empty and I started no helper to fill it. I will not seal Work, write retros or close the Change without your go naming the step.
