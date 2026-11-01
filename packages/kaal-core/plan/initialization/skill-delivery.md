# core/C41 DO, part 1: the delivered Core Skill

Parent: accepted core/C40 PLAN, #813, collector `f4c47049c9c54d0c15b62e7f53bb2049be7c23dc`. This ordinary Core Change lands by squash after independent review and required CI. It does not synchronize or promote the collector.

## Delivered boundary

Implement core/F89 and core/A45's own Skill delivery. `skills/kaal-core/` carries `SKILL.md` and `Core-Skill.md`. The Node names Core's existing KAAL Skill type, obtained from `foundation().skill`, rather than restating its definition. Its exact id is `d42e04ca482fd58c245274d6b74b39c7b0aeb1e2a906ff12e087d96231e8abfc`. Scoped Git attributes preserve the two delivered files' bytes on every host.

The package README and Operations point to the Skill. It guides current public API/CLI behavior, including explicit bootstrap, owner-declared contribution registration, external inspection, package-versus-Engine verification and escalation. It states that the current unscoped candidate is unpublished, bootstrap is not full mandatory-infrastructure initialization, unavailable Graph analysis is not empty/verified analysis, and presence/admission/use are distinct.

The delivered Requirements loop now checks the shipped Node through Core's actual admission API. The committed manifest includes both Skill files and all 12 delivered cases. The source runner enrolls only the now-GREEN core/T98 as `test:skill`; no immutable planned test was edited. Existing Engine payload, lifecycle, runtime code/exports, dependencies, package name/version, workflows and consumer activation remain unchanged.

The existing Engineering Core Acceptance scenario lists the exact new tarball files, admits the Skill through the installed public API and executes installed `npm test`. It retains the candidate/manifest digest and every observed case in the existing CI log. Since that scenario already runs on Linux/macOS/Windows, this also enrolls the installed-verifier assurance requested by core/F96 without another workflow or recorder. Cross-platform results are still a CI finding, not a consequence of the enrollment.

## Verification

Local runtime: Node 24.22.1 / npm 11.9.0 / Linux.

- core/T98 was RED on the approved baseline because the Skill was missing. It is now GREEN without changing that planned test.
- Engineer Skill's existing checker accepts the source Skill and an installed copy relocated to a separate `kaal-core` directory. The Agent Skills specification was checked directly; Core implements none of its format rules.
- Clean packed installation with runtime dependency tarballs and no Graph: installed `npm test` gives **12 declared / 12 executed / verified**. The installed public API admits the Skill Node. Installed CLI `init`, `verify`, `list` and `resolve` work against an explicit external Engine without creating the controller's `.kaal`.
- Changing the installed Skill gives **cannot verify (2)**. Breaking the Skill Node's type reference and refreshing its manifest digest still gives **failed (1)** by the delivered behavioral case. Restoring the copy returns to **12/12 verified**. This is stronger than accepting matching hashes alone.
- The clean-consumer artifact digests and observed checks are in `skill-package-evidence.json`. The Foundation artifact's digest is the same `36be7a4...` bound by Foundation's accepted 0.0.1 Pack run 41219302162. This DO requests no Foundation 0.0.2 dependency or change to immutable published 0.0.1.
- Final serial `npm_config_offline=true npm test -w kaal-core`: every declared source suite passes, including the existing publisher groups (172, 9, 8, 5), boundary (5), installed-compatible consumer verification (12) and Skill (1). No skips/todos/cancellations were reported in those groups.
- `npm_config_offline=true npm run test:acceptance`: **37 passing, zero failing**, packing 6 packages once and using the existing ledger for 5 installations/scenarios. The newly added installed-verifier record is emitted in that lane. Existing unknown findings about physical host containment and unrecorded installations remain explicit; no assertion was weakened or unknown called verified.
- Complete C40 planned suite: **4 GREEN / 5 RED**, no skips. T98 is the newly GREEN case; T102–T104 remain GREEN. The remaining T99–T101/T105/T106 still demonstrate unfinished navigation, initialization, full release-suite enrollment and normalized reporting.
- Syntax, whitespace and committed-manifest checks pass. The tarball inventory remains exact. Core's own boundary suite still passes; no runtime host mechanic was added.

An initial overlapping source-build/pack attempt produced an invalid partial package observation (a delivered declaration file was missing). That attempt is not acceptance evidence. The complete source and clean-consumer runs were repeated sequentially; their results above are the evidence retained here. No product assertion was changed to bypass the interference.

## Limits and next work

This is an independently useful Skill/package slice, not complete Core 0.0.1 release acceptance. It does not claim an agent actually used the Skill, that it was automatically registered/deployed, Owner validation, registry dependency resolution or a three-host result from a Linux run.

Engine-entry navigation (F90/T99) and the mandatory registration flow remain separate. The newer Owner direction on #749 requires ordinary Hosting/Core bootstrap to continue against published Foundation 0.0.1, not await Foundation 0.0.2. A later initialization delivery must use an independently agreed owner-authored declaration channel rather than invent a Foundation Node or change that version requirement. Testing/Packaging normalization, scoped dependency integration, any assertion-preserving PLAN amendments, focused main promotion and publication retain their separate prerequisites and decisions.
