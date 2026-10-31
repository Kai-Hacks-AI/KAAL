# Test Locations by Purpose and Owner: Architecture

Each element names, in brackets, the Requirements it answers.

- **testing/A24** [testing/F76, testing/F77, testing/N16]: In `lib/acceptance.mjs`:
  - `SCENARIOS` becomes `test/engineer`;
  - a private `LEGACY`, `test/acceptance`, is read beside it until `testing/C45`;
  - `discover` reads both directories per workspace, in the same way as today, and sorts all of them by path.

  `test/embed/` is never named in the module. Nothing reads `package.json`.

## Ownership

| Who | Owns |
| --- | --- |
| Testing | the locations' meaning and `discover` |
| Each capability | its `test/embed/` cases and its own `npm test` |
| Engineering | its lane, the `test/engineer/` scenarios in each workspace, `engineering/acceptance/`, and the consumer lane that runs embedded cases |

## Migration sequence

The steps run in order where a dependency is named. Every other step runs in parallel, and none holds a 0.0.1 delivery.

| Step | Change | Owner | Depends on |
| --- | --- | --- | --- |
| 1 | `testing/C43` PLAN, this Change | Testing | none |
| 2 | Hosting's hosting/C12 DO (#700) ships its cases in `test/embed/`. Today's `discover` does not read `test/embed/`, so #700 can leave draft at once | Hosting | none |
| 3 | `testing/C44` DO: `lib/acceptance.mjs` and the README; testing/T88–testing/T91 GREEN and in the suite | Testing | 1 |
| 4 | Engineering moves the lane scenarios of `kaal-graph` and `kaal-engineer-skill` from `test/acceptance/` to `test/engineer/`, and decides whether `engineering/acceptance/` moves too | Engineering | 3 |
| 5 | Foundation, Core and Testing ship their cases in `test/embed/`, in their own Changes, such as Testing's `testing/C38` | each | none |
| 6 | Guard moves its shipped cases from `test/acceptance/` to `test/embed/` in its own Change, when Guard chooses, not before 0.0.5. Guard is not a workspace, so the lane never reads them | Guard | none |
| 7 | `testing/C45` PLAN, then its DO: `discover` stops reading `test/acceptance/`. It amends testing/F77 and testing/T90 | Testing | 4, 6 |
