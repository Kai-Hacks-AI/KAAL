# Evidence

## Acceptance (`engineering/kaal-install`, `npm test`)

New tests, each on a host that is not this repository (a README and an AGENTS.md of its own):

- a non-KAAL repository becomes an installed, composed KAAL: `--select` Changing KAAL and Sealing by exact ID, Core's `installedSkills()` reports them, `check-kaal-install` is clean, Agent Skills are projected, `wire-kaal-agent` and `check-kaal-agent` pass with the host's own AGENTS.md content kept, nothing else of the host is written, and the installed `next-change` and `change-state` run in the host;
- selection is one-time: installing again without it reproduces the same bytes; selecting what is installed is a no-op; no list, lock file or registry exists;
- missing dependency: selecting `kaal-changing` alone exits 1, names Sealing's exact Node ID, and writes nothing (not even `.kaal`); with both IDs it succeeds;
- a hand-registered `kaal-changing` without Sealing is reported by `check-kaal-install` and not made to look installed by `install-kaal`;
- a name, an unknown ID and a Node that is not a Skill are refused, writing nothing;
- `list-kaal-capabilities` lists exact IDs and selects nothing.

Review round 02 (two P2 findings) added: the same declaration as a folded scalar, a literal scalar, a quoted scalar and over several lines cannot bypass composition (install refuses with nothing written; with both IDs the unmet set is empty); and a declared need whose delivery is unavailable (its package absent, or present without a built payload) stays unmet, is refused before any write and is named by `check`, with a message saying that no exact Node ID exists to select. A declaration naming only Core's package, or nothing, needs nothing (`kaal-engineering`, `kaal-retro`).

One existing test installed `kaal-changing` alone to show that only installed Skills are delivered; it now uses `kaal-retro`, which needs no sibling.

## Scratch clone of Kai-Hacks-AI/Enercon (not pushed; its remote was removed from the scratch copy)

Enercon at `d17de5d` (one README). Run from this repository, `<enercon>` is the scratch clone:

```
$ npm run list-kaal-capabilities -- --into <enercon>
Skill	kaal-changing	Changing KAAL	7b2470732033e9ca6e916cf1ff7d73629bd203737aaf1894a9d621b517e896c2	not installed
Skill	kaal-engineering	Engineering Skill	fa393cb5ac37237c944e62874b8b8cc328d3ef93450a18a79421761d8e2de200	not installed
Extension	kaal-github	GitHub	a97d0d989a2f134b2dfa26d1b4cca61d0b7cb17a4781ecefb17ab9464b03a59c	not installed
Skill	kaal-retro	Retro	01576bf0db92ec27e443764ea4ae5124617f978f4a5cd557c08d3d3eaca479ab	not installed
Skill	kaal-sealing	Sealing	e15f370ca679e69bdf5a4644d58138cc03d2d06f0eb1832628c4594e49dc335a	not installed

$ install-kaal --select <Changing KAAL id>   (without Sealing)
kaal-changing declares that it needs kaal-sealing beside it, which is not installed: select its Node by exact ID (Sealing e15f370ca679e69bdf5a4644d58138cc03d2d06f0eb1832628c4594e49dc335a)
nothing was written: an installation that cannot work is not an installation
exit 1
(host unchanged above)

$ install-kaal --select kaal-sealing   (a name)
select: no package carries a Node with the exact ID kaal-sealing
exit 1

$ install-kaal --select <Changing id> --select <Sealing id>
exit 0

$ wire-kaal-agent
exit 0

$ check-kaal-install
exit 0
$ check-kaal-agent
exit 0
$ check-kaal-config
exit 0

$ install-kaal (no selection, again)
exit 0
?? .kaal/
?? AGENTS.md
?? skills/

$ next-change + change-state in the host
changes/enercon/26/10/07/01/
WORK OPEN
next: the Worker does the work in work/, then it is reviewed
exit 0

<!-- kaal:begin -->
KAAL is available at `.kaal/`. Read `.kaal/AGENTS.md` to use it.
<!-- kaal:end -->
```

`git status` in the scratch clone shows only `.kaal/`, `AGENTS.md` and `skills/` as new.
