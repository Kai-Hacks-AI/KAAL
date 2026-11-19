# engineering/C22 DO record

## Done

- `check.mjs` reads the base through one `readRevision(process.cwd(), base)` call and keeps the `.md` files; its own `git ls-tree` and per-file `git show` are gone. The report, its lines and the exit statuses are unchanged; a base that cannot be read stops with status 1 as before (`cannot list <base> (…)`), and a base holding a symbolic link or submodule stops with status 1 naming it (`cannot read <base> (…)`), the one visible change the PLAN accepted.
- T386–T389 renamed from `.red.mjs` to `.test.mjs`; all four GREEN.

## Evidence

Node 24, Linux, after `npm ci` and `npm run build` on a branch holding the PLAN merged with main at fd54e4f4 (hosting/C110 on main). The engineering Case runner (`node --test engineering/cases/cases.test.mjs`): 288 of 288 pass, including engineering/T386–T389. Not run on Windows or macOS locally; CI covers them.

The Case ids were checked again against main and every remote branch before this DO: T386–T389 are still free.

## Not done

No npm publish, no pin move, nothing enforced: the check is still report-only and no ruleset, workflow or hook uses it.
