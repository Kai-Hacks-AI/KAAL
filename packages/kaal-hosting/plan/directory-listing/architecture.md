# Directory Listing and Scratch Directory: Architecture

Each element names, in brackets, the Requirements it answers.

- **hosting/A32** [hosting/F72, hosting/N10]: `list` lives in `src/index.ts` beside `read` and shares its tree walk. `read` walks a tree, keeping the files and, for `reconcile`, noting every directory it meets; `list` reuses that walk and keeps every entry, so a refusal (a link to a directory, a name a host cannot hold) is decided once, in one place, for both. The walk is the only code that asks the host what a directory holds. `list` returns names and kinds, so it never opens a file.
- **hosting/A33** [hosting/F73, hosting/N10]: `scratch` lives in `src/index.ts`. The directory is made with the host's own temporary-directory call, with a unique name, and removed in a `finally` block so a rejecting or throwing `use` is cleaned up as a resolving one is. Removal uses Hosting's own `rm` with retries, the one `reconcile` uses for its staging directories, so a host that briefly locks a file (an antivirus or indexer on Windows) is retried. A removal failure is thrown as `SCRATCH_LEFTOVER` with the path, attached to `use`'s own error when there is one. The `HostingError` code union gains `NOT_DIRECTORY` and `SCRATCH_LEFTOVER`, documented with the others.
- **hosting/A34** [hosting/F74]: both are exported from the main entry and added to the interface table of `plan/interface/architecture.md`, the README entry list and the intent test's export list, in the DO Change. The `kaal-hosting` skill's operation list names them, with when to use `list` rather than `read`.

## Change graph

| Change | Owner | Depends on |
| --- | --- | --- |
| `hosting/C104` PLAN: I16, F72–F74, N10, A32–A34; hosting/T129–T133 | Hosting | the Owner's ruling A of 4 Nov |
| `hosting/C105` RED: the planned outer tests, one file | Hosting | C104 |
| `hosting/C106` DO: `list`, `scratch`, interface, docs | Hosting | C105 |
| Packaging's C24 structure checker switches to `list` and `scratch` | Packaging | C106 |
| Layout migration, ledger re-derive, freeze, SYNC, #1030 refresh | Hosting, Engineering | all Hosting Changes landed |
