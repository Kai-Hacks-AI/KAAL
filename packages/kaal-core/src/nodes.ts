// The foundation Nodes. Paths are deployment locations only: a Node's bytes
// say nothing about where it is stored. Each Node refers to the Nodes it
// depends on by name and ID, so they are born in dependency order and the IDs
// are recorded by seal-kaal-bootstrap (seals.ts).

/** What a Node's text may refer to: the recorded IDs of the Nodes already born. */
export interface Ids {
  Node: string;
  Edge: string;
  "Component Of": string;
  "KAAL Definition": string;
  CASE: string;
  /** SHA-256 of the Kernel's exact bytes. */
  Kernel: string;
}

/** Where Node 1, `Node`, is deployed, relative to the KAAL directory. */
export const NODE_PATH = "core/Node.md";

/** Where Node 2, `Edge`, is deployed, relative to the KAAL directory. */
export const EDGE_PATH = "core/Edge.md";

export const COMPONENT_OF_PATH = "core/Component-Of.md";
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

/** A kind of Edge, so typed by Edge. */
export function componentOfMarkdown(ids: Ids): string {
  return `---
name: Component Of
type:
  name: Edge
  id: ${ids.Edge}
---

# Component Of

Component Of is an Edge. \`source ──Component Of──> target\` says that the source is a component of the target: a part of the whole that the target stands for. The direction runs from part to whole. It is not symmetric: it does not make the target a component of the source.

The source Node declares the relationship, as an Edge requires, and only after the target is sealed. The declaration is one line of the source's text that names Component Of and then the target, each by name and immutable ID:

\`Component Of <ID of Component Of> -> <name of target> <ID of target>\`

The line is written in the source alone. Nothing is written into the target, and the target's ID does not change, so the target is neither mutated nor redefined by having components. For the same reason a relationship cannot be changed or retargeted in place: a different relationship is a different source Node, born with a new ID. A Node cannot name its own ID, so it cannot be a component of itself.

Component Of says only that. It does not mean that the source inherits from the target, that the target owns the source, that either contains the other in any directory or package, that one depends on the other when running, or that the target controls the source's lifecycle. It does not make a component of the source a component of the target.
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

A KAAL Definition is a Node that gives one concept of KAAL's own vocabulary a meaning of its own, independent of any implementation. A Node is a KAAL Definition exactly when its type refers, by name and ID, to this Node. So "what are KAAL's definitions?" is answered by Node type alone: they are the Nodes typed directly by this Node, and no other Node, whatever it is named or wherever it is stored.

A KAAL Definition states its concept in what a party outside it can observe, so that a challenge to any implementation claiming the concept can be derived from the Node alone. It is a Node and nothing more: this Node classifies nothing further, ranks no definition above another, and does not pass its meaning on to Nodes that are only related to a definition.
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

A CASE is the whole that KAAL's components together make up. It is a concept only. It is defined by the components that declare themselves Component Of it, never by a list of its own: this Node names no component and carries no component's meaning, so a component joining it changes nothing here. A CASE says nothing about how its components are stored, packaged, installed or run.
`;
}

/**
 * The foundation, defined by what can be observed of its payload so that a
 * black-box challenge can be derived from this text alone. It pins every other
 * foundation Node, and the Kernel, by exact identity.
 */
export function coreMarkdown(ids: Ids): string {
  return `---
name: Core
type:
  name: KAAL Definition
  id: ${ids["KAAL Definition"]}
---

# Core

Core is KAAL's foundation: the Kernel and the first Nodes born from it, sealed, handed out together as one payload. It is defined here by what a party can observe of that payload, so that an implementation claiming to be Core can be challenged without reading how it was made. How Core is handed out, as a function, a command or an archive, is not part of its meaning.

## Payload

A payload is a set of files. Each file has a path relative to the KAAL directory and exact bytes. The payload of Core is the same every time it is asked for, and it holds exactly the Kernel, the Nodes listed below, and one admission record for each of those Nodes. It holds no other file.

## Kernel

The Kernel is the one file of the payload, outside \`seals\`, that is not a Node: it does not begin with the frontmatter that declares a Form. Its first line is \`# Kernel\`, its headings, at every level, are in order Kernel, Node, Immutability, Form and Edge, and the SHA-256 of its exact bytes is ${ids.Kernel}. It is genesis: it is sealed apart from the Nodes, and no admission record is kept for it.

## Nodes

Core carries exactly these six Nodes. Each is declared by Form, and its ID is the SHA-256 of its exact bytes.

- Node ${ids.Node}
- Edge ${ids.Edge}
- Component Of ${ids["Component Of"]}
- KAAL Definition ${ids["KAAL Definition"]}
- CASE ${ids.CASE}
- Core, this Node. It cannot name its own ID, so it is the one carried Node whose declared name is Core.

Each Node's declared name is the name listed, compared exactly. The carried Node named Core is, byte for byte, the Node this text belongs to: whoever hands a challenger this Node has handed over Core's identity, which the Node cannot state itself. A Node is recognised by Form and by its bytes, never by where it is stored: moving a file without changing its bytes changes neither which Node it is nor anything that refers to it. No Node contains its own ID.

## Admission

For each of the six Nodes the payload holds one admission record: an empty file named by the Node's ID alone, as 64 lowercase hexadecimal digits with no extension, in the directory \`seals\` at the root of the KAAL directory. There is a record for each of the six and for no other ID. A Node whose bytes differ at all, however slightly, is a different Node with a different ID, and it is not admitted until it is sealed itself. A payload carrying such a Node in place of a listed one is not Core.

## Types

Only Node declares no type. The type of every other carried Node is a reference, by name and ID, to a Node carried here.

- Edge and KAAL Definition are typed by Node.
- Component Of is typed by Edge.
- CASE and Core are typed by KAAL Definition.

So in this Core the KAAL Definitions, the Nodes typed by KAAL Definition, are exactly CASE and Core.

## Relationship

Core is a component of CASE:

Component Of ${ids["Component Of"]} -> CASE ${ids.CASE}

That line is the whole relationship. It is part of this Node and changes nothing in CASE: CASE keeps its bytes and its ID, and CASE does not mention Core. A relationship line is a line that begins with a name, a space, a 64-digit ID and \`->\`. The payload holds exactly one, the line above; lines in Nodes that merely describe the form of such a line do not begin that way. The relationship is carried only by this Node, so it holds only for the exact CASE named here: a changed CASE is a different Node and is not the target.

## What is not Core

A payload is not Core if any of these holds: a listed Node is missing, another Node is present, or a Node's bytes differ from the Node listed; an admission record is missing, extra or not empty, or is kept for the Kernel; the Kernel differs, declares a Form, or is not exactly one file; a Node's type does not resolve to the carried Node it names, or a name does not match the Node it resolves to; the relationship is missing, reversed, retargeted or unresolvable; any other file is present; or two requests for the payload differ.
`;
}
