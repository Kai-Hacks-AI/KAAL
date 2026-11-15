# Requirements in the flat layout: Requirements

- **requirements/F30. Flat package** [requirements/I17]. The package is `packages/kaal-requirements`, named `kaal-requirements`, and is a workspace of the root `package.json`.
- **requirements/F31. Content unchanged** [requirements/I17]. `Requirement.md`, `Requirements.md` and `Serves.md` have the same bytes as on the old collector, so the digests in `contract.json` still match and the Capability Node keeps its id.
- **requirements/F32. Ownership follows the path** [requirements/I17]. `ownership.kaal.json` claims `packages/kaal-requirements/` for the same owner id.
- **requirements/F33. Current names** [requirements/I18]. The package's code and tests name Hosting as `@kaihacksai/kaal-hosting`, not `kaal-hosting`.
- **requirements/N12. Nothing else changes** [requirements/I17]. No Definition, Skill, version or publication changes in this Change.
