# Test Locations by Purpose and Owner: Intent

This is `testing/C43`, a PLAN Change. It ships no code. `testing/C44` turns its planned tests GREEN.

**What the Owner set.** Kai's review of this PLAN on #702 (comment 6543551316) replaced its first revision, which inferred a case's role from `package.json` `files`:
- `test/acceptance/` is ambiguous;
- **`test/embed/`** holds the product capability's own shipped cases, run against the independently installed package by its `npm test`;
- **`test/engineer/`** holds Engineering's scenarios for building, packing, installing and delivering the package, including the lane's `install()` obligation;
- there is no `test/external/` KAAL convention, because what KAAL is used for in another repository belongs to that repository and its own test model;
- Testing must not derive a case's role or ownership from `files`, which says what npm packs, not what a case means;
- these are locations, not new Testing kinds. Case, Suite, Plan, Run and their traces stay as they are;
- the migration from `test/acceptance/` is bounded, does not needlessly hold 0.0.1 deliveries, and is sequenced explicitly.

**What exists.**
- `discover(workspaces)` reads every `*.test.mjs` directly in a workspace's `test/acceptance/` as a lane scenario. A lane scenario must `install()` the run's packed tarballs, and one that installs nothing is a verified failure.
- Lane scenarios live in two workspaces: `kaal-graph` and `kaal-engineer-skill`, one each. Engineering's lane also reads `engineering/acceptance/`.
- Guard ships its own cases in `test/acceptance/`. Guard is not a workspace, so the lane never reads them.
- Hosting's hosting/C12 DO (#700, a draft) puts its shipped cases in `test/acceptance/`, so the lane fails for each of them. Foundation (foundation/F9), Core (core/F75) and Testing (testing/F61) plan the same.

- **testing/I20**: A test's location says its purpose and its owner, mechanically. A capability's own shipped cases are its own and are never lane scenarios. Engineering's scenarios are Engineering's lane. KAAL sets no convention for another repository's tests. No location is a Testing kind, and no case's role is read from what a package happens to pack.
