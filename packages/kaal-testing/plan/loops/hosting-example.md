# Loops as a Graph: worked example on kaal-hosting

An illustration, not a Change to Hosting. Hosting keeps its layout and its `.red.mjs` files (D15–D17 included) until a DO lands. In KAAL the consumer of Testing's mechanism is Engineering, so the Loop Declaration sits in Hosting's `04-test/engineering-check/`.

## What lands where

```
packages/kaal-hosting/
  01-intent/            I<n>-<slug>.md            Intent Nodes. No outward Edge.
  02-requirements/
    functional/         F<n>-<slug>.md            serves -> I
    non-functional/     N<n>-<slug>.md            serves -> I
    defects/            D<n>-<slug>.md            Defect Nodes (from 06-defects/D*.md)
                                                  serves -> I; reveals -> F or N once it exists
  03-architecture/      A<n>-<slug>.md            realizes -> F or N
  04-test/
    package-check/      intent.test.mjs           Cases targeting I
                        requirements.test.mjs     Cases targeting F, N
                        defects.test.mjs          Cases targeting D (from 06-defects/*.mjs)
                        architecture.test.mjs     Cases targeting A
                        hosting.test.mjs          Cases targeting code (inner loop)
    boundary-check/     unchanged
    engineering-check/  loops.md                  the Loop Declaration (new)
                        plan/ build.mjs publisher/  unchanged
  05-src/               code, the innermost answer
  06-defects/           retired when the DO lands
```

Each loop is a file, or a folder where one file would be too large (`defects/` holds ten Defects' Cases today). The declaration names locations as path prefixes, so either works.

## The declaration (proposal)

`loops.md` is a Node whose frontmatter lists the levels, outermost first:

```yaml
levels:
  - { name: intent,       kinds: [Intent],       locations: [04-test/package-check/intent.test.mjs] }
  - { name: requirements, kinds: [Functional, Nonfunctional, Defect],
      locations: [04-test/package-check/requirements.test.mjs, 04-test/package-check/defects.test.mjs] }
  - { name: architecture, kinds: [Architecture], locations: [04-test/package-check/architecture.test.mjs] }
  - { name: code,         kinds: [Code],         locations: [04-test/package-check/hosting.test.mjs] }
```

Defect sits at the requirements level (it is next to Requirements, testing/F105), so a Defect's Cases may live in their own file without being a fifth level.

## What the parser rejects (testing/F106, testing/F107)

- An Edge in `F45.md` that points at another Functional, at an Architecture element or at a Defect: same or inner level, except Defect to Requirement.
- A Case in `requirements.test.mjs` whose title brackets cite `hosting/A26`: the target is of another level.
- A Case in `defects.test.mjs` citing a Requirement other than through its Defect.
- An Architecture Node with a `realizes` Edge to a Node that is not resolved by the Graph: `unknown`.

## Today against the model

- Hosting's `hosting.test.mjs` Cases cite both Requirements and Architecture, such as `hosting/T110 [hosting/F63, hosting/A26]`. Under the model each would point at one code item, and the Requirement and Architecture links are reached by traversal from it. That is a migration of titles, which Owner said is fine.
- The 73 functional bullets, the nonfunctional ones, Intents and Architecture elements become Nodes. This is the item owners' work, mechanical with `kaal-graph`'s `createNode`, and it can proceed loop by loop, since unparsed items give `unknown` and never a pass.
- D5–D14 become Defect Nodes with their `.red.mjs` Cases moved into `defects.test.mjs`. Answered Defects keep their Cases as regression Cases in place. D15–D17 stay as they are until their PRs merge.

## Open: what is a Code item?

Code is not Markdown, so it cannot carry frontmatter. Either a Code item is a Node written for each module that `realizes` an Architecture element, or Hosting declares a map from `05-src` modules to Architecture elements and Testing derives the Code items from it. The second adds no files and keeps the code unannotated. This PLAN proposes the second and leaves the choice to the Owner.
