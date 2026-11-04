# Excluded Directories: Architecture

Each element names, in brackets, the Requirements it answers.

- **hosting/A20** [hosting/F42, hosting/F43, hosting/F44]: `read`'s existing walk in `src/index.ts` takes the validated set of excluded names. It checks each entry's name against that set before it descends into a directory or stats a link, so an excluded entry is never opened or followed. The options are validated once, before the walk starts. `read`'s signature stays compatible: the second argument is optional, and the `.` export gains no new name, so hosting/A15's interface does not change.

## Options considered

| Option | What happens | Cost |
| --- | --- | --- |
| **A. Excluded directory names on `read`** (proposed) | One optional argument. The walk never enters a named directory, at any depth. | A name, not a path: excluding one particular `node_modules` but not another needs a filter afterwards. |
| B. A predicate `skip(path)` | The caller decides per path. | A function crosses the boundary, it cannot be validated up front, and every caller reimplements the same rule. |
| C. Follow or tolerate directory links everywhere | `read` would stop refusing directory links. | It reverses, for every caller, `read`'s rule that Hosting never reads through a link to a directory, the rule its README states and reconciliation shares (hosting/F5). |

## Change graph

| Change | Owner | Depends on |
| --- | --- | --- |
| `hosting/C20` PLAN: I11, F42–F44, A20; hosting/T49–T52 | Hosting | the Owner's request on #675 |
| `hosting/C21` DO: the `exclude` option, its README row, and hosting/T49–T52 in Hosting's `npm test` | Hosting | `hosting/C20` |
| Core's installed verifier reads with `exclude: ["node_modules"]` | Core | `hosting/C21` through `main` |
