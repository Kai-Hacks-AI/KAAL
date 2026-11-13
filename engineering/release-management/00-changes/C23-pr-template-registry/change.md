# C23 change

## PLAN

1. Add C23, the architecture node A43 and four Cases for the gap. The Cases are RED on `main` because neither the registry nor `install.mjs` exists.
2. A43 states the contract: the registry folder `engineering/release-management/05-src/pr-templates/`, one exact-bytes source file per TYPE, `manifest.json` (`version`, and per template `type`, `source`, `target`, `sha256`), and `install.mjs` with `--check` (read-only) and `--write` (byte-exact copy, then check). The verdict is PASS, FAIL or UNKNOWN. A missing or unreadable source, target or manifest is UNKNOWN, a difference is FAIL, and an unregistered installed template is FAIL only once the manifest says `closed`, and only PASS exits 0.
3. The PLAN builds nothing and changes no template.

## DO

1. Add `manifest.json`, `install.mjs` and `sync.md` to the registry, with SYNC as the only entry and `closed` false, because PLAN, DO, ACT, PROMOTION, HOTFIX and DEFAULT are adopted by later Changes, the last of which sets `closed` true. The SYNC text moves from `A34-sync-template/sync-template.md` to the registry (one source), A34 and release/T121 name the registry file, and the installed `.github/PULL_REQUEST_TEMPLATE/sync.md` is unchanged byte for byte.
2. Rename the Cases from `.red.mjs` to `.test.mjs`.
3. Nothing is wired: `install.mjs` is a command run by hand.

## ACT

1. A single concluding 4L retrospective in `act.md` of the collector, from the viewpoint of the agent that carried it.

## Not in this Change

Adopting PLAN, DO, ACT and PROMOTION as sources, HOTFIX, DEFAULT, `.gitattributes`, any text change of any template, hooks, workflows, required checks, ruleset changes and npm publication. Each is a separate Change that follows.

## Dependencies

None. release/C9 and release/C16 (SYNC text and installation) are on `main`.
