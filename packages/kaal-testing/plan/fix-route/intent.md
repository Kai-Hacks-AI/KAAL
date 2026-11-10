# Failures point at the route to fix: Intent

This is `testing/C58` (number provisional), a PLAN Change. It ships no code, test, export or package change. It records an Owner principle for Testing (10 November 2026): tests are deterministic, and when one fails, its verbose response points at the route to fix, so every consumer of Testing benefits.

**What exists, and what is missing.** testing/I1 says a RED is evidence and is never hidden: every failing Case is reported under its own identity and class. testing/I19 (BRITTLE) says a Case is Right when its verdict follows its target and nothing else. Neither says what a failing result must tell the reader to do next. Today the report names what failed and leaves the way out to whoever reads it.

**Relationship to Release management's recovery PLAN.** Engineering's PLAN (Release management, #1349) puts a recovery step into every fail or held verdict of the release controls, with Cases that check that each verdict names a concrete action and that the action is reachable. That is the first consumer instance. This PLAN does not repeat its Cases or its release specifics. It states the general rule once in Testing, so that the instance is an application of it and a later consumer inherits it.

- **testing/I36**: A Case is deterministic, and its failing or unknown result points at the route to fix. The route is stated by the Case's owner, who knows the target. Testing carries it into the result, computes only what the graph shows, and invents no action. A failing result that carries no route is reported as lacking one: never silent, and never a pass.
- **testing/I37**: A route changes no verdict. A route is guidance in the result, of the same standing as the evidence it sits beside; it never turns a failed or unknown result into a pass, and following it is a new Run.

**Boundaries kept.** Whether a route's action exists and can be reached (a command that runs, an event that fires) is the consumer's to check, as Engineering does for release verdicts. Which action fixes a failure is the Case owner's. Testing knows no consumer by name (testing/I4, testing/I10).
