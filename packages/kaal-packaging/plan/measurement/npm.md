# Package size measurement: npm evidence

> Evidence for `packaging/A6`, gathered for the Owner's review of `packaging/C3` (#616) on 2026-10-29. It asks what `npm pack` reports for an artifact that already exists, across the npm versions KAAL runs, and where that report can and cannot be trusted. Each finding below is observed, with the npm versions it was observed on. `packaging/C2`'s tests (`packaging/T11`–`packaging/T14`) turn the ones Packaging relies on into cases.

## How it was gathered

- **npm versions.** 10.9.9, 11.3.0 (bundled with Node 24.0.0), 11.4.0, 11.6.0, 11.8.0, 11.10.0, 11.11.0, 11.12.0, 11.12.1, 11.13.0, 11.14.1, 11.15.0, 11.16.0, 11.17.0, 11.18.0, 11.19.1 (bundled with Node 24.22.1), 11.21.0 (Guard's release pin) and 11.21.1, the latest. All were run on Node 24.22.1 on Linux.
- **Artifacts.** Guard's published `0.0.4` tarball, and 15 tarballs built byte by byte, one per question below.
- **The command** is the one in "The command" below. The working directory was empty, unless the finding says otherwise.

## What npm reports for an existing tarball

- **It describes the tarball's contents.** It does not repack them. For Guard `0.0.4`, every version reports `size` 115661 and `unpackedSize` 479822 across 35 files, which are the values `guard/C117` recorded. Its `shasum` equals the SHA-1 of the file. The whole JSON output is byte-identical on 10.9.9, 11.3.0, 11.12.1, 11.21.0 and 11.21.1.
- **It applies no packing rules.** A tarball whose `package.json` has `files: ["a.txt"]`, and which carries `b.txt`, a `.npmignore` that excludes `c.txt`, `c.txt` itself, `.git/HEAD`, `.npmrc` and `node_modules/x/index.js`, is reported with all eight files. So the report is what the artifact delivers, not what packing the same sources would deliver now.
- **Its output has a fixed shape.** It is one array element with `id`, `name`, `version`, `size`, `unpackedSize`, `shasum`, `integrity`, `filename`, `files` (`path`, `size`, `mode`), `entryCount` and `bundled`. `unpackedSize` is the sum of the files' sizes, and `entryCount` is their number.
- **`bundled` is not reliable.** It lists every top-level directory under `node_modules/`, even without a `bundleDependencies` entry. Packaging ignores it.

## Where npm's report cannot be trusted

**Paths.** npm drops the first path segment, whatever its name (`other/a.txt` is reported as `a.txt`). It reports the rest exactly as the tar header holds it, with no normalization and no refusal. On every version:

| In the tarball | Reported as |
| --- | --- |
| `package/../evil.txt` | `../evil.txt` |
| `/etc/evil.txt` | `/etc/evil.txt` |
| `package/./a.txt` | `./a.txt` |
| `package//b.txt` | `/b.txt` |
| `package/a\b.txt` | `a\b.txt` |
| `package/a.txt` twice | `a.txt` twice, both sizes counted |
| a symbolic link | nothing: the entry is left out |
| a directory entry `package/` | an empty path, size 0 (observed on 11.19.1 while writing `packaging/T11`; npm packs no directory entries) |

A dry run writes none of these files. Packaging still refuses every one of these paths (`packaging/N4`) and does not normalize them, so a recorded path is always the path npm reported.

**Resources.** npm is not a bounded reader:

- **Up to npm 11.17.0, a decompression bomb is expanded in full.** On 11.3.0, a 2 MB tarball holding 2 GiB of zeros was reported after 81 s, at 2.2 GiB peak memory.
- **From 11.18.0, npm refuses a tarball that decompresses more than 1000 times its size**, with exit 1 and `TAR_ABORT`. 10.9.9 has the same limit.
- **Every version holds the whole unpacked content in memory.** A 256 MiB tarball of random bytes, compression ratio about 1, peaked at 646 MiB on 11.21.1 and at 868 MiB on 11.3.0.

So on every version, the memory npm uses grows with the artifact. From 11.18.0, the 1000-times limit at least caps that growth relative to the artifact's packed size.

**Side effects.** A dry run of a tarball still writes it into npm's cache (`_cacache`), writes a debug log, and stamps the update notifier. `--cache <dir>`, `--logs-max=0` and `--no-update-notifier` keep all of this inside the working directory. With them, nothing outside it was written.

## The argument

- **npm decides what an argument is by its form.**
  - A bare name, such as `semver` or `noext`, is a registry package. `--offline` fails it with `ENOTCACHED`, but with that package in the cache npm would describe the registry package instead.
  - An absolute or `./` path without a tarball extension is a directory (`ENOTDIR`).
  - Only a path ending in `.tgz`, `.tar.gz` or `.tar`, in any case, is read as a tarball.
- **An argument that begins with `-` is an option.** A file named `--dry-run=false`, passed bare, made npm attempt a real pack of the working directory. With `--` after the options, `-x.tgz` is read as a file on every version tested.
- **Shell metacharacters reach npm unchanged.** A path containing a space, `&`, `;` and `$(x)` is described correctly. Hosting's `execute` uses no shell. Its own test ("runs an installed package's command with its arguments exactly as given") passes `%PATH%`, `$HOME`, `&`, `|`, `^`, `<in>`, quotes and backslashes through an npm `.cmd` shim unchanged, and it runs in Hosting's Windows, Linux and macOS lanes.
- **Configuration does not override the flags.** A working directory with `.npmrc` setting `dry-run=false`, `ignore-scripts=false` and `json=false`, and environment variables `npm_config_dry_run=false` and `npm_config_ignore_scripts=false`, changed nothing: the flags on the command line win.
- **No lifecycle script runs.** This holds for a tarball's `prepack`, `prepare` or `postpack` scripts, and for the working directory's own `prepack`, even without `--ignore-scripts`. Packaging passes `--ignore-scripts` all the same.

## Failures

Each of these exits non-zero and writes `{"error": {"code", "summary", "detail"}}` to stdout. The codes are the same on every version tested, except `TAR_ABORT`, which needs 11.18.0 or 10.9.

| Artifact | Exit | `code` |
| --- | --- | --- |
| not gzip (a zip) | 1 | `TAR_BAD_ARCHIVE` |
| gzip cut short | 251 | `Z_BUF_ERROR` |
| no `package/package.json` | 254 | `ENOENT` |
| `package.json` not JSON | 1 | `EJSONPARSE` |
| decompresses more than 1000 times its size | 1 | `TAR_ABORT` |
| bare name, not cached | 1 | `ENOTCACHED` |
| path without a tarball extension | 236 | `ENOTDIR` |

When npm is not installed, Hosting's `execute` rejects with `ENOENT`.

## What `packaging/A6` takes from this

- **The command:** `npm pack --dry-run --json --ignore-scripts --offline --cache <work>/cache --logs-max=0 --no-update-notifier --userconfig <work>/npmrc -- <artifact>`. It runs through Hosting's `execute`, in an empty working directory the caller gives (`<work>`), with arguments as an array. `--userconfig` names a file that does not exist, so the user's own npm configuration is not read.
- **The artifact location must be absolute and end in `.tgz`, `.tar.gz` or `.tar`.** Anything else is refused before npm runs, because npm would read it as something else.
- **The tool version is recorded as `npm --version` prints it.** It is run the same way, just before the pack, and accepted only when it is a semantic version. Below 11.18.0 it is refused, because those versions expand a decompression bomb in full.
- **Bytes stay Packaging's own.** The artifact is read through Hosting's `readFile` before npm runs and again after. Its SHA-256 must not change, and npm's `size` must equal its length. Otherwise `measure` refuses, because npm may have described other bytes.
- **Refusal on failure.** A non-zero exit is refused, naming npm, its version, the exit status, and npm's `code` and `summary`, cut to 200 characters. So is an output that is not exactly one element of the shape above, whose `unpackedSize` is not the sum of its files, or whose `entryCount` is not their number.
- **Output is bounded after the fact.** Hosting's `execute` collects all of stdout. Packaging refuses an output longer than its limits allow, which is the file limit times the path limit plus a fixed margin. A bound that stops the tool while it runs would be a Hosting Change, which `packaging/C3` does not propose.
- **Artifacts of known provenance.** npm's memory grows with the artifact. Hosting can bound neither its time nor its memory today. So `measure` is for artifacts whose producer the caller trusts, such as a tarball its own job has just packed, which is how Engineering's driver uses it (`packaging/A2`). Measuring an untrusted artifact needs a bounded execution: a time limit and an output limit in Hosting, and a memory limit no host-neutral mechanism gives today. That is the Owner's decision, below.
