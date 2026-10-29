# Publication Readiness: Testing

The planned outer tests live in `packages/kaal-foundation/test/plan/publication.test.mjs`. Each title names the contracts it checks. They are immutable to DO and CHECK. `foundation/C4` turns them GREEN and adds them to the package's `npm test`.

| Test | Checks | Loop |
| --- | --- | --- |
| foundation/T9: the package is not private, keeps its name and version, declares no dependencies, and packs exactly `package.json`, `README.md`, `LICENSE`, `lib/sha256.mjs` and `lib/sha256.d.ts` | foundation/F4, foundation/F5, foundation/N2 | Requirements |
| foundation/T10: packed and installed into a clean directory, `@kaihacksai/kaal-foundation/sha256` imports and gives the digest of `abc`, and the installed files are exactly the packed ones | foundation/F5, foundation/A5, foundation/I4 | Intent |
| foundation/T11: the README gives the install command, does not call the package private or unpublished, and keeps the provisional ownership statement | foundation/F6 | Requirements |

## RED evidence

On `kaal/foundation`:
- **Behavioural:** T9 fails because the package is `private`.
- **Behavioural:** T11 fails because the README says the package is not published and gives no install command.
- **Characterization:** T10 is GREEN today, since npm installs a private package from a local tarball. It is the acceptance that must keep holding once the package is public.

A throwaway reference that removed `private` and updated the README turned all three GREEN. Each weaker reference below was caught:

| Weaker reference | Caught by |
| --- | --- |
| still `private` | foundation/T9 |
| ships an extra file, such as `test/` | foundation/T9, T10 |
| adds a dependency | foundation/T9 |
| README keeps "not published" | foundation/T11 |
| README drops the provisional ownership statement | foundation/T11 |
