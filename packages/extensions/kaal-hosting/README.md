# kaal-hosting

KAAL Hosting is the host-facing KAAL Extension: it enables KAAL to operate within its host environment. This first version provides the filesystem operations KAAL needs, with the same guarantees on Linux, Windows and macOS. It knows paths and bytes only; what the files mean is KAAL Core's concern.

## Guarantees

| Operation | Guarantee |
| --- | --- |
| `read(dir)` | Every file of a tree, keyed by `/`-separated relative path. Hosting's own staging directories are not part of it; a file merely named like one is. A missing directory reads as empty. |
| `update(dir, plan)` | One writer at a time, across processes. `plan` receives the directory as it is and returns the change to make, or nothing. The change is published all or nothing as a new directory: staged, read back to confirm the host holds it exactly, and renamed into place. Any failure leaves the directory as it was. |
| `initialize(dir, files)` | Populates a missing or empty directory as its only writer. A missing directory appears complete or not at all; an existing empty one (the current directory, say) is filled in place, never removed or replaced. Anything else is refused. |
| `contribution()` | Hosting's own Extension Node, `Hosting.md`, for admission by KAAL Core. |

Paths are refused before anything is written when they would not be held faithfully on every supported host: names Windows cannot hold (reserved characters, a trailing dot or space, device names such as `con`), and distinct paths that collapse into one where names are compared without case or Unicode normalization (`A.md` and `a.md`, `café.md` in NFC and NFD). The rule is the same on every host, so what is written on one stays portable to the others.

Writers are serialized with [`proper-lockfile`](https://www.npmjs.com/package/proper-lockfile) (a lock directory beside the target, `<dir>.lock`, with stale-lock recovery). File operations go through [`graceful-fs`](https://www.npmjs.com/package/graceful-fs), which on Windows retries renames blocked by antivirus or indexing.

The API is asynchronous: both guarantees above depend on it.

## License

MIT. See `LICENSE`. The license covers this package's contents only.
