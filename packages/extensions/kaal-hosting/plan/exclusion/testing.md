# Excluded Directories: Testing

The planned outer tests live in `packages/extensions/kaal-hosting/test/plan/exclusion.test.mjs`. Each title names the contracts it checks. They are immutable to DO and CHECK. Run them with `npm run build -w <Hosting's workspace> && node --test packages/extensions/kaal-hosting/test/plan/exclusion.test.mjs`. `hosting/C21` turns them GREEN and moves them into Hosting's `npm test`, so they run in the Linux, Windows and macOS Hosting lanes. They reach Hosting through its build by path, so a rename needs no edit. Directory links are made as junctions, which Windows allows without privilege, and as directory links elsewhere.

| Test | Checks | Loop |
| --- | --- | --- |
| hosting/T49: a tree that `read` refuses because a linked dependency directory sits inside `node_modules`, at the root and nested, and because `node_modules` itself is a link to a directory, reads with `exclude: ["node_modules"]` as every other file, and nothing under any `node_modules` | hosting/F42, hosting/I11 | Requirements |
| hosting/T50: exclusion is by whole, exact directory name: `node_modules_extra/`, a `Node_Modules/` directory and a file named `node_modules` are read; a root directory named `node_modules` is read | hosting/F42 | Requirements |
| hosting/T51: outside excluded directories nothing changes: the result equals `read`'s for the same files, a link to a directory that is not excluded is still refused with `INVALID_PATH`, a missing directory reads as empty, and `read(dir)`, `read(dir, {})` and `exclude: []` agree | hosting/F43 | Requirements |
| hosting/T52: a wrong exclusion is refused with `INVALID_PATH` before anything is read: not an array, an empty name, `.`, `..`, a name with `/`, `\` or NUL, a repeated name, a non-string, and an unknown option such as `exlude` | hosting/F44 | Requirements |

## RED evidence

At `hosting/C20`, hosting/T49, T50 and T52 are RED by behavioural assertion. `read` ignores its second argument, so T49's trees are refused with `INVALID_PATH`, T50's `node_modules/` contents are read, and T52's wrong exclusions are refused only for the tree's link, not before reading, and are not refused at all on an empty tree. hosting/T51 is GREEN today by design: it guards that nothing outside an exclusion changes, so it must stay GREEN through `hosting/C21`. None of them is in Hosting's `npm test`, so KAAL's lanes stay green.

The `Node_Modules/` directory sits under its own parent, so the case is the same on hosts whose file systems ignore case.

## Checked against a throwaway reference

A reference `read(dir, { exclude })`, written for this PLAN and not committed, turns all four GREEN on Node 24 (Linux). Each weaker variant of it is caught:

| Weaker reference | Caught by |
| --- | --- |
| reads the whole tree, then drops paths under an excluded name | hosting/T49, T50 |
| excludes any name that begins with an excluded one | hosting/T50 |
| compares names ignoring case | hosting/T50 |
| excludes only at the root | hosting/T49, T50 |
| also drops files with an excluded name | hosting/T50 |
| stops refusing every directory link once anything is excluded | hosting/T51 |
| does not validate the options | hosting/T52 |
