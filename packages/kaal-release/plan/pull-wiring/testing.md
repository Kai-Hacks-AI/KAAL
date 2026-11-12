# Pull Promotion wiring: Testing (target)

One runnable Case, `T14.red.mjs`, unwired, so CI stays green. It fails because the command does not exist (RED). Run by hand on the Owner's device with the signed-in host reader: `KAAL_LIVE=<owner/repo> KAAL_COLLECTOR=<collector> node -e "import('./T14.red.mjs').then(m => m.run())"`.

| Case | Requirement | What it shows |
| --- | --- | --- |
| pull/T14 | F14 | The connected path on the real repository: the command reads the host, prints the verdict of one real collector with owners and missing evidence, changes no open piece, and an unreadable host fails naming what could not be read. Run by hand on the Owner's device; not in CI. |
