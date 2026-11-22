# hosting/C112 interface

The element texts the DO adds. The PLAN adds none to the tree. Provisional ids, as in `C112.md`.

## Intent

After hosting/I19.

> **hosting/I20.** KAAL code that must scan a normal checkout, with its dependency links and its version-control folder, lists it through Hosting alone, saying which names and which directory links to leave out, with the same result on every supported host and no `node:fs` of its own.

## Requirements

After hosting/F89, in `02-requirements/functional/requirements.md`.

- **hosting/F90** [hosting/I20]: **`list(dir, options)` takes `skip`**: an entry whose name equals one of the listed names, file or directory, at any depth, is neither listed nor entered, and a skipped directory is not read.
- **hosting/F91** [hosting/I20]: **`list(dir, options)` takes `links`**: `'refuse'` (the default) keeps hosting/F72, a link to a directory is refused with `INVALID_PATH`; `'skip'` neither lists nor enters nor refuses it. A link to a file lists as a file either way.
- **hosting/F92** [hosting/I20]: **Without options, nothing changes.** `list(dir)`, `list(dir, {})` and the defaults written out give the same result as before, byte for byte; an option outside the two above is a `TypeError`, thrown before anything is read; the order stays UTF-16 order of the whole relative path.

## Architecture

- **hosting/A40** [hosting/F90 to hosting/F92, hosting/N10]: the options are read once at the top of `list` and passed into `walk`, which decides on each entry before it reads a directory or follows a link; `read` passes none, so its behaviour is untouched. `ListOptions` is exported from `index.ts`; the Skill and its operation guide name the options and say when to use them instead of reading the directory with `node:fs`.
