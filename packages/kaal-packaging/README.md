# kaal-packaging

KAAL Packaging: how KAAL's deliverables become packages and what those packages are. This first increment measures a package artifact's delivered size. It is private and not published.

```
capability/Packaging.md      the Capability Node, typed by Core's KAAL Capability
lib/packaging.mjs            measure, attribute, compare, write, read and report: ecosystem-neutral
lib/npm/                     the npm realization: reads an npm package artifact (.tgz)
ownership.kaal.json          Packaging's ownership claim (repository data, not delivered)
plan/                        the PLANs (not delivered)
```

## Interface

```js
import { attribute, compare, measure, read, report, write } from "kaal-packaging";
```

- `measure(artifact, limits)` takes the bytes of a package artifact and returns its `package` (`ecosystem`, `name`, `version` and the artifact's `sha256`), its `packed` size, its `unpacked` size and every file's `path` and `size`, read from the artifact itself, never from a source directory. Paths are relative to the package root. The same bytes give the same measurement on every host.
- `attribute(measurement, groups)` sums the files into the groups the caller names by path prefix. Each file falls in the longest prefix that matches its path, or in `unattributed`, so the groups and `unattributed` add up to the unpacked size.
- `compare(before, after, groups)` gives the change in packed and unpacked size, for each group, and for each path that changed, was added or was removed.
- `write(measurement)` gives a record, and `read(record)` reads it back unchanged or refuses what is not one. A record is machine-owned state. Where it is kept is the caller's choice.
- `report(subject, { format })` renders a measurement or a comparison as `text` or `json`.

## Untrusted bytes and limits

An artifact's bytes are untrusted. Reading one is bounded by `LIMITS`, which `measure`'s second argument narrows or widens: `archive`, the most bytes the archive may decompress to (512 MiB), `files`, the most files (50,000), and `path`, the most UTF-8 bytes in one path (1,024). Decompression stops at the archive limit, before it allocates beyond it, so a decompression bomb is refused, not expanded.

Anything malformed is refused with an `Error` that names the cause. That covers:
- a truncated stream, a CRC-32 or length mismatch, reserved gzip flags, or bytes after the stream;
- an invalid deflate block or back-reference;
- a tar header that fails its checksum, an entry larger than the archive, or a header cut short;
- a path that is absolute, has an empty, `.` or `..` segment or a backslash, or is listed twice;
- a missing or unreadable `package.json`.

Files are only measured, never written, but an unsafe path is refused all the same. `test/reader.test.mjs` covers each case, and runs 400 randomly corrupted archives, each of which must be measured or refused and nothing else. It also checks that the result always adds up.

**Why its own decompressor.** Packaging imports no host module (`packaging/N3`), so `node:zlib` is out. Hosting offers no decompression today. Packaging depends only on Hosting and Foundation (`packaging/A1`), so a third-party library is out too. The reader therefore decompresses gzip and reads tar itself, in plain arithmetic, and every result must match the stream's own CRC-32 and length, so a decoding defect gives a refusal rather than a wrong measurement. The alternative is a bounded `gunzip` in Hosting, for example `node:zlib` with its output limit. That would be a Hosting Change, Packaging would then depend on `kaal-hosting`, and only the tar reading would stay here.

**Its one dependency.** `@kaihacksai/kaal-foundation` supplies SHA-256 (`packaging/N3`). `kaal-hosting` is not declared, because the package performs no host operation: callers pass it bytes. `packaging/A1`'s "Hosting and Foundation only" is the most it may depend on.

## Ecosystems

The measurement and the record name no ecosystem. Reading an artifact's format is an ecosystem realization's, and npm (`.tgz`, a gzip-compressed tar with the package under `package/`) is the first. An artifact no realization reads is refused, naming its format, such as `zip`. A later ecosystem adds a realization. Whether it ships in this package or as its own is decided when it arrives, and no consumer has to depend on more than one package.

## Boundaries

- **It decides nothing.** No budget, threshold or verdict is held or reported. Each product owns its size constraints, and Engineering owns when measurement runs and whether a result gates anything.
- **It produces no package.** Packing stays Engineering's (`engineering/delivery/pack.mjs`) until a later Change moves it.
- **It imports no host module.** It reads the bytes it is given, decompressing them itself within its limits. SHA-256 comes from `@kaihacksai/kaal-foundation`. It depends on nothing else.
- **No product imports it.** Products are measured from outside, so Guard keeps no dependencies.
