# C72 interface

Drafts as they are added in the DO. T932 to T936 read them. None of them is on the collector until the DO.

## Draft of I39.md

See `01-intent/I39-collector-promotion-raised/I39.md` of this PLAN (the file is added by the DO; the PLAN carries it only so the Cases can name it).

## Source contract: `05-src/promotion-raise/decide.mjs`

`export function decideRaise(facts)`

facts:

````
{
  collector: 'kaal/<capability>/<concern>',
  aheadOfMain: <number of commits on the collector that main lacks>,
  merged: [ { number, title, body } ],   // merged into the collector, newest first
  open:   [ { number, title, base, head } ]  // open, head is the collector
}
````

returns `{ action: 'skip', reason, detail }` with reason one of `not-a-collector`, `already-open`, `nothing-to-promote`, `not-ready`, `no-change-id`, or `{ action: 'raise', head: <collector>, base: 'main', title, body }`.

## Source contract: `05-src/promotion-raise/cli.mjs`

`node cli.mjs decide` reads the facts as JSON on standard input and prints the decision as JSON on standard output. The file holds no network call, no `gh`, no `git` and no word of an approval or a merge.
