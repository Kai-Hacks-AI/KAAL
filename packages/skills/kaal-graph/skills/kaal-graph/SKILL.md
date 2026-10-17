---
name: kaal-graph
description: Check and navigate the relationships between KAAL Nodes, as Edges embedded in each Node's frontmatter. Use when adding a relationship to a Node, checking that a set of Nodes is consistent, or finding what a Node relates to or what relates to it.
license: MIT
compatibility: The script needs Node.js 24 or later and the kaal-graph package's dependencies (kaal-core, kaal-hosting).
---

# Navigating KAAL Nodes

What Graph is, and what this capability means, is stated by the Node `Graph` in a KAAL Engine: read it there, starting from the Engine's `AGENTS.md`. This file only tells you how to do the work.

## Add a relationship

Write the Edge into the frontmatter of the Node it goes out from, in the form in [references/edges.md](references/edges.md). Reference only Nodes that already exist, by name and id (`kaal identify <file>` gives the id). The Node then has new bytes and a new id: it is a new Node.

## Check and navigate

Run this skill's `scripts/graph.mjs`, resolved from this skill's own directory, or the `kaal-graph` command when the package is installed:

- `graph.mjs check <dir>...` reports every malformed or unresolved Edge in the Nodes under the directories. It exits 0 when there is nothing to report and 1 when there is.
- `graph.mjs out <id> <dir>...` lists what the Node with that id relates to, one Edge per line: type, then target.
- `graph.mjs in <id> <dir>...` lists what relates to the Node: type, then source.
- `graph.mjs named <name> <dir>...` lists the Nodes with that name, one per line: id, name, type. A name alone may name several Nodes.
- `graph.mjs resolve <name> <id> <dir>...` prints the Node a reference resolves to, and fails when no Node has the id or the Node has another name.

Work locally: read the Node you need, look at its outgoing types, follow the targets that matter, and stop when you have enough context. You do not need to read the whole graph first.

## Rules

- Never edit a Node to add or change an Edge in place of writing the new Node it becomes.
- A finding is fixed in the Node that carries it. Do not weaken the check to pass.
- `out` and `in` list Edges as declared. Before relying on one as resolved, run `check`: it is what reports a reference to no Node or to a misnamed one.
- Graph gives no relationship a meaning. What an Edge means is stated by the Node its `type` references.
