# Foundation pin ratchet

foundation/C19 PLAN (provisional number). Amends foundation/C17 (the pin transition, #848); it replaces
I11's "one copy" invariant, and nothing else of C17, with a visible signal.

- **foundation/I13**: A consumer may stay on an older published Foundation. When Foundation's version moves,
  every consumer still on an older pin is flagged "fix soon": a visible signal, not a failure. A flag becomes a
  stop only for a version Foundation itself declares a required floor, or when the consumer is promoted or
  published (an Owner ask, never an automatic block).

## Why

C17 (I11) required every consumer to pin the workspace version and forbade any nested Foundation copy, so each
Foundation bump forced a coordinated transition: three pin Changes, a lock derived twice, two ledger entries.
Observed on #838 (71878ef): `npm install --package-lock-only` already gives a lock that `npm ci` accepts, with
registry 0.0.1 copies nested under Core, Change and Testing. Only the single-copy assertions refuse it
(`engineering/acceptance/embed.test.mjs:167`, and the C17 negative case "a consumer left on 0.0.1 must fail").

## Source

Kai, 8 Nov: consumers may stay on an older Foundation conceptually; a Foundation version bump is a "ratchet"
pressure point that flags every consumer for "fix soon".

## Not decided here

The Owner decides whether I11 is replaced by I13 (a reversal of the C17 Owner decision). No pin, lock,
assertion or product byte changes in this PLAN. Core, Change, Testing and Engineering own their parts below.
