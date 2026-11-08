// Types for kaal-graph's API (edges.mjs and the node.mjs it re-exports), for TypeScript callers.
// node.mjs's own types are in node.d.ts, so a copy of node.mjs can ship them alongside it.

export { FormError, isId, isName, readFrontmatter, type Frontmatter, type FrontmatterValue } from "./form.js";
import type { Frontmatter } from "./form.js";
export { claimsForm, identify, identifyRoot, sha256, type Identity, type Ref } from "./node.js";
import type { Identity, Ref } from "./node.js";

export interface Edge {
  readonly type: Ref;
  readonly target: Ref;
}

/** Construct an ordinary Node's exact, canonical bytes; throws a FormError if no type is given or if they would not be a Node in Form with well-formed Edges. Guarantees Form and Edge structure only, not that references resolve or that a relationship is permitted. Writes nothing. */
export function createNode(spec: {
  name: string;
  type: Ref;
  edges?: readonly { type: Ref; targets: readonly Ref[] }[];
  frontmatter?: Frontmatter;
  body?: string;
}): { bytes: Buffer; node: Identity };

export function edgesOf(node: Identity): { edges: Edge[]; problems: string[] };

export class Graph<N extends Identity = Identity> {
  constructor(nodes?: Iterable<N>);
  /** Adds a frozen Node, as identify() returns it; throws a TypeError for one that could still change. */
  add(node: N): this;
  node(id: string): N | undefined;
  resolve(ref: Ref): N | undefined;
  named(name: string): Ref[];
  out(id: string): Edge[];
  in(id: string): { readonly type: Ref; readonly source: Ref }[];
  typed(ref: Ref): Ref[];
  edges(ref: Ref): { readonly source: Ref; readonly target: Ref; readonly type: Ref }[];
  check(): string[];
  traverse(start: string, options?: { direction?: "out" | "in"; type?: string }): Generator<{ id: string; depth: number }>;
}

/** A directed structure of opaque string identities: each identity to the identities it points to. A successor that is not a key has no successors. */
export type Successors = ReadonlyMap<string, Iterable<string>> | Readonly<Record<string, Iterable<string>>>;
/** Every cycle, as the strongly connected components that contain one, members and cycles sorted. O((V + E) log(V + E)), never recursive. */
export function cycles(successors: Successors): readonly (readonly string[])[];
/** `start` and every identity reachable from it, each once, breadth-first along sorted successors. */
export function reach(successors: Successors, start: string): Generator<string, void, undefined>;
/** The predecessors of every identity, sorted, as a read-only relation: Map's reading interface and no way to write. */
export function reverse(successors: Successors): ReadonlyMap<string, readonly string[]>;
