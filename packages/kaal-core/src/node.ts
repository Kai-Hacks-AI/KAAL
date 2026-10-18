// A Node's Form and identity are Graph's: Core reads Nodes through kaal-graph
// and keeps only what is its own, its error and the order of references.
export { claimsForm, FormError, identify, sha256, type Frontmatter, type FrontmatterValue, type Identity } from "kaal-graph";

/** A reference to a Node: the id is the identity, the name is checked by resolving it. */
export interface Ref {
  name: string;
  id: string;
}

export class KaalError extends Error {
  override name = "KaalError";
}

export function compareRefs(a: Ref, b: Ref): number {
  return a.name < b.name ? -1 : a.name > b.name ? 1 : a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
}
