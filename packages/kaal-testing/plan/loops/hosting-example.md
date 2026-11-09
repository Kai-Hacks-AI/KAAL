# Loops as a Graph: worked example on kaal-hosting

An illustration, not a Change to Hosting. Hosting keeps its layout and its `.red.mjs` files (D15–D17 included) until a DO lands. In KAAL the consumer of Testing's mechanism is Engineering, so the Loop Declaration sits in `04-test/engineering-check/loops.md`.

## The idea

Test Cases sit in context, next to the Node they prove. The folder is the loop. `04-test` holds no Cases: its suites are collected from the Cases the context folders define.

## What lands where

```
packages/kaal-hosting/
  01-intent/            I1.md   I1.test.mjs        Intent Node and its Cases
  02-requirements/
    functional/         F4.md   F4.test.mjs        serves -> I
    non-functional/     N5.md   N5.test.mjs        serves -> I
  03-architecture/      A7.md   A7.test.mjs        realizes -> F or N
  04-test/              no Cases. Suites only:
    package-check/      collects the Cases that prove the installed package
    boundary-check/     collects the Cases on Hosting's boundary (mostly N and A)
    engineering-check/  collects the Cases on how Hosting is built and shipped,
                        including Cases citing Engineering's Nodes (for example
                        hosting/T80 [engineering/N5]);  loops.md  the declaration
  05-src/               <module>.ts  <module>.test.mjs   code Cases, citing A*
  06-defects/           D20.md  D20.test.mjs   Defect Node (serves -> I, reveals -> F or N)
                                               and its RED Case. No more .red.mjs.
```

File names above are illustrative: a Node is `<id>-<slug>.md`, and its Case file carries the same id.

## The declaration (proposal)

`loops.md` is a Node whose frontmatter lists the levels, outermost first, and the folders each covers:

```yaml
levels:
  - { name: intent,       kinds: [Intent],       folders: [01-intent] }
  - { name: requirements, kinds: [Functional, Nonfunctional, Defect],
      folders: [02-requirements, 06-defects] }
  - { name: architecture, kinds: [Architecture], folders: [03-architecture] }
  - { name: code,         kinds: [Code],         folders: [05-src] }
```

Defect sits at the requirements level (next to Requirements, testing/F105), so `06-defects` is a folder of that level, not a fifth level.

## Suites: computed and judged

Building suites is an art. It is a Testing Skill capability on the BASS ladder (Bare, Agent instructions, Skill, Script):
- **Computed** by scripts in the Skill: walk Intent, Requirements, Architecture and select Cases by trace. For example, an Architecture element's Cases plus those of everything it realizes, or the Cases of a Requirement subtree. A well-organized graph lets most of it be computed. Where the graph is incomplete the result is `unknown`.
- **Judged** by the Skill, an Agent or even bare: what the graph cannot decide, such as which Cases make a coherent boundary suite. The judgment is stated and kept apart from the computed part.

## What the parser rejects (testing/F106, testing/F107)

- An Edge in `F4.md` that points at another Functional, an Architecture element or a Defect: same or inner level, except Defect to Requirement.
- A Case file in a folder no level covers, or with no item of its name beside it.
- A Case in `02-requirements/functional/F4.test.mjs` whose brackets cite `hosting/A7`: another level.
- An `engineering-check` Case citing an Engineering Node of an inner level, or one the Graph does not resolve (`unknown`).

## Today against the model

- Cases today live in `04-test/package-check/*.test.mjs` by loop, and cite both Requirements and Architecture (`hosting/T110 [hosting/F63, hosting/A26]`). Each would move beside the item it proves and cite only that item.
- The 73 functional bullets, the nonfunctional ones, Intents and Architecture elements become Nodes: the item owners' work, mechanical with `kaal-graph`'s `createNode`, loop by loop, since unparsed items give `unknown` and never a pass.
- D5–D14 keep their Nodes in `06-defects/`; their `.red.mjs` Cases become `D<n>.test.mjs` beside them. Answered Defects keep their Cases there as regression Cases. D15–D17 stay as they are until their PRs merge.

## Open

How a collector tells a Case's suite (package or boundary): Node frontmatter on the item, or a mark on the Case. Not decided here.
