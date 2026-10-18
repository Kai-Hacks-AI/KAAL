// Types for kaal-graph's API (edges.mjs and the node.mjs it re-exports), for TypeScript callers.

/** A reference to a Node: the id is the identity, the name is checked by resolving it. */
export interface Ref {
  readonly name: string;
  readonly id: string;
}

/** A frontmatter value, as YAML 1.2's core schema types it. */
export type FrontmatterValue = string | number | boolean | null | readonly FrontmatterValue[] | Frontmatter;

/** A Node's frontmatter, as one mapping. `name` and `type` are interpreted; every other key is whatever capability defines it. */
export interface Frontmatter {
  readonly [key: string]: FrontmatterValue;
}

/** What a Node says about itself, read from its exact bytes. */
/** A Node's identity, frozen throughout as identify() returns it. */
export interface Identity {
  /** SHA-256, lowercase hex, of the exact bytes. */
  readonly id: string;
  readonly name: string;
  /** Absent only for a Node that declares no type. */
  readonly type?: Ref;
  /** The complete frontmatter, `name` and `type` included, frozen throughout. */
  readonly frontmatter: Frontmatter;
}

/** Bytes that are not a Node in Form. */
export class FormError extends Error {}

export function sha256(bytes: string | Uint8Array): string;
export function claimsForm(bytes: Uint8Array): boolean;
export function isName(value: unknown): value is string;
export function isId(value: unknown): value is string;
/** Throws a FormError if the bytes are not in Form. */
export function identify(bytes: Uint8Array): Identity;
/** A root Node's identity: the one Node of a foundation that declares no type. Which Node that is, is the foundation owner's to decide. Throws a FormError if the bytes are not in Form or declare a type. */
export function identifyRoot(bytes: Uint8Array): Identity & { readonly type?: undefined };

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
