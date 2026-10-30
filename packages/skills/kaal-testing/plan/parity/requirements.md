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
  - Otherwise they are **unknown**. This includes a platform with no observation, a violation of testing/F67, and a case with an unresolved challenge finding. The challenge findings come from Hosting's cross-capability suite and review, or from Engineering's enforcement (#641), and are given as `challenged`, a list of case names.

  A challenge finding never verifies, and it never turns a failure into anything else.
- **testing/F67** [testing/I16]: **Only the operating-system boundary scopes a case by platform.**
  - Hosting is the only KAAL capability in which operating-system-specific behaviour is acceptable, in its solution and in its tests. Every other capability stays OS-agnostic.
  - A case exempted on a platform by a platform scope (testing/F47 `platforms`) is an exemption only where the harness established that the package is the operating-system boundary, given as `osBoundary: true`.
  - In any other package, a platform scope is an **architectural violation**, never an exemption. It is a finding that names the case and the platform scope. The case is `not run` on each platform where it claimed the exemption, and the runs are unknown.
  - Whether a package is the boundary is established, never assumed. A value other than `true` or `false` is a finding.
  - An applicability by optional complement (`requires`, `absent`) stays open to every package. It depends on what the consumer installed, not on the operating system.
  - Testing authorizes no operating-system exception. Which capability is the boundary is Hosting's architectural rule. Testing only refuses to count a platform scope outside it as evidence.

## Nonfunctional

- **testing/N11** [testing/I16]: Parity is pure, as testing/N9 states for the contract: `parity` reads nothing from a host, runs nothing, keeps nothing and changes no input. How each platform is run is Engineering's (#641). Detecting operating-system-specific implementation, assertions, test selection and applicability outside Hosting is Hosting's suite and review guidance, run by Engineering.
