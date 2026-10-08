# Architecture

Two packages built from one shape, `kaal-retro`'s. No `kaal-core`, no `.github`, no existing Node, no sealed byte is changed.

**Each package** `packages/kaal-incident`, `packages/kaal-request`:

- `kaal/`: one Node (`KAAL-Incident.md`, `KAAL-Request.md`; names `KAAL Incident`, `KAAL Request`), typed by Core's `Skill` Node by exact ID, and its own seal, written with the Sealing capability's scripts.
- `skills/<capability>/`: an Agent Skill (`SKILL.md`, which points at the Nodes and does not restate them, and says which of the client's own mechanisms it does not govern) and exactly one script, `incident.mjs` / `request.mjs`, offering `write` and `check` only.
- `src/index.ts` with `payload()` only, `test/`, README, MIT licence, its own lockfile, as `kaal-retro`.

**The carrier.** Canonical form, defined once in the script, never written by hand:

```
# KAAL Incident          # KAAL Request
## Happened              ## Wanted
<text>                   <text>
## Expected              ## Missing
<text>                   <text>
```

`write <kaal-dir> --happened <text|@file> --expected <text|@file> [--date YYYY-MM-DD]` refuses a directory with no `core/` (so a mistyped path creates nothing), allocates the next free `CC` of the UTC day exactly as `next-change` allocates Changes (after the highest, no gap reused, refuse at 99), and creates `<kaal-dir>/incidents/YY/MM/DD/CC.md` with `wx`, so nothing is ever replaced. It prints the path relative to the KAAL directory. `check <file>` exits 0 only for exactly the canonical form. The two scripts are the same code with different words; packages are independent, so each carries its own copy.

**Why two texts and these directories.** An Incident differs from a Request in what is asked of the writer: what went wrong against what was expected; what is wanted against what is not there. The kind is stated by the title and by the directory, so a reader never needs the file's name or location to know it. Dated numbering is the convention a KAAL client already knows from changes, and needs no registry.

**Selection and installation** are unchanged: the capability is found by its Node's exact ID and registered through Core's `registerSkill()`. Neither declares a sibling, so neither pulls anything in.

**Installer (engineering only).** `engineering/kaal-install` treats `incidents/` and `requests/` of the KAAL directory as genuine installed state, as it already treats `changes/`: not derived, not read, not touched, not reported. This is the one change outside the two capabilities.

**Engineering.** `engineering/kaal-incident` and `engineering/kaal-request` hold acceptance (delivery, script, host), wired into the root `npm test` by one line each.
