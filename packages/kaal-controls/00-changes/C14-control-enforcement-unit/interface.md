# C14 interface

What the DO builds, as a draft for review. Nothing here is installed by this Change.

## Declaration

`stations: [Integrating:preventive]`, an optional line of a control. One entry per station, `<Station>:<mode>`. A Station is Developing, Collecting, Integrating, Hotfixing, Wiring, Promoting or Publishing. A mode is `detective` or `preventive`. The line is a list of `Station:mode` and not a list of maps because the finder reads one `key: value` line at a time. The finder lists `stations: [{ station, mode }]` for every control and reports a bad line as a problem of `stations`.

## Scripts (in `skills/kaal-controls/scripts/`)

| Script | Command | Prints |
| --- | --- | --- |
| `registry.mjs` | `--repo <dir> --base <ref> --station <S>` | the controls registered at S in the files of `<ref>`: `id`, `title`, `mode`, `status`, `path`. Exit 1 if the ref cannot be read. |
| `judge.mjs` | `--repo <dir> --base <ref> --head <sha> --station <S> --out <file> [--timeout <ms>]` | writes the verdicts: `control`, `station`, `mode`, `head`, `verdict` (PASS, FAIL, UNKNOWN), `detail`. It extracts the base with `git archive`, runs `judge.mjs` of each control from there with `KAAL_HEAD`, `KAAL_BASE`, `KAAL_STATION`, `KAAL_REPO` in its environment, and nothing else. |
| `sign.mjs` | `--app <name> --station <S> --head <sha> --registry <file> --verdicts <file> --repo <owner/name>` with `GH_TOKEN` | posts one check per registered control. Its pure part `signedChecks` builds them: name `<app> / <title> (<Station>)`, PASS success, FAIL and UNKNOWN failure, a missing, stale or malformed verdict UNKNOWN. |

A control answers with `judge.mjs` beside its declaration, which prints `{"verdict":"PASS"|"FAIL","detail":"..."}`. Anything else is UNKNOWN.

## Templates (in `enforcement/`, shipped by `files`)

- `workflow.yml`: `pull_request_target`; job `judge` (no permission, no secret, checks out `pull_request.base.sha`, runs registry and judge, uploads the verdicts), job `sign` (`needs: judge`, no checkout, the only job that reads the App's key, mints a token and runs `sign.mjs`).
- `app-manifest.json`: permissions Checks write and Pull requests write, no event, webhook inactive, not public, a neutral name.

## KAAL's instance (`engineering/controls/stations.json`)

`{ "app": { "name": "KAAL Quality Control", "id": null }, "stations": { "Integrating": { "ruleset": "integrating", "branches": ["kaal/**", "hotfix/**", "wire/**"] } } }`. The App ID is set when the App exists.

## Dependencies

| Dependency | Needed for | State on 18 Nov 2026 |
| --- | --- | --- |
| release/C62, main's finder reads `status` | the finder of C12 reaching `main` without a conflict | on the seat, SYNC #1912 merged |
| release/C70, stages declare rules | `verify Stages` comparing the registry with the rulesets | PLAN #1897 and DO #1908 merged, ACT #1909 open |
| release/C66, the integrating approval rule | the ruleset requiring the App's check next to CTL10 | PLAN #1895 merged, DO waits for C62 and C70 |
| a release Change registering release/CTL8 | `stations: [Integrating:preventive]` and `judge.mjs` of CTL8 | not planned yet |
