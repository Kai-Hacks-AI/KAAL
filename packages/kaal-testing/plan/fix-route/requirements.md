# Failures point at the route to fix: Requirements

Each Requirement names, in brackets, the Intents it serves.

## Functional

- **testing/F122** [testing/I36]: **A Case may declare its route.** A Case in Testing's model may carry `route`: `{ do, where? }`, where `do` is a nonempty statement of the action that leads to the fix (a command, a call, a document to change, an owner to ask) and `where` is an optional repository path or Case, Node or package identity the action concerns. A `route` that is not an object, whose `do` is empty, or that has another member is a finding in `check`, naming the Case.
- **testing/F123** [testing/I36]: **The result carries the route.** For every Case whose result in a Run is `failed` or `unknown`, `results` and `evaluate` carry, with the result, a `response`: `{ case, result, version, expected, observed, route }`. `expected` and `observed` are what the Run's `diagnostics` recorded for that Case (testing/F128), never rewritten; an absent one is `null`. `route` is, in this order: the Case's declared `route`; else a computed route from the graph the caller gave (the Case's `tests →` targets and their owner, never an action); else `null`.
- **testing/F124** [testing/I36]: **No route is a finding.** A failed or unknown result whose `route` is `null` is reported as `no route declared` under its Case identity, in the same listing as the failure. It does not change the result and is never hidden; a consumer may gate on it by its own policy (testing/I3).
- **testing/F125** [testing/I36]: **Testing invents no action.** A computed route names only what the graph shows: targets, their declared owner and, for a Defect, the record to file. It never produces a command, a path to edit or a fix. A declared `do` is carried verbatim.
- **testing/F126** [testing/I37]: **A route changes no verdict.** The result, the Plan's evaluation and `passed` are the same with or without a route, and a declared route never makes a failed or unknown Case count as passed. Following a route is a new Run, judged on its own.
- **testing/F127** [testing/I36]: **Reports show the route.** Testing's markdown and JSON reports list, for each failed or unknown Case, its `response` with the route, in a stable order (Case identity). The `unknown` results include a route to obtain the missing evidence when the Case declares one.
- **testing/F128** [testing/I36]: **Diagnostics are captured by Testing.** For a failed test, the runner's reporter emits the failure's message and, where the error carries them, its `expected` and `actual` values as bounded text; Testing retains them per test with the rest of what it observed, and the Run records them as an optional `diagnostics` member keyed by Case identity. Only what Testing itself observed is a diagnostic: a copied or claimed one is not. A model without `diagnostics` is unchanged.

## Nonfunctional

- **testing/N26** [testing/I36]: The response is a deterministic function of the Case's declaration, the Run and the graph given: the same input gives the same `response` in the same order. It reads no host, no clock and no consumer, and imports only Testing's own model.
