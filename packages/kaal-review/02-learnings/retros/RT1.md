---
id: review/RT1
format: 4L
reflects: [review/C5]
---
Account of: I am the Review agent who planned `review/C5` (`#2327`) and carried its DO (`#2330`) on collector `kaal/review/review-items`, and wrote this retrospective; Kai as CTO and CPO, the coordinator, Engineering's relayed note and the Codex reviews shaped the Change, and this is my own account.

## Liked
- subject: planned Cases written as plain `T<n>.test.mjs` that assert the thing exists before importing it
  keeps: the five Cases were RED by assertion on the base and went GREEN against the real reader with no Case edited, so they tested the contract and not the throwaway reference.
- subject: answering each Codex finding with a reproduction first, as a RED unit test, then the fix
  keeps: all twelve findings of six rounds were judged on evidence, each fix was proven by a test that failed before it, and none was applied on trust.

## Learned
- subject: how other readers of text trees treat names inherited by every object, and front matter with odd shapes
  searched: I did not look outside the repository for this Change; I relied on what I already knew and cite no source, so nothing from outside is claimed here.

## Lacked
- subject: a way to ask which Case ids are free on main before choosing them
  decision-point: choosing the ids of the three provisional Cases of the PLAN.
  cost: I took `T300` to `T302`, the coordinator warned of clashes, and I renumbered to `T1388` to `T1390` in a second commit and rewrote the PLAN text.
  findable: no
  address: script
- subject: the input shapes and completeness rules of the reader, stated in the PLAN beside its finding kinds
  decision-point: writing `navigate.mjs` from the PLAN's `A2` and the throwaway reference.
  cost: six review rounds and five fix commits for malformed front matter, unperformed executions, prototype-named subjects, carries of another item, incomplete results and untrimmed values, each a gap the PLAN never named.
  findable: no
  address: Skill
- subject: the route for resolving review threads from a cloud session
  decision-point: closing the Codex threads I had answered.
  cost: a GraphQL call was refused and the threads stayed unresolved for several rounds until the refusal named the REST route.
  findable: yes
  address: AGENTS.md

## Longed For
- subject: a general reader of Review item trees that other capabilities can use, once Engineering has placed `review-items` in the layout
  worked-anyway: the reader mirrors the contract and imports nothing from Testing, so nothing was blocked or slowed.

Decisions: none made, the owner decides.
