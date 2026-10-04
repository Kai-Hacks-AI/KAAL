# kaal-agent (engineering)

The first adapter of the Agent dimension: wire KAAL onto `AGENTS.md`. Agent itself is the sealed Node `Agent`; this directory only realizes it and is not part of `kaal-core`.

The chain is `host AGENTS.md → .kaal/AGENTS.md → KAAL Nodes`. `AGENTS.md` points explicitly at the KAAL directory's `AGENTS.md` and does not reproduce KAAL; `AGENTS.md` is the KAAL-side entrypoint (carried by the `kaal-core` payload; the acceptance test deploys the real one) and the meanings stay in the Nodes. The wiring is one KAAL-owned fragment between `<!-- kaal:begin -->` and `<!-- kaal:end -->`: `KAAL is available at .kaal/. Read .kaal/AGENTS.md to use it.` Nothing else in the file is read or touched.

- `npm run wire-kaal-agent [-- --agents <file>] [--kaal <dir>]` establishes the fragment: creates `AGENTS.md` if missing, keeps all other content, replaces an existing fragment in place, so wiring twice gives the same bytes. A malformed fragment is refused and the file left alone.
- `npm run check-kaal-agent [-- --agents <file>] [--kaal <dir>]` exits 0 if the fragment is present and exact and the named directory contains `AGENTS.md`, otherwise 1. It never repairs.

Defaults: `AGENTS.md` in the current directory, KAAL directory `.kaal` (relative to the `AGENTS.md`). `npm test` here is the acceptance test, run through the commands themselves.
