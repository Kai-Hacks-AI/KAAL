# Agents: Architecture (where)

Each element names, in brackets, the Requirements it answers. The Requirements are in [Requirements](requirements.md).

- **agents/A1** [agents/F1–agents/F8, agents/N1]: The layout:
  - `bin/kaal-agents.mjs` dispatches `orient` and `preach check`.
  - `lib/orient.mjs` assembles the report.
  - `lib/git.mjs` runs Git.
  - `lib/catalog.mjs` reaches Core.
  - `lib/preach.mjs` checks a report.
  - `skills/kaal-agents/SKILL.md` is the Skill.
  - `docs/` holds the documents.
  - `test/verify.mjs`, `test/verify.json` and `test/consumer/` are the consumer's verification.

  `files` lists exactly these, plus `capability/`. The publisher's own tests stay in the repository.
- **agents/A2** [agents/F1, agents/N3, agents/N4]: `lib/git.mjs` runs `git` with `GIT_OPTIONAL_LOCKS=0`, so that `status` does not refresh the index.
  - `symbolic-ref` gives the branch. It fails silently only for a detached HEAD.
  - `rev-parse --verify` gives HEAD. It may lack a commit only on a branch with none yet.
  - `for-each-ref %(upstream:short)` gives the upstream, which is empty when there is none.
  - `rev-list --left-right --count` gives ahead and behind.
  - `status --porcelain=v1 -z --untracked-files=all` gives what is in flight.

  Any other failure of these reads is an unresolved entry carrying Git's own message. A directory outside any repository, or a missing `git`, makes `repository` and `inFlight` `null`, with an unresolved entry.
- **agents/A3** [agents/F1, agents/N1, agents/N6]: `lib/catalog.mjs` is the only module that names Core's package.
  - It resolves Core's package from `<dir>` with `createRequire`, the scoped name first, imports it, and calls its exported `catalog` on `<dir>/.kaal`.
  - The result is `unresolved`, with the reason, when:
    - nothing resolves;
    - what resolves does not export a `catalog` function;
    - the call fails.
  - Agents never reads `.kaal/` itself. Discovery stays Core's, and the Engine is managed by the consumer's own Core.
- **agents/A4** [agents/F2, agents/F4, agents/I3]: `lib/preach.mjs` validates the report's structure only.
  - It does not interpret `finding` or any `definition`.
  - It never picks a candidate.
  - It never compares the meanings of candidates that share a term.
  - It never checks what a cited authority grants.

  `lib/orient.mjs` has no code path that sets authority to anything but `unresolved`. Settling meaning and authority is the Agent's and the person's work, as PREACH says.
- **agents/A5** [agents/F7, agents/N1]: `test/verify.mjs` follows Guard's consumer verification without importing it, and imports nothing from `lib/`, so a broken runtime cannot mask itself.
  - `test/verify.json` lists the delivered cases by name, and the SHA-256 of every other shipped file.
  - Agents writes nothing into a consumer's repository, so there is no installation contract. The Skill is read from the installed package.
- **agents/A6** [agents/F5]: The Skill is guidance an Agent loads when asked. Readiness does not depend on any host loading it, as `Agents.md` already says.
- **agents/A7** [agents/I4]: The published name. The package is `kaal-agents` until the Owner gives it another. Every case reads the name from `package.json`, so a new name changes one field.
