# Directory Listing and Scratch Directory: Intent

This is `hosting/C104`, a PLAN Change. It states what Hosting 0.0.1 must provide so that Packaging's structure checker (packaging/C24) and any other capability can list a package's directories, empty ones included, and build into a scratch directory, without using the operating system's file API itself. It ships no code. A RED Change (`hosting/C105`) and a DO Change (`hosting/C106`) follow.

On 4 Nov 2026 the Owner ruled (option A) that Hosting 0.0.1 gets a directory-listing operation now, as its own Change on the critical path, that it must also see empty directories, and that it removes the structure checker's two uses of `node:fs`: the listing, and the scratch directory for reproducibility builds. Hosting is the one capability that touches the host file system (hosting/I10, hosting/I12); a checker that lists directories or makes a temporary directory itself would put host knowledge outside Hosting.

Packaging confirmed the interface (4 Nov): `{ path, kind }` is enough per entry, with no size or mode; a link to a directory stays refused with a readable `INVALID_PATH`, which the checker reports as unknown; the scratch operation hands the caller an absolute path, the caller may create subfolders in it, and cleanup removes the whole tree.

## Intended outcome

- **hosting/I16.** KAAL code that needs to see what a directory tree holds, which directories exist even when they are empty, and to work in a throwaway directory, does so through Hosting alone, with one meaning on every supported host and no cleanup left to the caller.

## Not in this Change

A change to `read`, `readFile`, `kind` or `within`; entry fields beyond `path` and `kind`; following links to directories; any promotion or publication.
