# Retro

## Learned

The most useful lesson from reviewing this Change was that naming a support control is architectural, not cosmetic. `admit-lineage` made the host sound like the owner of admission semantics; `contain-change` makes the boundary visible: KAAL defines admissibility, while the Support Engine supplies baseline and candidate and exposes the predicate's result. The same separation applies more broadly to realization choices. Git, GitHub and NLP/AI providers are outside KAAL; KAAL describes roles, meaning, evidence and process without knowing which host, transport, model, agent or human realizes them. I also learned that the isolation exception works because controls compose: isolation recognizes the allowed shape of a Change record, while containment establishes that exactly one new closed Change crosses lineage. Neither should duplicate the other's judgment.

## Liked

The final control is deliberately thin. Its script does not reinterpret closure, identity or history; it delegates those semantics to the predicate delivered by the preceding KAAL Change. I liked that the red isolation boundary in the earlier attempt ultimately produced two explicit Changes in sequence rather than an exemption: first KAAL defines the rule, then the Support Engine consumes it. The empty-baseline case and the corrected workflow wording also closed the gap between requirements and executable evidence without making the control more ambitious. The staging limitation is stated honestly instead of being “fixed” by reproducing admission logic inside isolation.

## Lacked

The first version blurred several ownership boundaries at once: KAAL semantics versus host enforcement, admission versus containment, and a control being reported versus being required. Those distinctions were recoverable in review, but they were not sharp enough when the Support Engine work was first packaged. I also lacked a consistent early naming test of the form “does this verb describe exactly what this component owns?”; applying that question immediately would likely have prevented `admit-lineage` from spreading through the workflow, script, tests, documentation and sealed Work before correction.

## Longed

For Support Engine controls to remain a small vocabulary of precise composable verbs whose names reveal their authority: preserve, isolate, contain, without claiming semantic ownership they do not have. I want the same discipline applied to realization boundaries generally: KAAL should remain indifferent to Git/GitHub and to NLP/AI providers, while hosts and orchestrators are free to choose those technologies to realize KAAL roles. Most immediately, I want this Change to land, `contain-change` to become required on the lineage ruleset, and the next Change to demonstrate the completed architecture by being independently reviewed and admitted through the gate this sequence created.
