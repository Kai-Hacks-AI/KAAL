# Contract Evidence from Observed Runs: Intent

This is `testing/C7`, a PLAN Change. It ships no code. `testing/C8` turns its planned tests GREEN.

The Owner set the direction on #276 (comment 6419391393). LOVE is the test a package must pass before it steps up from internal capability to reusable or published package, and its V asks for independent evidence. The Owner asked for `kaal-testing`'s test and evidence semantics to mature in parallel with Core's evaluation (`core/C16`), with no circular ownership. What counts as evidence is Testing's.

Today `kaal-testing/contracts` reports every statement as unknown. The reason is in its README: per-test results need a runner execution with established provenance, and none exists yet. `kaal-testing/acceptance` already runs a capability's acceptance scenarios against packed tarballs, with a manifest and a ledger of what each scenario installed. This Change joins the two, so that a statement can rest on tests Testing itself observed passing against the package as delivered.

- **testing/I4.** Testing alone defines what counts as independent evidence that a package's consumer-visible contract holds, and how that evidence is classified:
  - **Same semantics for every package.** Every capability's package, Core's included, is judged in the same way.
  - **No ownership of the judged.** Testing owns none of the cases it judges, and its judgment imports no package it judges.
  - **Consumers.** Core's LOVE names this meaning, and Engineering decides when it runs and what it gates.
- **testing/I5.** A contract statement rests on evidence only when Testing observed it: the capability's own tests ran against the package as delivered, in a run whose provenance Testing established. A record, a claim, a copied result, or a pass anywhere else stays unknown. What is observed is that tests passed. That they bear on the statement remains an inference, reported as the judgment it is.
