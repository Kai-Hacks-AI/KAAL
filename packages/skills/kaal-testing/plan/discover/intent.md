# Acceptance Discovery of Shipped Cases: Intent

This is `testing/C43`, a PLAN Change. It ships no code. `testing/C44` turns its planned tests GREEN.

**What exists.**
- `kaal-testing/acceptance`'s `discover(workspaces)` treats every `*.test.mjs` directly in a workspace's `test/acceptance/` as a lane scenario. A lane scenario runs under `accept()` and must `install()` the run's packed tarballs. One that installs nothing is a verified failure, "installed no packed package".
- Packaging's KAAL Package contract lets a product ship its own consumer cases, and some products ship them in `test/acceptance/`:
  - hosting/A9 and hosting/F19, approved on #629 after Guard's layout;
  - testing/F61 (#669);
  - foundation/F9 and core/F75.
  These cases reach the package by its name and run through the product's own `npm test`, in source and in an installation. They never call `install()`, and a product below Testing cannot: Hosting would then depend on Testing, which depends on Hosting.
- So Engineering's acceptance lane fails on Hosting's hosting/C12 DO (#700) for every shipped case, and it will fail the same way for Foundation, Core and Testing. Guard never met this, because it is not a workspace.

**What Hosting asked.** Hosting asked this thread to plan the rule that `discover()` leaves out a workspace's `test/acceptance/` when the package ships it.

- **testing/I20**: A product's shipped consumer cases are the product's own, run by its own `npm test`. Testing never mistakes them for lane scenarios. Which cases a workspace ships is read from what the package declares it ships, never guessed from a case's contents, and a workspace whose declaration cannot be read keeps today's behaviour.
