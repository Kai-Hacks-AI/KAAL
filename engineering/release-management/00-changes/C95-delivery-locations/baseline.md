# C95 baseline

The baseline is `main` (0a9cfca5), with no commit of this Change.

- Four places carry a list of locations of their own: `final-step.mjs` (`wireTarget`: `.github`, `.githooks`), `wire-judge.mjs` (`ZONE`: `.githooks`, `.github`), `pull-promotion/declaration.json` (`evidence.do`: `packages`, `engineering`, `.github`, `.githooks`) and `engineering/change-isolation/check.mjs` (`.github`; Core as `.kaal/(AGENTS.md|KAAL-KERNEL.md|core/)`).
- `.kaal` is delivered (Core payload, `.kaal/config/guard/*.md`, `.kaal/changes`) and Change Isolation knows it, but a WIRE into `.kaal` is refused by the install judge and skipped by the classifier.
- Package contracts declare their own targets (`kaal-guard`: `.githooks/pre-push`, `.github/workflows/guard.yml`, `.agents/skills/kaal-guard`). `.agents` is not present in this repository.
- The envelope checker (`plan-body/envelope.mjs`) runs by hand; no workflow runs it. Its route row for PROMOTION lists heads under `kaal/` and `hotfix/` only.
