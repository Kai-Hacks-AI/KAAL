# Agents adopts main's package identities and flat layout (agents/C14 PLAN)

This PLAN ships no code and moves no file. It states what keeps `kaal-agents` from being synchronized with `main`, and the one Change that removes it. It authorizes no sync, promotion or publication.

## Intent

The collector `kaal/agents/external` was a copy of the old `kaal/agents`, last synchronized with `main` on 3 Nov. Since then `main` changed what a package is called and where it lives. Agents did not follow, so a merge of `main` into the collector cannot be completed as a plain synchronization: the Change Isolation check on #1021 cannot judge (the collector's old checker does not know the deferred-attestation option the current CI calls), and a SYNC fails on two conflicts that are not text conflicts.

## What differs

- **Layout.** `main` is flat: `packages/kaal-*`. Agents sits at `packages/skills/kaal-agents`. The root `package.json` on `main` has no `packages/skills/*` entry and no `packages/extensions/*` entry.
- **Hosting's identity.** `main` names it `@kaihacksai/kaal-hosting`. Agents' `devDependencies` and its `pretest:publisher` script (`npm run build -w kaal-core -w kaal-hosting`) still say `kaal-hosting@0.0.1`. That version is not on the registry, so `package-lock.json` cannot be regenerated after the merge.
- **The rest.** `kaal-core`, `kaal-graph` and `kaal-testing` keep their names on `main`. Agents' own name stays `kaal-agents`, unscoped, as the other packages it sits beside.
- **Depth.** Agents' planned tests find the repository root by a fixed number of `..` segments. A move up one directory changes the count.

## The Change

One Change, agents/C14, makes Agents match `main`:

1. Move `packages/skills/kaal-agents` to `packages/kaal-agents`.
2. Replace `kaal-hosting` with `@kaihacksai/kaal-hosting` in `package.json` (dependency and `-w` script) and anywhere a shipped text names it.
3. Fix every path that counts directories from the package, and every document that names the old path.
4. Merge `main` into the collector as the DO's first commit (a merge commit, a SYNC by lineage), resolve the root `package.json` to `main`'s list plus `packages/kaal-agents`, and regenerate `package-lock.json`.

It changes no behavior. `orient`, `preach check`, the Definitions and the Skill are unchanged, so agents/F10 to F12 in #1021 stay as they are.

## Order

The collector `kaal/agents/external` was a copy of the old `kaal/agents`, so no Change could be judged on it, and a synchronization was refused by Hosting's cross-package scan for the old name. Kai ruled (15 Nov) to re-establish the collector from `main`'s tip as a documented exception, and to bring the Agents work in as one Change. That Change carries this PLAN, its DO and the C10 text changes of #1021 (agents/F10 to F12). The earlier #1715, #1716 and #1021 are superseded by it.

## Not decided here

- Whether the move to `packages/kaal-agents` should instead wait for the capability map's final layout. This PLAN follows `main` as it is today.
- Whether `kaal-agents` becomes a registered workspace of the root in the same Change or a later one. Test agents/T422 requires it.

## Testing

Four planned tests, in `test/plan/alignment.test.mjs`. They read the package and the root, run outside `test:publisher`, and fail today.

| Test | Finding | Fails today because |
| --- | --- | --- |
| agents/T420 | the package depends on Hosting by `main`'s identity | `package.json` names `kaal-hosting` |
| agents/T421 | the package sits directly under `packages/` | it sits under `packages/skills/` |
| agents/T422 | the root workspace list holds no legacy folder and holds the package | it lists `packages/skills/kaal-agents` |
| agents/T423 | the root lockfile resolves the package | the lock has no `packages/kaal-agents` entry |
