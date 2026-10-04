# change-seal

Provisional engineering machinery that closes a KAAL Change. It is not shipped, and it is not a Skill; it is the one place that defines a Change's identity.

A Change is the directory `changes/<name>/YY/MM/DD/CC/` of a KAAL directory. Its ID is the SHA-256 of a canonical stream over the whole tree (`helpers/change-id.ts` states the format): relative paths are identity-bearing, only regular files participate, and anything ambiguous (symlinks, empty directories, non-NFC or case-colliding paths, backslashes, control characters) is refused. A Node's identity is unchanged: its bytes alone.

A Change is **closed** when the ID of its current tree has a seal, the empty marker `seals/changes/<Change-ID>` in the KAAL directory, outside the tree it seals. There is no status metadata. Bare `seals/<ID>` markers remain Node seals.

Commands (from the repository root):

- `npm run seal-kaal-change -- changes/<name>/YY/MM/DD/CC`: seal one Change of `.kaal`.
- `npm run list-sealed-changes -- <kaal-dir>`: print `<path> <id>` for each closed Change.
- `npm run check-kaal-changes`: exit 1 if a seal matches no Change, meaning a sealed Change was altered or removed.

This knows nothing of Git, GitHub, CI, branches, commits or pull requests. Repository controls consume `list-sealed-changes`; they do not hash anything themselves.
