# Cross-Platform Inventory Parity: Requirements

Each Requirement names, in brackets, the Intents it serves.

## Functional

- **testing/F56** [testing/I16]: **One candidate, every supported platform, the same cases.** Parity reads one `{ observed, facts }` per run, as testing/F44 observed it and as the harness established it, together with the platforms the package declares it supports (packaging/F12). It holds only when all of these are true:
  - there is exactly one run on each supported platform, and none on another platform;
  - every run is of one candidate: the same package name, version and digest;
  - every run's harness established the same declared cases;
  - at least one case is declared.

  Anything else is a finding, and the runs together are unknown. The same is true of runs that are not a list, no supported platforms, or a supported platform named twice.
- **testing/F57** [testing/I16]: **Every declared case is visible on every platform.**
  - On each platform, each declared case is reported exactly once. A case left out, reported twice or replaced by a stand-in under another identity is a finding, and the case is `not run` there. A reported case that is not declared is a finding.
  - A case is `not applicable` on a platform only where it shows the applicability that the harness established there (testing/F47). Otherwise the claim is a finding, and the case is `not run` there.
  - `not applicable` stays `not applicable` and is never counted as `pass`.
  - A case that is `not applicable` on every supported platform is exercised on none. That is a finding that names it.

  Parity gives each case's outcome on each platform.
- **testing/F58** [testing/I16]: **What the runs establish together.**
  - The runs are **failed** when any platform's run is failed (testing/F50), whatever else is found.
  - Otherwise they are **verified** only when every platform's run is verified, nothing is found, and every case passed or is established not applicable on each platform.
  - Otherwise they are **unknown**. This includes a platform with no observation, and a case on which Engineering's enforcement left an unresolved weakening finding (#641), given as `weakening`, a list of case names.

  A weakening finding never verifies, and it never turns a failure into anything else.

## Nonfunctional

- **testing/N11** [testing/I16]: Parity is pure, as testing/N9 states for the contract: `parity` reads nothing from a host, runs nothing, keeps nothing and changes no input. How each platform is run, and how weakening is detected, are Engineering's (#641).
