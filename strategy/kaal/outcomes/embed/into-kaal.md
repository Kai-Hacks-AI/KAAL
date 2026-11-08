---
name: "EMBED 2.2: Into KAAL"
kind: Outcome
direction: EMBED
owner: KAAL
---

# EMBED 2.2: Into KAAL

KAAL consumes its own published capabilities. Today `main` uses workspaces from source; installing the published packages into `.kaal` has no PLAN yet.

Open questions (undecided, recorded not resolved): who installs; `.kaal` versus `node_modules`; fit with the pin ratchet (pins may lag, a bump flags "pin-behind", hard stop only at a declared floor).

## Relations

- Part of: [EMBED](../embed.md)
- Needs: published packages to install (the relevant releases of item 1 in the [Roadmap](../../roadmap/Roadmap.md))
- Sequenced as: item 3 in [Roadmap](../../roadmap/Roadmap.md)
