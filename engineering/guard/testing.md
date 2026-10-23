# Guard: Testing

Testing owns what evidence means. Guard plans its tests in PLAN for Intent, Requirements and Architecture, before any code, and practises multi-loop TDD in two places. Neither needs Testing or Sealing as a dependency.

## Where the tests live

- **In the package**, `packages/kaal-guard/test/`, using only Node and Git:
  - the outer acceptance tests for the packaged behaviour, in `test/acceptance/`;
  - the inner implementation tests, added in DO beside them.

  They ship with the package, so a consumer can run them.
- **In Engineering**, `engineering/guard/acceptance/`: the outer tests that only make sense in KAAL, namely KAAL's hook and CI integration and External delivery. They may use any KAAL element.

The outer tests start clean RED, failing because the behaviour is missing and for no incidental reason. DO and CHECK cannot change them. The inner tests belong to DO and may evolve.

## Planned outer tests

| Concern | Test | Where |
| --- | --- | --- |
| Intent | I1: one check gives the same verdict through the hook and through CI, for the same facts | package |
| Intent | I2: removing Guard leaves the repository's own tests intact | package |
| Intent | I3: an External delivery works in a fresh repository and leaves nothing from KAAL in it | Engineering |
| Intent | I4: the packed tarball alone runs `init`, a push, the `ci` subset, `upgrade` and `remove` in a fresh repository, and no other KAAL element appears at any step | package |
| Intent | I5: KAAL's own checks run through Guard in its hook and its existing CI jobs | Engineering |
| Requirements | G1 to G10, N2 to N4 | package |
| Requirements | N1: the package's acceptance tests pass on Linux, macOS and Windows | CI matrix, from C1 |
| Requirements | N5: an External delivery is a handful of readable files | Engineering |
| Architecture | the runner knows nothing of the adapters or GitHub; nothing depends on an adapter | package |
| Architecture | the package declares and imports no KAAL element and references no Engineering path | package |
| Architecture | the acceptance boundary is closed: acceptance files import only Node built-ins and files inside their directory | package |
| Architecture | every KAAL check identity and OS matrix entry on `main` before migration is still present after it | Engineering |

Two Architecture tests pass already, because they guard what exists: the closed boundary, and KAAL's check identities. Every other outer test is RED.

## Integrity of the outer contract

The boundary is fixed in PLAN, before DO, with plain Git.

- The effective boundary has two parts, `packages/kaal-guard/test/acceptance/` and `engineering/guard/acceptance/`, each with its tests, fixtures and helpers.
- A boundary check, `Guard Acceptance Boundary`, runs on every pull request into `kaal/guard`, from the target branch's version of itself. A DO Change that touches the boundary fails. A PLAN Change may touch only the boundary. It is C0b, not part of this Change.
- kaal-sealing may later be added as an optional Engineering control over `engineering/guard/acceptance/`. It is never a prerequisite, and the package never uses it.

Who may land a PLAN Change is decided by the repository's review. GREEN means the planned cases passed within their coverage. It is bounded evidence, not proof of the Outcome.

## Running

The outer tests join a lane when Guard's code makes them executable. Until then they are run directly:

```sh
node --test packages/kaal-guard/test/acceptance/ engineering/guard/acceptance/
```
