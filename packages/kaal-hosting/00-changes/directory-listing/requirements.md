# Directory Listing and Scratch Directory: Requirements

Each Requirement names, in brackets, the Intents it serves. They extend hosting/F45 to hosting/F48 (the read operations). Where they differ, these win from `hosting/C106`.

## Functional

- **hosting/F72** [hosting/I16]: **`list(dir)`** resolves with every entry below `dir` as `{ path, kind }`: `path` is `/`-separated and relative to `dir`, and `kind` is `file` or `directory`. It is recursive and it includes every directory, empty ones too, so a directory that holds nothing is listed as `directory`; `dir` itself is not listed. The order is by UTF-16 code unit of the path, the same on every host, and a directory is listed before what it holds. A link to a file is listed as `file`, as in `read`. A link or junction to a directory is refused with `INVALID_PATH`, as in `read`, and a name some host cannot hold faithfully is refused as `read` refuses it; nothing is listed from a refused tree. A missing `dir` lists as empty, as `read` does; a path that is a file or something else is refused with `NOT_DIRECTORY`. It takes no lock, and it reads names and kinds only, never bytes.
- **hosting/F73** [hosting/I16]: **`scratch(use)`** creates a fresh, empty directory under the host's temporary directory and calls `use` with its absolute path. `use` may create files and folders in it. When `use` settles, whether it resolved or rejected, Hosting removes the whole tree, including the files `use` left, and resolves with what `use` resolved with or rejects with what `use` rejected with. A failure to remove is reported as `SCRATCH_LEFTOVER`, naming the path; when `use` itself failed, its failure is the one thrown and the leftover is reported on it, never in its place. Two concurrent calls get two different directories.
- **hosting/F74** [hosting/I16]: **Both belong to the main entry.** `list` and `scratch` are exported from `@kaihacksai/kaal-hosting` beside `read`, and are part of its declared interface, so the interface test and the README entry list name them.

## Nonfunctional

- **hosting/N10** [hosting/I16]: The two operations add no runtime dependency and take no `node:test`. They reuse the path and name validation of `read`, so there is one meaning of a portable name, not two.
