# kaal-change

KAAL Change: the capability for orchestrating the work around a Change: what a Change is, what makes it self-contained, and how its distributed work is coordinated toward integration, independent of any technology that carries it. It is not part of Core. Core provides the `KAAL Capability` and `KAAL Definition` types and admission, and this capability joins through them.

```
capability/Change.md              the Capability Node, typed by Core's KAAL Capability
capability/Change-Definition.md   the Change Definition, typed by KAAL Definition: meaning and self-containment
capability/Change-Lifecycle.md    the Change Lifecycle Definition, typed by KAAL Definition: a Change's states, read from facts
capability/Change-Record.md       the Change Record Definition, typed by KAAL Definition: where a Change's supporting material lives
capability/CHAOS.md               the CHAOS Definition, typed by KAAL Definition: Changes Help Agents Organize Systematically
lib/lifecycle.mjs                 the lifecycle reader: kaal-change/lifecycle
lib/record.mjs                    the record path syntax and numbering, under a chosen root: kaal-change/record
ownership.kaal.json               Change's own ownership claim (repository data, not delivered)
```

## Responsibilities

A Change coordinates engineering's concerns (GLUE's Describe Intent, Define Requirements, Design Architecture, Develop Code, Do IT and Detect Defects) without owning them. It uses Testing for verification and Review for validation, and references their evidence and judgments. Change defines the available ways to manage Changes, and a repository that embeds KAAL chooses which it applies and how strictly. Its record, `<root>/<capability>/YY/MM/DD/CC/` under a root the consuming context chooses (`.kaal/changes/` in KAAL's own repository), holds supporting material and references the work, which stays with its owners. The path is an address, not an identity, and Core admits nothing from it. A pull request is one realization of a Change, and integrating a Change never proves that the Intent it realizes achieved its Outcome.

## Register the Nodes

```sh
npx kaal register capability change node_modules/kaal-change/capability    # Core decides
```

## License

MIT. See `LICENSE`. The license covers this package's contents only.
