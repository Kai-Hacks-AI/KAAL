# hosting/C112 change

## From

`list(dir)` takes no options. It refuses every link to a directory and lists every name, so a caller that must scan a normal checkout cannot use it and falls back to `node:fs`.

## To

`list(dir, options?)`, with two optional fields:

- `options.skip`: a list of entry names. An entry whose own name equals one of them, a directory or a file, at any depth, is neither listed nor entered. Whole-name match: `node_modules` skips `node_modules` and not `my_node_modules`; a name holding `/` never matches. A skipped directory is not read at all, so nothing inside it can fail the listing.
- `options.links`: `'refuse'` (the default, today's behaviour) or `'skip'`. With `'skip'` a link to a directory is neither listed nor entered nor an error. A link to a file lists as a file under both settings.

With no options, and with `{}` or `{ skip: [], links: 'refuse' }`, the result is today's result byte for byte, including the error cases. The order stays UTF-16 order of the whole relative path, a directory before what it holds, with skipped entries simply absent. A `skip` that is not a list of strings, or a `links` outside the two values, is a `TypeError` naming the option, thrown before anything is read. Nothing else changes: `read`, `list`'s portable-name refusal, `NOT_DIRECTORY` and the missing-directory result stay as they are. No read option, no synchronous variant, no pattern matching, no depth limit.

## Because

Testing's Case catalog (and any later caller that scans a checkout) lists through Hosting alone, with no `node:fs`, on every host.

## FAR (because of Features we have to Accept Regression)

1. Regression Cases, GREEN on `main` today and after the DO:
   - hosting/T297: `list(dir)`, `list(dir, {})` and `list(dir, { skip: [], links: 'refuse' })` give the same result, in UTF-16 order, a directory before what it holds; a link to a directory still rejects `INVALID_PATH`.
2. Accept list: Hosting's existing Cases (T1 to T296) stay GREEN. Nothing is accepted as lost.
3. Feature Cases, RED on `main` today (drafts `T298` to `T302` `.red.mjs`):
   - hosting/T298: `skip` leaves out a directory at the root and at depth, with everything under it, and leaves the siblings listed.
   - hosting/T299: a skipped name that is a file is not listed; a whole-name match only (`node_modules` does not skip `my_node_modules`).
   - hosting/T300: `links: 'skip'` neither lists nor enters nor errors on a link to a directory; a link to a file lists as `file` under `'skip'` and under `'refuse'`.
   - hosting/T301: a skipped directory is not read: a directory inside it that the host cannot read, or a link to a directory under it, does not fail the listing.
   - hosting/T302: a `skip` that is not a list of strings and a `links` outside the two values are a `TypeError` before anything is read; the result with the options is still sorted.

## Not in this Change

Testing's catalog (Testing's C74); a read option or a synchronous `list`; patterns, depth limits or `.gitignore` handling; any change to `read`'s treatment of links; any version, publication or pin move; `.kaal/hosting`.

## DO

Not authorized by this PLAN. On the merged PLAN, in the collector: add the two options to `list` and `walk`, turn T298 to T302 into delivered Cases beside the C106 listing Cases, add T297, allocate the ids in `04-test/package-check/testing.md`, add the element texts of `interface.md`, update the README and Skill entry for `list`, and run Hosting's suites on all three hosts.

## ACT

The retrospective, in the ACT template's chapters, after the DO.
