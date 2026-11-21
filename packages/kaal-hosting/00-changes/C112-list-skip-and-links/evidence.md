# hosting/C112 evidence

Observed 21 November 2026 on Node 24 and Linux, on `main` 350eaef0 plus this PLAN, after `npm run build`.

## Expected RED

Drafts `T297` to `T302` (`helper.mjs` makes the scratch trees) copied into `04-test/package-check/` of a working tree and run with `node --test` against the built `dist`:

- T297 (regression): GREEN. No options, `{}` and the defaults written out give the same listing today, and a link to a directory is `INVALID_PATH`.
- T298, T299: RED, the assertion fails because `skip` is ignored (the skipped names are listed).
- T300, T301: RED with `INVALID_PATH` on the link to a directory, because `links: 'skip'` and a skipped directory are not known yet.
- T302: RED, `Missing expected rejection` for `{ skip: "node_modules" }`, because options are not read.

The copies were removed; the PLAN adds no file outside this folder.

## What the facts rest on

- `list` shares `read`'s `walk`; a link to a directory is refused there with `INVALID_PATH` (`index.ts`, `walk`). `entry.isDirectory()` is false for a link, so a link to a directory reaches the `stat` branch, which is where `links: 'skip'` and `skip` decide.
- Testing's catalog needs `list(checkout, { skip: ['node_modules', '.git'], links: 'skip' })` plus `readFile`.

## Not yet shown

That each Case can pass on the DO's source: this PLAN carries the Cases and the shape, not the source.
