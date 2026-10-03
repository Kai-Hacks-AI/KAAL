# kaal-agent (engineering)

The first adapter of the Agent dimension: wire KAAL onto `AGENTS.md`. Agent itself is the sealed Node `Agent`; this directory only realizes it and is not part of `kaal-core`.

`AGENTS.md` points into KAAL and does not reproduce it. The wiring is one KAAL-owned fragment between `<!-- kaal:begin -->` and `<!-- kaal:end -->`, saying where the KAAL directory is. Nothing else in the file is read or touched.

- `npm run wire-kaal-agent [-- --agents <file>] [--kaal <dir>]` establishes the fragment: creates `AGENTS.md` if missing, keeps all other content, replaces an existing fragment in place, so wiring twice gives the same bytes. A malformed fragment is refused and the file left alone.
- `npm run check-kaal-agent [-- --agents <file>] [--kaal <dir>]` exits 0 if the fragment is present and exact and the named directory is a KAAL directory (`core/KERNEL.md` exists), otherwise 1. It never repairs.

Defaults: `AGENTS.md` in the current directory, KAAL directory `.kaal` (relative to the `AGENTS.md`). `npm test` here is the acceptance test, run through the commands themselves.
