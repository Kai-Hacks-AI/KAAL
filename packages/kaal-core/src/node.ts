// A Node's Form and identity are Graph's: Core reads Nodes through kaal-graph
// and keeps only what is its own, its error and the order of references.
export { claimsForm, FormError, identify, identifyRoot, sha256, type Frontmatter, type FrontmatterValue, type Identity } from "kaal-graph";
import { FormError, identify, identifyRoot, type Identity } from "kaal-graph";

/**
 * Read a Node's identity from its exact bytes, as Core reads every Node of an
 * Engine: an ordinary Node through Graph's identify(), or else a root, a Node
 * that declares no type, through identifyRoot(). Graph only reads a root; that
 * the one root admitted is this Core's genesis `Node` is Core's decision,
 * made in evaluate() and register(). Throws identify()'s FormError if the
 * bytes are neither.
 */
export function readNode(bytes: Uint8Array): Identity {
  try {
    return identify(bytes);
  } catch (e) {
    if (!(e instanceof FormError)) throw e;
    try {
      return identifyRoot(bytes);
    } catch {
      throw e;
    }
  }
}

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
