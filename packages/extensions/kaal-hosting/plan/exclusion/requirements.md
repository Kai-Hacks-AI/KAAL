# Excluded Directories: Requirements

Each Requirement names, in brackets, the Intents it serves.

## Functional

- **hosting/F42** [hosting/I11]: **Excluded directories are not entered.** `read(dir, { exclude })` takes `exclude`, a list of directory names. Below `dir`, at any depth, an entry whose name is exactly one of them and that is a directory, or a link to one (a junction included), is not entered and contributes nothing: no file inside it is read, and no link inside it is followed or refused. The comparison is by the whole name as the host lists it, exact and case-sensitive, so `node_modules_extra` and `Node_Modules` are read. A file, or a link to a file, whose name is in `exclude` is read as usual. `dir` itself is never excluded, whatever its name.
- **hosting/F43** [hosting/I11]: **Everything else is read as before.** Outside excluded directories, `read(dir, { exclude })` returns exactly what `read(dir)` returns for the same files, keyed the same way. Its refusals are unchanged too: a link to a directory that is not excluded is still refused with `INVALID_PATH`, and a missing `dir` still reads as empty. `read(dir)` and `read(dir, {})` behave exactly as `read(dir, { exclude: [] })`, which is today's `read`.
- **hosting/F44** [hosting/I11]: **A wrong exclusion is refused before reading.** `exclude` must be an array. Each entry must be a nonempty string naming one directory entry: not `.` or `..`, containing no `/`, `\` or NUL, and not repeated. Anything else is refused with `INVALID_PATH`, naming the entry, before any file is read. An unknown option is refused the same way, so a misspelled `exlude` cannot read the whole tree unnoticed.

## Limits

- Only `read` gains exclusions. `readFile`, `kind`, `within`, `reconcile`, `update` and `initialize` are unchanged.
- An exclusion names a directory, not a path or a pattern. A caller who needs to drop particular paths filters the result, as today.
- Core switches its installed verifier to the excluding `read` in its own Change, once `hosting/C21` reaches `kaal/core` through `main`.
