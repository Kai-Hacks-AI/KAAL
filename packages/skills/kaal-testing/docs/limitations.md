# kaal-testing: Limitations

These are the bounds of what kaal-testing shows. Each follows from the [Requirements](requirements.md) and [Architecture](architecture.md), and none is a defect.

- **A clean result shows only what its checks cover.** GREEN is bounded evidence, not proof of the outcome. A passed Case shows that its assertions held in its Run, and that it bears on its target remains an inference (testing/I5).
- **Testing interprets evidence and never produces or authenticates it.** A boundary verdict counts only with its trust authority's attestation (testing/F19, testing/F20). Without it, the result is unknown.
- **Observed evidence is not durable.** What `accept` observed exists only in the process that ran it. Another process, a later job or another machine cannot reuse it. To classify again, run again (testing/A5).
- **Testing keeps nothing.** It keeps no Run, no acceptance, no registry of tests, findings or lessons, and fixes no retention. A consumer that wants history keeps its own Runs and hands them in (testing/F33, testing/N15).
- **Testing decides no gate.** It classifies and evaluates against the policy and the FAR decisions a caller hands in. Which gate blocks what is Engineering's, and the authority to accept is Change's (testing/I3).
- **A consumer's result is its own.** A consumer verification shows that the installed product behaved as its contract states in that one run. It is not evidence Testing observed, and the same installation does not promise the same outcome on a later run (testing/F15, testing/F17).
- **Coverage is evidence of executed code, not of correctness.** No percentage is required.
- **Operating-system-specific behaviour is out of scope.** It is Hosting's alone, in solutions and in tests. Testing authorizes no platform exemption, and a case scoped by platform outside Hosting is a violation (testing/F67).
- **Conditional weakening is not observable in a run.** A case that keeps its identity but branches on the platform to weaker assertions cannot be seen in a verifier's result. Detecting it is the publisher's static enforcement and Hosting's challenge (testing/F48).
- **Runtime dependency.** The library makes every command, read and write through Hosting, so it installs `@kaihacksai/kaal-hosting` with every installation (testing/F59). `@kaihacksai/kaal-testing/model` and `@kaihacksai/kaal-testing/verifiers` import nothing, but npm has no per-export dependency, so a consumer that uses only them still installs Hosting.

Timing evidence uses only the durations supplied. It does not establish comparable environments, candidate identity, a root cause or a suitable redesign. A uniformly slow run may have neither concentration nor outliers. Thresholds are heuristics, and a platform difference alone does not establish a Hosting defect.
