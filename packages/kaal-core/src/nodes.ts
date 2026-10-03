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

A KAAL Definition is a Node that gives one concept of KAAL's own vocabulary a shared meaning, so that humans and agents can mean the same thing by it.

A Node is a KAAL Definition exactly when its type refers, by name and ID, to this Node, so KAAL's definitions are found by Node type alone. A KAAL Definition states meaning, not implementation.
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

CASE is the architecture of kaal-core, not of KAAL generally. It distinguishes four dimensions, each with its own responsibility. CASE defines those responsibilities and boundaries, not how any of them is implemented.

## Core

Core establishes KAAL and its shared semantics. It is the foundation for the other dimensions.

## Agent

Agent provides the instruction wiring that connects KAAL to agents.

## Skills

Skills provides the registration through which KAAL Skills can join without becoming Core.

## Extensions

Extensions provides the registration through which KAAL Extensions can join without becoming Core.

The contract of each dimension is left to its own KAAL Definition, where one exists.
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

Core is the foundational dimension of CASE ${ids.CASE}. It establishes KAAL and its shared semantics, and enables the other dimensions: it provides the semantics and the means that Agent instructions and the registration of Skills and Extensions rely on. Their contracts belong to their own definitions. Core says nothing of how it is implemented or delivered.
`;
}
