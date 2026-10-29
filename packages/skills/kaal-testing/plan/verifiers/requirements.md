# Consumer Verifier Conformance: Requirements

Each Requirement names, in brackets, the Intents it serves.

## Functional

- **testing/F43** [testing/I14]: **The scenarios.** The contract names each scenario: its identity, the one change a publisher's harness makes to a fresh consumer holding the packed candidate, and the result every conforming verifier then shows. There are at least these scenarios:
  - **verified:** a clean run; a declared case the manifest declares not applicable, with a platform scope that excludes the platform and a reason, as testing/F47 requires;
  - **failed:** a declared case that fails; the consumer's content changed during the run;
  - **unknown:** no case at all, with a manifest that declares none; the manifest absent; the manifest malformed; a declared case the package does not deliver; an installed file changed, removed or added; a declared case skipped; a declared case marked todo; a declared case whose inapplicability is unsupported, because the manifest gives no platform scope that excludes the platform, or no reason; a delivered, declared case the package's runner silently leaves out on the platform; a declared case the runner replaces there with a stand-in under another identity (testing/F48).

  This is hosting/F26's minimum set. A caller cannot change the scenarios.
- **testing/F44** [testing/I14]: **Observing a run.** A run is observed from its exit status and its summary line. The summary line is the one line starting with the verifier's declared prefix, and it holds a JSON object. Its result is read through the verifier's own declared word for each of verified, failed and unknown, three distinct words. Each verifier keeps its own words, and none is translated by label alone. No summary line, two summary lines, a summary that is not a JSON object, or a result word the verifier did not declare is no observation, with a finding. Lines after the summary line, such as a package manager's own output, are ignored. The summary holds `result`, `cause` when not verified, `package { name, version, location }`, `platform`, `node`, `digest`, and `cases`, one `{ name, outcome }` per case. A case that is `not applicable` also shows its `applicability { platforms, reason }`. An outcome is `pass`, `fail`, `skipped`, `todo`, `not applicable` or `not run`, the words hosting/F21 proposes.
- **testing/F45** [testing/I14]: **Judging an observation.** An observation conforms to a scenario only when every observable agrees with the scenario and with the facts the harness established itself: the package it installed, by name, version and real location; the platform and Node version it ran on; the digest it recomputed over the installed files; the declared cases; and the case the scenario targets.
  - The result is the scenario's, and the exit status is the result's: 0 for verified, 1 for failed and 2 for unknown (testing/A9).
  - A run that is not verified names a cause. A verified run names none.
  - The package, platform, Node version and digest are the harness's. In the two manifest scenarios, the digest is not compared, since a verifier may stop before computing it.
  - Where the scenario says so, every declared case is reported exactly once. The targeted case has the scenario's outcome, and every other case passed. Every reported case is a declared one. Where no case is declared, none is reported. Every reported case has a name and an outcome from testing/F44.

  Each disagreement is named, and a matching result word with any disagreement does not conform. A run with no observation never conforms.
- **testing/F46** [testing/I14]: **Claims the contract refuses.** A verifier that claims any result other than the scenario's never conforms in that scenario. In particular:
  - verified on no cases, an absent or malformed manifest, a changed, removed or added installed file, or a skipped, todo or missing case;
  - verified on a skipped, todo or unsupported case reported as not applicable (testing/F47);
  - verified on a declared case silently omitted, or replaced by a stand-in (testing/F48);
  - unknown or failed on a clean run or on a declared inapplicable case;
  - unknown or verified on a failing case or a changed consumer.

- **testing/F47** [testing/I14]: **Applicability is established, never asserted.** A case is not applicable only where the harness itself established, from the installed manifest, an explicit applicability for it: a nonempty platform scope that excludes the platform it ran on, and a nonempty reason. A verifier that reports a case as not applicable conforms only when it shows that same scope and reason. Otherwise the report is a disagreement, whatever result the verifier claims. So an ordinary skip, a todo, or a verifier's own unsupported claim of inapplicability never becomes verified. A not applicable case stays visible as `not applicable` and is never counted or reported as passed. Applicability here is the package's declared platform scope. Whether a consumer's Change needs that case is Change's question, not package verification's.

- **testing/F48** [testing/I14]: **Neither evasion verifies.** `not applicable` is an accountability outcome, not a platform escape hatch, and the contract guards against both ways a platform can evade a declared case.
  - **Silent omission.** A declared case is left out on an inconvenient platform. Every declared case stays visible in the summary on every platform. A case the runner left out without an established inapplicability is `not run`, and the run is unknown.
  - **Conditional weakening.** A case runs weaker or no meaningful assertions on one platform while reporting GREEN. The declared cases, by identity, are the same on every supported platform: the harness establishes them from the one installed manifest. Only an established applicability (testing/F47) exempts a case on a platform. A stand-in reported under another identity, beside or in place of a declared case, never conforms, and the declared case stays `not run`.
  - **What is observable.** A case that keeps its identity but branches on the platform to weaker assertions is not observable in a verifier's run. Detecting it, by execution or static enforcement, is Engineering's (#641), not this contract's.
  - **The default.** Equivalent case identity and intended assertion strength across supported platforms are the default. A platform-specific fixture is acceptable where the case's identity, its verified requirement and its assertion strength are unchanged. Weakening the verified requirement is not. Hosting is the domain-specific exception, through its own declared applicability.

## Nonfunctional

- **testing/N9** [testing/I14]: The contract is pure. `observe` and `judge` read nothing from a host, run nothing, keep nothing and change no input. Each package's verifier depends on no Testing package, and the contract adds no runtime dependency to any product.
