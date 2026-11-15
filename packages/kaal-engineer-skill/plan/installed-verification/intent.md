# Installed Verification: Intent

This is `engineer-skill/C3`, a PLAN Change. It is Engineer Skill's first release-completion increment toward the scoped `0.0.1` publication. It ships no code. A DO Change turns its Cases GREEN.

Today `npm test` in an installed copy of `kaal-engineer-skill` cannot work. `pretest` builds the `kaal-core` and `@kaihacksai/kaal-hosting` workspaces, and `test` runs source tests that are not shipped. A consumer gets a failure that says nothing about whether their copy is intact. Foundation (`test/verify.mjs`, `test/verify.json`, `test/run.mjs`) and Core (`test:consumer`) already solved this; Engineer Skill reuses that shape and does not invent a new vocabulary.

- **engineer-skill/I4.** A consumer can learn, from the installed package alone, whether the files they received are the files the publisher shipped. The answer is one of `verified`, `failed` or `unknown`. `unknown` never counts as `verified`.

This increment leaves the scoped package name (it ripples into `kaal-graph` and `kaal-review` and is Engineering-coordinated), the declared `files` inventory beyond the verification files, and the version sequence to later increments.
