# Acceptance Discovery of Shipped Cases: Requirements

Each Requirement names, in brackets, the Intents it serves. They extend `discover` and change nothing else in `kaal-testing/acceptance`.

## Functional

- **testing/F76** [testing/I20]: **Shipped cases are left out.** `discover(workspaces)` gives no scenario for a workspace whose `package.json` has a `files` array with a string entry that ships `test/acceptance/`:
  - `test/acceptance` or `test`;
  - each with an optional leading `./`;
  - each with an optional trailing `/` or `/**`.

  Every other workspace's scenarios are discovered as before.
- **testing/F77** [testing/I20]: **Otherwise, as before.** A workspace keeps its `test/acceptance/*.test.mjs` as lane scenarios when any of these holds:
  - its `package.json` is absent, does not parse, or is not an object;
  - its `files` is absent or not an array;
  - no string entry of `files` matches testing/F76's forms. Examples that do not match: a single file, a sibling directory, another directory under `test/`, and a negated entry.

  A declaration that cannot be read never removes a scenario, so such a scenario still fails the lane as it does today.
- **testing/F78** [testing/I20]: The README's acceptance section states the rule: a workspace that ships `test/acceptance/` in its `files` has no lane scenarios, because its own `npm test` runs those cases.

## Nonfunctional

- **testing/N16** [testing/I20]: `discover`'s signature and result are unchanged: `[{ workspace, path }]`, sorted by path. It still reads through Hosting only and writes nothing. Engineering's acceptance lane needs no change.

## Not in this Change

- Running a product's shipped cases. That is the product's own `npm test`, and Engineering's consumer lane.
- Moving lane scenarios elsewhere, or any capability's own layout.
