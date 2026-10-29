# Agents 0.0.1: Architecture

Each element names, in brackets, the Requirements it answers.

- **agents/A1** [agents/F1–agents/F8, agents/N1]: The layout:
  - `bin/kaal-agents.mjs` dispatches `orient` and `preach check`.
  - `lib/orient.mjs` assembles the report.
  - `lib/git.mjs` runs Git.
  - `lib/catalog.mjs` reaches Core.
  - `lib/preach.mjs` checks a report.
  - `skills/kaal-agents/SKILL.md` is the Skill.
  - `docs/` holds the documents.
  - `test/verify.mjs`, `test/verify.json` and `test/consumer/` are the consumer's verification.

  `files` lists exactly these, plus `capability/`. `test/publisher/` and `test/plan/` stay in the repository.
- **agents/A2** [agents/F1, agents/N4]: `lib/git.mjs` runs `git` with `GIT_OPTIONAL_LOCKS=0`, so that `status` does not refresh the index.
  - `rev-parse` gives HEAD and the branch.
  - `rev-list --left-right --count` gives ahead and behind.
  - `status --porcelain=v1 -z --untracked-files=all` gives what is in flight.

  A directory outside any repository, or a missing `git`, makes `repository` `null`, with an unresolved entry.
- **agents/A3** [agents/F1, agents/N1, agents/N6]: `lib/catalog.mjs` is the only module that names `kaal-core`.
  - It resolves `kaal-core` from `<dir>` with `createRequire`, imports it, and calls its exported `catalog` on `<dir>/.kaal`.
  - When resolution or the call fails, the result is `unresolved`, with the reason.
  - Agents never reads `.kaal/` itself. Discovery stays Core's, and the Engine is managed by the consumer's own Core.
- **agents/A4** [agents/F4, agents/I3]: `lib/preach.mjs` validates the report's structure only.
  - It does not interpret `finding` or any `definition`.
  - It never picks a candidate.
  - It never compares the meanings of candidates that share a term.

  Those are the Agent's and the person's to do, as PREACH says.
- **agents/A5** [agents/F7, agents/N1]: `test/verify.mjs` follows Guard's consumer verification (`guard/A18`). It does not import it, and imports nothing from `lib/`, so a broken runtime cannot mask itself.
  - `test/verify.json` lists the delivered cases and the SHA-256 of every other shipped file.
  - Agents writes nothing into a consumer's repository, so there is no installation contract (`contract.json`). The Skill is read from the installed package.
- **agents/A6** [agents/F5]: The Skill is guidance an Agent loads when asked. Readiness does not depend on any host loading it, as `Agents.md` already says.
- **agents/A7** [agents/I4]: The published name.
  - This PLAN takes `@kaihacksai/kaal-agents`, following Guard. The workspace name changes to it in `agents/C5`.
  - If you want another name, say so on this PR before it merges.
  - Versioning stays at 0.0.1, which has never been published. Publication is yours.

## Change graph

| Change | Owner | Waits on |
| --- | --- | --- |
| `agents/C3` PREACH (#613) | Agents | — |
| `agents/C4` PLAN (this) | Agents | `agents/C3` |
| `agents/C5` DO: `bin/`, `lib/`, the Skill, the name. agents/T1–agents/T10 and agents/T14 GREEN | Agents | `agents/C4` |
| `agents/C6` DO: `docs/`, `test/consumer/`, `test/verify.mjs`, the manifest, the `files` split. agents/T11–agents/T13 GREEN | Agents | `agents/C5` |
| `agents/C7` release acceptance: the packed artifact in a clean environment. agents/T15 GREEN, with evidence | Agents | `agents/C6` |
| sync, promotion and publication | Owner | `agents/C7`, each authorized separately |

**Core.** Agents can do everything up to `agents/C7` by itself. A consumer reaches a `listed` catalog only once `kaal-core` can be installed without a checkout, that is, after Core's 0.0.1 is published. Until then, a consumer's catalog is reported `unresolved`, as agents/N3 requires. agents/T4 proves the `listed` path with the checkout's Core, as a publisher test.
