# Directory Listing and Scratch Directory: Testing

The planned outer tests will live in `packages/kaal-hosting/test/plan/directory-listing.test.mjs`, added in a RED Change and immutable to DO and CHECK afterwards. They reach Hosting through its build by path, never through the package name. Fixtures are built in a temporary directory.

| Test | Checks | Loop |
| --- | --- | --- |
| hosting/T129: `list` returns files and directories with `/`-separated relative paths in UTF-16 order, a directory before what it holds; an empty directory is listed as `directory`; the directory itself is not listed; a missing directory lists as empty | hosting/F72 | Requirements |
| hosting/T130: a link to a file lists as `file`; a link or junction to a directory is refused with `INVALID_PATH` and nothing is listed; a path that is a file is refused with `NOT_DIRECTORY`; `list` reads no bytes (an unreadable file is still listed) and takes no lock | hosting/F72 | Requirements |
| hosting/T131: `scratch` hands `use` an absolute path to a fresh empty directory; folders and files `use` creates are removed afterwards; the value `use` resolved with is returned | hosting/F73 | Requirements |
| hosting/T132: when `use` rejects, the directory is still removed and `use`'s own error is the one thrown; a removal failure is `SCRATCH_LEFTOVER` naming the path and never replaces `use`'s error; two concurrent calls get different directories | hosting/F73 | Requirements |
| hosting/T133: `list` and `scratch` are exported from the main entry and declared in the interface table; the package adds no runtime dependency and loads no `node:test` | hosting/F74, hosting/N10 | Architecture |

hosting/A32 to hosting/A34 are placements, validated by review. The existing read-operation Cases (hosting/T1 to hosting/T20 family) keep passing without edit: sharing the walk must not change what `read` returns or refuses, which is their regression coverage.

## RED evidence

None yet: this Change adds no test files. The RED Change will add `directory-listing.test.mjs` and record the failing run.
