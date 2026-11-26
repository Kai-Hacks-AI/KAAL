# C112 baseline

The baseline is `main`.

- `list(dir)` (hosting/F72, `05-src/skills/kaal-hosting/scripts/index.ts`) resolves with every file and directory below `dir` as `{ path, kind }`, in UTF-16 order of the whole relative path. It shares `read`'s `walk`: a link to a directory is refused with `INVALID_PATH`, a link to a file lists as a file, a missing `dir` lists as empty, a path that is not a directory is `NOT_DIRECTORY`.
- It takes no options. Its signature is `list(dir: string)`.
- Existing Cases of `list`: `04-test/engineering-check/publisher/directory-listing.test.mjs` (T134, T136), the planned Cases of hosting/C106, and `04-test/engineering-check/plan/directory-listing.test.mjs`.
- On a checkout, `node_modules` holds links to directories (npm workspaces), so `list(<checkout>)` rejects `INVALID_PATH`.
