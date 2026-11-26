# Skill License: Intent

This is `core/C151`, a PLAN Change. It ships no code. A DO turns its planned tests GREEN.

Owner decision of 26 Nov 2026 (Kai): every Skill bundles its own license file inside the Skill folder, and by default it is the same license as the package the Skill ships in. Two standards apply and they differ. The external Agent Skills standard (agentskills.io) makes `license` optional and says its value may name a license or "a bundled license file", so a bundled file is compatible with it. The KAAL product standard is stricter: every Skill bundles its license. This Change states the product requirement and does not weaken it to "may". Core's layout rule of `core/C52` flags every top-level entry other than `SKILL.md`, `references/`, `scripts/` and `assets/`, so it would flag the file.

- **core/I41.** Every Skill bundles a license file at the top of its folder, named `LICENSE` with any suffix (`LICENSE`, `LICENSE.md`, `LICENSE.txt`). The file is part of the Skill's shape and never a layout finding. A Skill without one is complete under agentskills.io and not yet conformant to the KAAL product standard.
- **core/I42.** By default the license of a Skill is the license of its package. The Skill standard says so. Core's check neither requires the file nor compares it: presence and alignment with the package need the package, which is outside the Skill folder, so they are separate adopter work for a control that holds both.

## Not in this Change

- The files themselves. Adding the license to each Skill is each capability's own follow-up, listed in the Testing document.
- Which license a package has, and the mismatch of the repository root (PolyForm Noncommercial) and the packages (MIT). That is the Owner's.
- A Skill's frontmatter `license` field. It stays `checkSkill`'s, and a control may compare it with the file.
