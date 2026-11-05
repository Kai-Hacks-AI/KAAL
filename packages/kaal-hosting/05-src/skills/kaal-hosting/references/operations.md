# Operation selection and examples

Read the installed Hosting contract for exact inputs, errors and limits. These examples use the package's public identity and existing operations. They are ESM blocks; the example name after `js` lets the delivered tests execute these exact bytes. Each block exports a local `run` example, not a new Hosting API.

## Select the operation

| Need | Existing operation | Boundary to retain |
| --- | --- | --- |
| Read a tree's file bytes | `read(dir)` | Missing tree is empty; directory links are refused, not traversed. |
| List a tree's paths and kinds | `list(dir)` | Files and directories, empty directories included, in one order on every host; no bytes read; a directory link is refused like `read`. Use it, not `read`, when only names matter. |
| Work in a throwaway directory | `scratch(use)` | `use` gets a fresh absolute path; the whole tree is removed when `use` settles. A removal failure is `SCRATCH_LEFTOVER`; `use`'s own error is never replaced. |
| Read one file | `readFile(path)` | Missing is an error, not empty bytes. |
| Inspect a path's kind | `kind(path)` | Preserve directory/file/missing/other and inspection errors. |
| Check canonical containment | `within(root, candidate)` | Both must resolve; this is not physical containment or a lock. |
| Populate a missing or empty directory | `initialize(dir, files)` | Existing nonempty content is refused. |
| Publish a whole directory | `update(dir, plan)` | The callback sees current files under Hosting's writer lock; this is not per-file reconciliation. |
| Guard changes in an existing directory | `reconcile(root, plan)` | Supply expected bytes' digest or `absent`; preserve stale/rollback/recovery outcomes. |
| Run an installed command | `execute(command, args, { cwd, env })` | Arguments are an array, no shell interpretation; preserve status and streams. |
| Run an installed command, synchronously | `executeSync(command, args, { cwd, env, input, timeout })` | As `execute`; a signal or timeout is `status: null`; standard input is closed unless `input` is given. |
| Decide how a command starts | `startPlan(command, args)` | `npm` and `npx` start without `cmd.exe` on Windows; `NO_DIRECT_START` when that is impossible, `viaShim` to accept the shim openly. |
| Isolate a process from the user's configuration | `isolatedEnvironment(dir)` | Private home, config and npm cache under `dir`, set over `base`; pass the result as `env`, which is the child's whole environment. |
| Build a disposable fixture once | `prepare(build, { exclude })` | `copy()` gives each Case an independent copy; `dispose()` removes all. |
| Obtain Hosting's Extension Node | `contribution()` | Core owns meaning and admission; this only supplies the payload. |

`read(dir)` currently has no exclusion option. Filtering `node_modules` after a read cannot prevent a directory link there from being refused. Report the resulting limitation; do not promise linked-dependency verification or implement traversal in the consumer to conceal it.

## Authority for writer machinery

Before calling a writer, confirm authority for its canonical target and documented sibling machinery: `<canonical-root>.lock`, `<canonical-root>.staging-*` and `<canonical-root>.aside-*`. A task that authorizes writes strictly inside root must be held for missing footprint authority before any mutation. The library does not infer authority or enforce that instruction. Permission to use this machinery permits only the requested operation; unrelated siblings remain outside the change. Preserve `kept` originals and reported `leftovers` pending a separately authorized recovery or cleanup decision.

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
