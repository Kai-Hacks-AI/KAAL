# Standalone use of kaal-testing: Intent

This is `testing/C65`, a PLAN Change. It ships no package code and changes no Skill. `testing/C66` (DO, not yet authorized) turns the planned Cases GREEN and records the trial. Provisional ids, renumbered if another Change lands first and takes any of them.

**What is missing.** Kai's decision (11-19): Testing must be a Skill and package that a new consumer can use with "install package, off you go": no KAAL repository, no other KAAL package, no KAAL folder layout. Foundation and Hosting are allowed as dependencies, and a third-party dependency such as `c8` is fine because no KAAL package may force others on its users. Nothing proves this today. Known leaks at `main`: `lib/report.mjs` and the README name Engineering, and the runner (testing/C64, being promoted) names kaal-change and Guard in comments.

- **testing/I41**: A new consumer who installs `kaal-testing` into an empty project, with its declared dependencies and nothing else of KAAL, can run their own tests with it and an agent reading only the installed Skill uses it as intended, without a KAAL repository, another KAAL package or any name from outside the package. Each package keeps its own vocabulary; only names that come from outside it are forbidden.

Principle: a deterministic execution proves it is installed and runs; a judged trial says whether it does what it is for. Neither replaces the other.

**Out of scope.** No change to the Skill's wording or to the controls-level path (steps 1 to 6 of the analysis are not picked), no neutral claim-file format (open decision D1), no baseline arm without the Skill (D2), no npm publication, no promotion. It follows the pattern of controls' N8 and T777, adapted to a package that has dependencies.
