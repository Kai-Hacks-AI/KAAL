# C137 baseline

The baseline is `main`. `envelope.mjs` exports `verifyEnvelope(facts, registry)` and answers PASS, FAIL or UNKNOWN from `{title, body, base, head, commits}` and a registry of TYPE to chapters; `templates.mjs` `readTemplates(files)` derives the registry from the pull request templates. Both read no git and no GitHub. By hand, `node envelope.mjs <facts file>` works.

What does not exist: a runner that makes the facts of a real pull request from files and Git data, a flag-gated exit, a record of each run, and a workflow source. No `verify-envelope` workflow is on `main`, and `CTL11.md` is `status: designed`, with the evidence `fixture:2, real:1, provoked:1:fail` still unmet.
