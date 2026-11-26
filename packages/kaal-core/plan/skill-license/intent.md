# Skill License: Intent

This is `core/C151`, a PLAN Change. It ships no code. A DO turns its planned tests GREEN.

Owner decision of 26 Nov 2026 (Kai): every Skill bundles its own license file inside the Skill folder, and by default it is the same license as the package the Skill ships in. The Agent Skills standard (agentskills.io) makes `license` optional and says its value may name a license or "a bundled license file", so a bundled file is compatible. Core's layout rule of `core/C52` flags every top-level entry other than `SKILL.md`, `references/`, `scripts/` and `assets/`, so it would flag the file.

- **core/I41.** A Skill may carry a license file at the top of its folder, named `LICENSE` with any suffix (`LICENSE`, `LICENSE.md`, `LICENSE.txt`). It is part of the Skill's shape, not a layout finding. Without it the Skill is still complete.
- **core/I42.** By default the license of a Skill is the license of its package. The Skill standard says so. Core does not judge it: whether two licenses match needs the package, which is outside the Skill folder, so a control that holds both owns that check.

## Not in this Change

- The files themselves. Adding the license to each Skill is each capability's own follow-up, listed in the Testing document.
- Which license a package has, and the mismatch of the repository root (PolyForm Noncommercial) and the packages (MIT). That is the Owner's.
- A Skill's frontmatter `license` field. It stays `checkSkill`'s, and a control may compare it with the file.
