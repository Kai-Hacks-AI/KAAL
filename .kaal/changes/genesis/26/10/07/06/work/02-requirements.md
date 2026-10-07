# Requirements

Scope: a repository that holds no KAAL (`Kai-Hacks-AI/Enercon` is the first external host; its content is one README). The machinery in question is `engineering/kaal-install`, with `wire-kaal-agent` and the checks beside it. It is repository engineering and not shipped.

## What already holds (observed on a scratch copy of Enercon, not written to it)

- `install-kaal --into <host>` on a fresh host deploys Core only; `check-kaal-install` then exits 0.
- Registering a package's contribution through Core's `registerSkill()` into the host's `.kaal`, then `install-kaal` again, projects that Skill's Agent Skill into the host's `skills/`; `check-kaal-install` exits 0 and `installedSkills()` names it.
- `wire-kaal-agent --agents <host>/AGENTS.md` wires the host, and `check-kaal-agent` exits 0.
- An installed `kaal-changing` allocates a Change in the host (`next-change.mjs`).

So the transition works today, but only when someone writes the registration step by hand (genesis did it in test code). The missing piece is a command that performs that one step. Nothing in this Change should need a new Core meaning to do it.

## Requirements

1. **A first Skill is selectable on a fresh checkout.** There is a supported command by which a person or an agent selects a capability for a KAAL that has no installed Skill, and the result is a valid installed KAAL containing it.
2. **Selection is by exact Node ID, never by name.** The earlier ruling stands: installation does not select by name. The selection names the exact ID of the capability's Node, which is what Core's `installedSkills()` and the installer already match on. Selecting an ID that no package carries is refused and writes nothing.
3. **Selection is performed by Core.** The capability enters through `registerSkill()` / `registerExtension()` as it does today, so Core's admission decides validity. The command decides nothing Core decides, and does not copy Node or seal bytes by its own rule.
4. **Selection is one-time and then installed state.** Once registered, `installedSkills()` and `installedExtensions()` are the truth, as now: running `install-kaal` with no selection reproduces the same installation, and nothing remembers a selection elsewhere (no list, lock file or registry).
5. **Discoverable without names deciding.** A person can see which capabilities the packages can deliver and the exact Node ID of each, so an ID can be chosen. This lists; it does not select.
6. **Host-agnostic.** The mechanism has no knowledge of this repository's `.kaal/changes/genesis`, of Enercon, of Git, GitHub, CI, branches or accounts. It writes only the KAAL directory, the host's `skills/` entries of the capabilities it delivers, and the Agent wiring fragment. It does not assume the host has `package.json`, workspaces, TypeScript or Node tooling of its own.
7. **Agent entrypoint is wired.** The fresh host ends with `AGENTS.md` wired to `.kaal/AGENTS.md` by the existing `wire-kaal-agent`, with the host's other `AGENTS.md` content untouched, and `check-kaal-agent` holds.
8. **Append-only and idempotent.** Selection and installation refuse, writing nothing, rather than change sealed bytes; repeating them is a no-op. `.kaal/changes` is never touched.
9. **Composed, not merely installed.** What a delivered Skill says it needs beside it (`kaal-changing` needs `kaal-sealing`) is visible before the host is left in a state where the Skill cannot work: either the dependency is part of the selection, or the result names the unmet need. Which of the two is Kai's call (see Not decided).
10. **Core, Changing, Sealing and CASE are unchanged.** No `kaal-core` change and no `.github` change; if either turns out to be necessary the Change stops and says so on the PR.
11. **Proof on an external host.** Acceptance in `engineering/kaal-install` runs the transition on a copy of a host that is not this repository, and a recorded run against a scratch clone of `Kai-Hacks-AI/Enercon` shows `non-KAAL repository → installed, composed KAAL` ending in `check-kaal-install`, `check-kaal-agent` and `check-kaal-config` all holding. Nothing is pushed to Enercon and none of its settings are changed without Kai's explicit word on the PR.

## Not decided

Raised on the PR for the Owner, not settled in the Requirements:

- **Dependencies (requirement 9).** Should selecting `kaal-changing` also select `kaal-sealing` automatically, or should the command refuse or warn until both IDs are given? A package can only say what it needs in prose today (its SKILL.md `compatibility`), so automatic selection would need a machine-readable need, which would be a new meaning.
- **Where the one command lives.** `install-kaal --select <Node ID>` (repeatable) extends the existing command, or a separate command does the registration and `install-kaal` stays as it is.
- **One command for the whole transition.** Whether the fresh-host path is the three existing steps (`install-kaal --select`, `wire-kaal-agent`, the checks) or one composed command that also wires the Agent entrypoint.
- **The source of packages.** The installer projects from this repository's packages (`--into` names the host). Whether that is enough for an arbitrary repository, or a published delivery must also be possible, is not decided here.
