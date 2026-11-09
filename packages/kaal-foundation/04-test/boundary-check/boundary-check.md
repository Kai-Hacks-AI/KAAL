# Foundation: Boundary Check

This file is Foundation's Boundary Check record. It ships with the package (`dist/test/boundary-check/`). Foundation's own verification is the Package Check, `npm test`; this is the other half.

## Status

**Applicable.** Foundation owns the byte-level SHA-256 (foundation/I1, foundation/I2). The check finds that being done somewhere else.

## Command

```sh
node node_modules/@kaihacksai/kaal-foundation/dist/test/boundary-check/scan.mjs --target <path>... [--base <dir>]
```

The caller names the targets: a file or a directory, resolved against `--base` (default: the current directory). Foundation names none, so a target added later needs no change here. The last line of standard output is `kaal-foundation-scan {json}`. The result is `complete` or `unknown`, with a coverage of source files read, unreadable paths and skipped directories. The exit is 0 when complete, including with findings, and 2 when unknown. It never exits 1: a finding is not a failure.

## Rules

Each rule reports a place, one finding per source line, with the id `kaal-foundation/<file>:<line>`, the Foundation SHA-256 of the line, and the owner named by the nearest `ownership.kaal.json`.

| Rule | A place where |
| --- | --- |
| `copy` | a file's bytes equal Foundation's `sha256.mjs` or `sha256.d.ts` |
| `implementation` | the SHA-256 round constants are written out |
| `crypto` | the platform is asked for SHA-256, as `createHash("sha256")` or `digest("SHA-256")` |

A directory owned by Foundation is skipped and reported, because the owner holds the thing.

## Two axes

- **package <--> package:** Foundation's scan, pointed at another package, finds Foundation's concern done there. The other packages' own boundary checks, pointed at Foundation, challenge Foundation the same way.
- **package -> consumer:** Foundation's scan, pointed at a consumer repository, finds the same.

Who points the scan, and at what, is the caller's. A promotion runs every package's own check against the others and collects what they report.

## What it does not establish

- A finding is a place to look at. It is not a fault, and the scan ranks nothing.
- It does not find a digest computed some other way, for example with the algorithm held in a variable.
- It reads what is written in source. It never runs it.
- An empty list is no compliance. It says that nothing was found within the stated coverage, and an unknown result says that not everything was read.

## Where findings and decisions live

A finding is audit, held by Engineering and the repository against the finding `id` and `digest`. This package records no finding list and names no decider. Only a consequence of a decision, such as a Defect or a change to Intent, Requirements or Architecture, enters the package, through a Change.
