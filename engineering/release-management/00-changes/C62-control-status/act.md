# C62 act

A 4L retrospective of the Change, from the viewpoint of the agent that carried it.

## Liked

The two Cases of the PLAN (T810, T811) asked for what the Change is for: a control is listed with its status even when its declaration is incomplete, and the release controls declare their statuses. The DO was a patch the controls thread had finished, applied unchanged, so the later SYNC of controls/C12 can stay a pure merge. The CPO's review turned a code question into an architecture account, now written in `change.md`: what the Script does, what the Skill does, what the Package owns and what stays on released X in `.kaal/`.

## Learned

A status on a control must be found by a Script and judged by an agent: the finder lists the declared value and its problems, and only the Skill can say whether the evidence supports it. Making incomplete declarations visible changes one thing for a consumer, the meaning of `controls` (it now also holds invalid ones), so the new `valid` field has to be respected; the CPO stated it as a condition. A control on main is Implemented only, never evidence that it protects anything.

## Lacked

A way to find controls that nobody declared, and controls without a Case. The finder only lists what is declared, so an undeclared control is still found by bare agent work.

## Longed For

The Package guidance as a whole: an `AGENTS.md` that knows when to use the framework and the Skill, with `list-candidates` and `list-uncovered` Scripts under it. SKILL and AGENT are entry points into one framework, not rivals.

## Follow-ups

- SYNC main into this collector and promote, after the sync-review WIRE leaves the seat; then the pure re-sync of controls/C12.
- Subsequent Changes, in the controls thread: the Package `AGENTS.md`, `list-candidates`, `list-uncovered`, recovery an agent can begin. Deployment into `.kaal/` only after a publication on npmjs.
- Consumers of the finder respect `valid`; the release control Cases already do.
