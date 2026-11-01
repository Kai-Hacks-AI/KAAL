# Operation selection and examples

Read the installed Hosting contract for exact inputs, errors and limits. These examples use the package's public identity and existing operations. They are ESM blocks; the example name after `js` lets the delivered tests execute these exact bytes. Each block exports a local `run` example, not a new Hosting API.

## Select the operation

| Need | Existing operation | Boundary to retain |
| --- | --- | --- |
| Read a tree's file bytes | `read(dir)` | Missing tree is empty; directory links are refused, not traversed. |
| Read one file | `readFile(path)` | Missing is an error, not empty bytes. |
| Inspect a path's kind | `kind(path)` | Preserve directory/file/missing/other and inspection errors. |
| Check canonical containment | `within(root, candidate)` | Both must resolve; this is not physical containment or a lock. |
| Populate a missing or empty directory | `initialize(dir, files)` | Existing nonempty content is refused. |
| Publish a whole directory | `update(dir, plan)` | The callback sees current files under Hosting's writer lock; this is not per-file reconciliation. |
| Guard changes in an existing directory | `reconcile(root, plan)` | Supply expected bytes' digest or `absent`; preserve stale/rollback/recovery outcomes. |
| Run an installed command | `execute(command, args, { cwd, env })` | Arguments are an array, no shell interpretation; preserve status and streams. |
| Obtain Hosting's Extension Node | `contribution()` | Core owns meaning and admission; this only supplies the payload. |

`read(dir)` currently has no exclusion option. Filtering `node_modules` after a read cannot prevent a directory link there from being refused. Report the resulting limitation; do not promise linked-dependency verification or implement traversal in the consumer to conceal it.

## Initialize and read back

Choose a missing or empty, authorized scratch root. A sibling file is not part of the requested change. `text` is UTF-8 input; Hosting accepts exact `Buffer` bytes.

```js hosting:initialize-read
import { initialize, read, readFile, kind, within } from "@kaihacksai/kaal-hosting";
import { join } from "node:path";

export async function run({ root, text }) {
  const created = await initialize(root, { "welcome.md": Buffer.from(text) });
  return {
    created,
    text: (await readFile(join(root, "welcome.md"))).toString("utf8"),
    paths: Object.keys(await read(root)).sort(),
    kind: await kind(root),
    within: await within(root, root),
  };
}
```

## Reconcile a guarded file

The caller supplies `expect`, the standard SHA-256 of the exact previously read bytes, or `absent` for an expected absence. Use the consumer's existing digest provider; do not guess it from text that was normalized. `root` must already be a directory. The example deliberately lets a rejection reach the caller; it does not re-read and overwrite after a stale result.

```js hosting:reconcile
import { reconcile } from "@kaihacksai/kaal-hosting";

export async function run({ root, path, expect, text }) {
  return await reconcile(root, {
    write: [{ path, expect, bytes: Buffer.from(text) }],
    remove: [],
  });
}
```

For multiple writes, removals or unchanged dependencies, use the declared `write`, `remove` and optional `expect` lists in the installed contract. Never use `update` as a workaround for a stale file guard.

## Run a command and preserve its result

Supply an installed command (name on PATH or explicit path), an argument array and an authorized working directory. A nonzero status is returned unchanged. A failure to start rejects; preserve that error separately and do not silently retry an operation with uncertain effects. Validate command intent with the consumer before execution; these instructions grant no authority to run arbitrary commands.

```js hosting:execute
import { execute } from "@kaihacksai/kaal-hosting";

export async function run({ command, args, cwd, env }) {
  return await execute(command, args, { cwd, ...(env === undefined ? {} : { env }) });
}
```

## Preserve recovery evidence

After a refused plan or `STALE`, leave the root as it is and retain findings. A new authorized plan is a new decision, not an implicit retry.

On an observed apply failure, distinguish an original failure after successful rollback from `UNRESTORED`, where rollback also failed. For `UNRESTORED`, retain the recovery directory named by `kept` and the original `cause`. The root may be partial; do not claim restoration or remove the originals before their owner has an authorized recovery plan.

`leftovers` reports cleanup failure after the apply/rollback outcome was determined. Preserve every path and error. Do not hide it, delete kept originals or infer a different apply result from cleanup failure. Crash and uncooperative-writer limits still apply. Escalate through PREACH when the next action needs authority or judgment you do not have.
