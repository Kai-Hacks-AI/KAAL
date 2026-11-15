# Installed Verification: Testing

The planned outer tests live in `packages/kaal-engineer-skill/test/plan/installed-verification.test.mjs`. They are RED now and immutable to DO. This Change writes no other test code.

| Test | Checks | Loop |
| --- | --- | --- |
| engineer-skill/T370: `npm test` has no `pretest` and runs the consumer verification; the source suite is `test:publisher` | engineer-skill/F8, engineer-skill/F11 | Requirements |
| engineer-skill/T371: `files` names `test/verify.mjs` and `test/verify.json`, and the normal pack contains both | engineer-skill/F9 | Requirements |
| engineer-skill/T372: the manifest digests every other packed file and nothing else | engineer-skill/F9, engineer-skill/N2 | Requirements |
| engineer-skill/T373: on a copy of the packed files, unaltered is `verified`; an altered byte, a deleted file and a stray file are each `failed`; an unreadable manifest is `unknown` | engineer-skill/F10 | Requirements |
