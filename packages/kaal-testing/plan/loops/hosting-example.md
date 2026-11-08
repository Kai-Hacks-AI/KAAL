# Loops as a Graph: worked example on kaal-hosting

An illustration, not a Change to Hosting. Hosting keeps its layout and its `.red.mjs` files (D15–D17 included) until a DO lands. In KAAL the consumer of Testing's mechanism is Engineering, so the Loop Declaration sits in Hosting's `04-test/engineering-check/`.

## What lands where

```
packages/kaal-hosting/
  01-intent/            I<n>-<slug>.md            Intent Nodes. No outward Edge.
  02-requirements/
    functional/         F<n>-<slug>.md            serves -> I
    non-functional/     N<n>-<slug>.md            serves -> I
  03-architecture/      A<n>-<slug>.md            realizes -> F or N
  04-test/              every suite has its own Cases in its own loop files; all of them
                        cite items in the shared folders above (01-03, and 06-defects for Defects)
    package-check/      intent, requirements, defects, architecture, hosting .test.mjs
                        (Cases on the installed package; targets I, F/N, D, A, code)
    boundary-check/     the same loop files for Cases on Hosting's boundary
                        (mostly N and A, some F); targets in the same 01-03 folders
    engineering-check/  the same loop files for Cases on how Hosting is built and shipped;
                        targets are Engineering's own Nodes in Engineering's same-named
                        folders (a cross-package outward Edge, for example
                        hosting/T80 [engineering/N5])
                        loops.md  the Loop Declaration (new)
                        plan/ build.mjs publisher/  as today, moving into loop files
  05-src/               code, the innermost answer
  06-defects/           D<n>-<slug>.md   Defect Nodes, next to 02-requirements (the records stay);
                        serves -> I; reveals -> F or N once it exists.
                        Only the .red.mjs Cases move out, into 04-test/*/defects
```

Suites differ in their Cases, not in their items: a loop is a file (or a folder) under each suite, and the item a Case cites always sits in a shared folder (01–03, or `06-defects` for a Defect), Hosting's or, from `engineering-check`, Engineering's. Each loop is a file, or a folder where one file would be too large (`defects/` holds ten Defects' Cases today). The declaration names locations as path prefixes, so either works.

## The declaration (proposal)

`loops.md` is a Node whose frontmatter lists the levels, outermost first:

```yaml
levels:
  - { name: intent,       kinds: [Intent],       locations: [04-test/*/intent] }
  - { name: requirements, kinds: [Functional, Nonfunctional, Defect],
      locations: [04-test/*/requirements, 04-test/*/defects] }
  - { name: architecture, kinds: [Architecture], locations: [04-test/*/architecture] }
  - { name: code,         kinds: [Code],         locations: [04-test/*/hosting] }
```

A location names a loop in any suite (`*` is the suite folder), so the same levels serve `package-check`, `boundary-check` and `engineering-check`; an `engineering-check` Case may cite an Engineering item, which the Graph resolves across packages and which must still be of the Case's own level. Defect sits at the requirements level (it is next to Requirements, testing/F105), so a Defect's Cases may live in their own file without being a fifth level.

## What the parser rejects (testing/F106, testing/F107)

- An Edge in `F45.md` that points at another Functional, at an Architecture element or at a Defect: same or inner level, except Defect to Requirement.
- A Case in any suite's `requirements` file whose title brackets cite `hosting/A26`: the target is of another level.
- A Case in `defects.test.mjs` citing a Requirement other than through its Defect.
- An Architecture Node with a `realizes` Edge to a Node that is not resolved by the Graph: `unknown`.

## Today against the model

- Hosting's `hosting.test.mjs` Cases cite both Requirements and Architecture, such as `hosting/T110 [hosting/F63, hosting/A26]`. Under the model each would point at one code item, and the Requirement and Architecture links are reached by traversal from it. That is a migration of titles, which Owner said is fine.
- The 73 functional bullets, the nonfunctional ones, Intents and Architecture elements become Nodes. This is the item owners' work, mechanical with `kaal-graph`'s `createNode`, and it can proceed loop by loop, since unparsed items give `unknown` and never a pass.
- D5–D14 become Defect Nodes in place in `06-defects/`, and their `.red.mjs` Cases move into `04-test/*/defects`. Answered Defects keep their Cases as regression Cases in place. D15–D17 stay as they are until their PRs merge.

## Open: what is a Code item?

Code is not Markdown, so it cannot carry frontmatter. Either a Code item is a Node written for each module that `realizes` an Architecture element, or Hosting declares a map from `05-src` modules to Architecture elements and Testing derives the Code items from it. The second adds no files and keeps the code unannotated. This PLAN proposes the second and leaves the choice to the Owner.
