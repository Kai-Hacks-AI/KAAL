# Product: take Hosting under its scoped name from the registry (provisional number 26/11/08/02)

## Intent

Product's package and test name the unscoped `kaal-hosting`, which is `@kaihacksai/kaal-hosting` on main since the Hosting rename. Hosting's T22 forbids the old name anywhere in the repository, so the rest of main cannot be synchronized into `kaal/product` while Product names it. A SYNC cannot carry a fix of its own, so the fix is an ordinary Change first (Kai, 8 Nov), the same route `kaal/testing` took.

## Change

- `packages/skills/kaal-product/package.json`: the devDependency and the `pretest` build selector move off the unscoped name. Hosting now comes from the published `@kaihacksai/kaal-hosting` 0.0.1, which resolves with or without a Hosting workspace of that name, so no workspace build of Hosting is needed.
- `packages/skills/kaal-product/test/product.test.mjs`: the import names the scoped package.
- `package-lock.json`: regenerated; the only differences are the scoped Hosting entry and Product's devDependency.

## Not changed

No Definition, Node, ownership claim or Product behaviour. Product stays internal-only. Step 2 of the SYNC (the rest of main) follows this Change.

## Verified by

`npm test -w kaal-product`: 39 of 39 pass. Required checks on this PR.

## Validated by

CPO review at the exact head.
