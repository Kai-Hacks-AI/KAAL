# Requirements (draft, for Owner alignment)

Each requirement says what must be true of a model of Process composition and review lenses, not how it is built. Section 8 of the investigation names the gaps these answer. "Process" here is the concept in the Intent; whether it is a type, a Skill or only a reading is Architecture's question (Q1), not settled by these.

## Composition

- **R1. A Process composes, it does not redefine.** The meaning of a Skill or Extension is stated by that capability's own Node and Way of Working. A Process states how capabilities are used *in relation to each other* for a purpose and never restates, narrows or extends what one means.
- **R2. The relationship lives with the Process, not the capability.** No Node or Way of Working of a composed capability names the Process, nor needs another capability for its own meaning. Where today's wording already does (investigation §2), the model says so and does not depend on it; moving it is a separate Change.
- **R3. Participants are named by identity.** A Process names each participating Skill or Extension by `{name, id}` of its Node, never by directory, package, delivery name or location.
- **R4. A Process can state** which capabilities participate, their relationships and dependencies, the flows and feedback loops it wants, its review positions and lenses, and the boundary within which these apply (for example "within a Change").
- **R5. No mandatory sequence and no engine.** A Process describes relationships and expectations an Agent reads. It may state an order where its purpose needs one (Changing KAAL does); the concept requires none. Nothing executes, schedules, stores state for, or enforces a Process.
- **R6. Absence is stated.** Optional capabilities may not be installed (investigation §2). A Process says what a missing participant means for it: the relationship is unavailable, not silently skipped, and the Process remains usable without it.

## Review lenses

- **R7. A lens has exactly four parts**, stated together: (1) the *subject*, the result examined; (2) the *standard*, which for an internal lens is the Way of Working of a named capability and for an external lens is another identified result; (3) the *expectation*, the Process-defined relationship between subject and standard, ideally as the question the lens asks; (4) the *discipline*, Review.
- **R8. The Process defines the expectation only.** It does not copy the standard's steps, restate the Way of Working, or provide another way to write rounds, take identity, or judge convergence. Those stay with the capability and with Review.
- **R9. Subjects and standards are results with identity.** A lens examines a result as it stands, by exact identity, the way Review already requires; it never depends on where the result is kept.
- **R10. Position, mode and independence are three separate facts.** *Internal* and *external* describe the review's position relative to the subject. Engineer, Embed and External are KAAL operating modes. Independence is whether the Reviewer holds an assigned seat apart from the maker. None implies another; a lens statement must not state one in terms of another.
- **R11. No lens is mandatory by being stated.** Stating a lens makes it available to an Agent; it is owed only where the Process or the Owner says so. Neither internal nor external is automatic.
- **R12. Timing is stated.** Results are immutable once established. A Process says whether a lens applies before the subject is established (a finding can be resolved by describing again) or after (a finding informs the Owner and a future result).

## Standing of a targeted review

- **R13. A targeted review is not Change convergence.** A review of any result other than the Work, or any round not in the Change's `review/`, can produce findings and does not affect whether the Change's review has converged or what its compass reports.
- **R14. Authority is stated when a round is written.** A round states under whose authority the reviewer holds the seat and in what independence of the result's maker (Review's own rule). A targeted review with no assigned seat is *information*: it is reported, it is not a round that counts.
- **R15. A review does not change its subject.** Lens findings are for the one who made the result, or for the Owner when the subject is established.
- **R16. Where a finding is kept is decided by the Process.** Findings that matter are not left only in a place outside the Change record (a comment); the Process says whether and how they are carried into Work evidence. Review's round form is available but not required.

## Reuse and discovery

- **R17. Reuse.** The same capability Node is citable by any number of Processes unchanged, and no Process-specific text appears in a capability.
- **R18. Mode independence.** A lens statement is true in Engineer, Embed and External operation without alteration: it names identities and relationships, never Engine, Record or Subject locations (the separation settled in 08/03).
- **R19. Discoverable from a subject.** An Agent that starts from Core and from a subject it holds (an Intent, a set of Requirements) can reach the lens statements concerning that kind of subject without knowing capability names or IDs in advance and without loading everything. This is the requirement the Evidence does not yet support (evidence §3).
- **R20. Feedback is a relationship, not a loop engine.** Testing, Defects and operational results *inform* Requirements or Architecture as stated relationships; whether and when a result changes an upstream artifact is the Owner's and, for an established Intent, another Intent.

## Boundaries of this Change

- **R21. Existing meaning is untouched.** No sealed Node, no Core, no `kaal-changing`, `kaal-intent`, `kaal-review`, `.github` or `engineering` file is changed, nothing is renamed, and no new Core machinery is proposed unless a gap in the investigation cannot be met otherwise.
- **R22. Nothing is established.** No Node, package, script, review governance or seat rule is created. The Work holds a design for review only.
- **R23. Learning is separate.** BRAIN may hold what was learned about a lens (that a particular lens catches a recurring mistake) and may be cited by a Process. It never defines a capability or a lens.
