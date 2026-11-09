---
provider: Foundation
tests:
  - id: copy
    detector: file-identity
    equals: [../../skills/kaal-foundation/scripts/sha256.mjs, ../../skills/kaal-foundation/scripts/sha256.d.ts]
    tests: foundation/I1
    ships: true
    looks-for: a file whose bytes equal Foundation's sha256.mjs or sha256.d.ts
  - id: implementation
    detector: token-sequence
    tokens: ["0x428a2f98", "0x71374491"]
    window: 3
    tests: foundation/I1
    ships: true
    looks-for: the first two SHA-256 round constants written together, or the second within the next three lines
  - id: crypto
    detector: call-with-literal
    callee: [createHash, digest]
    literal: [sha256, sha-256]
    tests: foundation/I1
    ships: true
    looks-for: the platform asked for SHA-256, as createHash("sha256") or digest("SHA-256")
---

# Foundation: Boundary Tests

This file is Foundation's Boundary Test definition. It ships with the package (`dist/test/boundary-check/`). Foundation's own verification is the Package Check, `npm test`; this is the other half: what Foundation owns, so that others should not do it.

## Status

**Applicable.** Foundation owns the byte-level SHA-256 (foundation/I1, foundation/I2). These tests find that being done somewhere else.

## Who runs it

Foundation owns **what to detect** and ships no scanner. Engineering owns **how**: the Boundary Engine in the KAAL repository loads this definition, walks the targets the caller names, and reports the evidence. Foundation names no target, so a target added later needs no change here. The repository decides what a finding means.

```sh
node engineering/boundary/engine.mjs --tests node_modules/@kaihacksai/kaal-foundation/dist/test/boundary-check/boundary-check.md --target <path>... [--base <dir>]
```

The last line of standard output is `kaal-boundary-scan {json}`. The result is `complete` or `unknown`, with a coverage of source files read, unreadable paths and skipped directories. The exit is 0 when complete, including with findings, and 2 when unknown. It never exits 1: a finding is not a failure.

## The tests

The front matter above is the definition. Each test is typed, and the engine refuses anything it does not know; the definition holds no code and no regular expression.

| Test | Detector | A place where |
| --- | --- | --- |
| `copy` | `file-identity` | a file's bytes equal Foundation's `sha256.mjs` or `sha256.d.ts` shipped beside this file (the place is line 1) |
| `implementation` | `token-sequence` | the SHA-256 round constants `0x428a2f98` and `0x71374491` are written out together, or the second follows the first within three lines (the place is the line of the first) |
| `crypto` | `call-with-literal` | the platform is asked for SHA-256, as `createHash("sha256")` or `digest("SHA-256")`, in any quote form and letter case, with or without the hyphen |

A place is reported once, as the first test above that matches it. Each finding has the id `Foundation/<file>:<line>`, the Foundation SHA-256 of the line, and the owner named by the nearest `ownership.kaal.json`. A directory owned by Foundation is skipped and reported, because the owner holds the thing. Each test carries a `tests` edge to the Node it checks and a `ships` flag.

## Two axes

- **package <--> package:** the engine, given this definition and pointed at another package, finds Foundation's concern done there. The other packages' own definitions, given to the same engine and pointed at Foundation, challenge Foundation the same way.
- **package -> consumer:** this definition says what Foundation's concern looks like. Who points it at what is the caller's.

A promotion runs every package's definition against the others and collects what they report.

## What it does not establish

- A finding is a place to look at. It is not a fault, and nothing here ranks it.
- It does not find a digest computed some other way, for example with the algorithm held in a variable.
- It reads what is written in source. It never runs it.
- The `crypto` test is lexical evidence, not proof of an executable call. It matches a call by its whole name (so `crypto.createHash(...)` matches and `myDigest(...)` does not) when the first argument is exactly the quoted literal; the same text in a comment or a string also matches.
- An empty list is no compliance. It says that nothing was found within the stated coverage, and an unknown result says that not everything was read.

## Where findings and decisions live

A finding is audit, held by Engineering and the repository against the finding `id` and `digest`. This package records no finding list and names no decider. Only a consequence of a decision, such as a Defect or a change to Intent, Requirements or Architecture, enters the package, through a Change.
