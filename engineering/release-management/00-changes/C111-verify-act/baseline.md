# C111 baseline

The baseline is the collector `kaal/release/verify-act` at bed61a2, which is `main` after the SYNC of kaal-retro (retro/C4 and retro/C5, the ACT RT1). It has no commit of its own.

- kaal-retro is on `main`: `packages/kaal-retro/skills/kaal-retro/scripts/find-retros.mjs` (`findRetros(files)` returns `{ retros, refused }`, each retro with `id`, `format`, `reflects`, `path`; it refuses an id that is not `<capability>/RT<n>`, a missing format, an empty or unqualified `reflects`, and a duplicate id) and `judge-retro.mjs` (`judgeRetro(text)` returns `{ result, problems }`: `well-formed`, `malformed` with `{ section, rule }` entries, or `unjudged` for a format other than 4L). Its first retro stands at `packages/kaal-retro/02-learnings/retros/RT1.md`.
- Nothing in release asks them. No check says that the file the controls of the ACT count is a retro of that form.
- The judge of release/C103 (`hold Act`, `05-src/phase/judge-act.mjs`: `changeIdOf` reads the qualified id of a Change from its record) is the DO #2165, not yet on the collector; this Change's DO follows it, as release/C108's does, and the Cases that call `changeIdOf` are RED here for the absence of both.
- Highest ids, read on 20 Nov 2026 against the heads of the open pull requests and `main`: C110 (limit Act), I59, F85, A75, CTL30, T1304; C108 (demand Act) I58, F84, A74, CTL29, T1294 to T1298; C109 is reserved in C108 for "no unfinished Change is promoted". The ids below follow them.
- Runner on this baseline: 315 tests, 299 pass, 16 fail (the 16 environment failures that also fail on `main`).
