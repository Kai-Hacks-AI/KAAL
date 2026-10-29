# Consumer Verifier Conformance: Requirements

Each Requirement names, in brackets, the Intents it serves.

## Functional

- **testing/F43** [testing/I14]: **The scenarios.** The contract names each scenario: its identity, the one change a publisher's harness makes to a fresh consumer holding the packed candidate, and the result every conforming verifier then shows. There are at least these scenarios:
  - **verified:** a clean run; a declared case that is declared not applicable on the platform;
  - **failed:** a declared case that fails; the consumer's content changed during the run;
  - **unknown:** no case at all, with a manifest that declares none; the manifest absent; the manifest malformed; a declared case the package does not deliver; an installed file changed, removed or added; a declared case skipped; a declared case marked todo.

  This is hosting/F26's minimum set. A caller cannot change the scenarios.
- **testing/F44** [testing/I14]: **Observing a run.** A run is observed from its exit status and its summary line. The summary line is the one line starting with the verifier's declared prefix, and it holds a JSON object. Its result is read through the verifier's own declared word for each of verified, failed and unknown, three distinct words. Each verifier keeps its own words, and none is translated by label alone. No summary line, two summary lines, a summary that is not a JSON object, or a result word the verifier did not declare is no observation, with a finding. Lines after the summary line, such as a package manager's own output, are ignored. The summary holds `result`, `cause` when not verified, `package { name, version, location }`, `platform`, `node`, `digest`, and `cases`, one `{ name, outcome }` per case. An outcome is `pass`, `fail`, `skipped`, `todo`, `not applicable` or `not run`, the words hosting/F21 proposes.
- **testing/F45** [testing/I14]: **Judging an observation.** An observation conforms to a scenario only when every observable agrees with the scenario and with the facts the harness established itself: the package it installed, by name, version and real location; the platform and Node version it ran on; the digest it recomputed over the installed files; the declared cases; and the case the scenario targets.
  - The result is the scenario's, and the exit status is the result's: 0 for verified, 1 for failed and 2 for unknown (testing/A9).
  - A run that is not verified names a cause. A verified run names none.
  - The package, platform, Node version and digest are the harness's. In the two manifest scenarios, the digest is not compared, since a verifier may stop before computing it.
  - Where the scenario says so, every declared case is reported exactly once. The targeted case has the scenario's outcome, and every other case passed. Where no case is declared, none is reported. Every reported case has a name and an outcome from testing/F44.

  Each disagreement is named, and a matching result word with any disagreement does not conform. A run with no observation never conforms.
- **testing/F46** [testing/I14]: **Claims the contract refuses.** A verifier that claims any result other than the scenario's never conforms in that scenario. In particular:
  - verified on no cases, an absent or malformed manifest, a changed, removed or added installed file, or a skipped, todo or missing case;
  - unknown or failed on a clean run or on a declared inapplicable case;
  - unknown or verified on a failing case or a changed consumer.

## Nonfunctional

- **testing/N9** [testing/I14]: The contract is pure. `observe` and `judge` read nothing from a host, run nothing, keep nothing and change no input. Each package's verifier depends on no Testing package, and the contract adds no runtime dependency to any product.
