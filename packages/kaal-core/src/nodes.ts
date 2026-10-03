// The foundation Nodes. Paths are deployment locations only: a Node's bytes
// say nothing about where it is stored. Each Node refers to the Nodes it
// depends on by name and ID, so they are born in dependency order and the IDs
// are recorded by seal-kaal-bootstrap (seals.ts).

/** What a Node's text may refer to: the recorded IDs of the Nodes already born. */
export interface Ids {
  Node: string;
  Edge: string;
  "KAAL Definition": string;
  CASE: string;
}

/** Where Node 1, `Node`, is deployed, relative to the KAAL directory. */
export const NODE_PATH = "core/Node.md";

/** Where Node 2, `Edge`, is deployed, relative to the KAAL directory. */
export const EDGE_PATH = "core/Edge.md";

export const KAAL_DEFINITION_PATH = "core/KAAL-Definition.md";
export const CASE_PATH = "core/CASE.md";
export const CORE_PATH = "core/Core.md";

export function nodeMarkdown(): string {
  return `---
name: Node
---

# Node

A Node is a unit of meaning, written as one Markdown file whose YAML frontmatter declares it a Node. It refers to other Nodes only by name and immutable ID, never by location, and it knows nothing of where it is stored.

Node 1 is the genesis exception: it cannot refer to itself, so it declares no type. Every later Node declares \`type\`, a reference to the Node that defines what a Node is.

Once sealed, a Node never changes. Its ID is the SHA-256 of its exact bytes, so the same bytes are the same Node wherever they live.
`;
}

/** Node 2 is typed by Node 1, so it carries Node 1's ID, frozen. */
export function edgeMarkdown(ids: Ids): string {
  return `---
name: Edge
type:
  name: Node
  id: ${ids.Node}
---

# Edge

An Edge is a pointer from one Node to others. The Node that declares it is the source. It points only to Nodes that are already sealed, and it refers to each by a pair: its name and its immutable ID. The ID is the identity, and the name can be checked by resolving that exact Node. An Edge never refers to where a Node is stored, and nothing is changed in the Nodes it points at.
`;
}

/** A Node typed directly by Node: the vocabulary KAAL gives independent meaning. */
export function kaalDefinitionMarkdown(ids: Ids): string {
  return `---
name: KAAL Definition
type:
  name: Node
  id: ${ids.Node}
---

# KAAL Definition

A KAAL Definition is a Node that gives one concept of KAAL's own vocabulary a meaning of its own, so that requirements, architecture, tests and agents can all mean the same thing by it. A Node is a KAAL Definition exactly when its type refers, by name and ID, to this Node. So "what are KAAL's definitions?" is answered by Node type alone: they are the Nodes typed directly by this Node.

A KAAL Definition states meaning, not implementation. This Node classifies nothing further.
`;
}

/** A KAAL Definition, so typed by KAAL Definition. */
export function caseMarkdown(ids: Ids): string {
  return `---
name: CASE
type:
  name: KAAL Definition
  id: ${ids["KAAL Definition"]}
---

# CASE

CASE is the architecture of KAAL. It distinguishes four dimensions:

- Core bootstraps KAAL.
- Agent connects KAAL to agents.
- Skills enable KAAL Skills.
- Extensions enable KAAL Extensions.

CASE defines the shared architectural meaning of these dimensions, not how any of them is implemented. A dimension becomes a KAAL Definition of its own when it is worked on; until then it is named here only.
`;
}

/** A KAAL Definition that refers to CASE, so born after it. */
export function coreMarkdown(ids: Ids): string {
  return `---
name: Core
type:
  name: KAAL Definition
  id: ${ids["KAAL Definition"]}
---

# Core

Core is the bootstrapping dimension of CASE ${ids.CASE}. It provides the minimum semantics from which KAAL can establish itself, and nothing that belongs to another dimension. It says nothing of how it is implemented or delivered.
`;
}
