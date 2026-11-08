// Types for node.mjs, a Node's Form and identity, for TypeScript callers. edges.d.ts re-exports them.

export { FormError, isId, isName } from "./form.js";
import type { Frontmatter } from "./form.js";

/** A reference to a Node: the id is the identity, the name is checked by resolving it. */
export interface Ref {
  readonly name: string;
  readonly id: string;
}

/** A Node's identity, frozen throughout as identify() returns it. */
export interface Identity {
  /** SHA-256, lowercase hex, of the exact bytes. */
  readonly id: string;
  readonly name: string;
  /** Absent only for a root, the Node that declares no type, as identifyRoot() returns it. */
  readonly type?: Ref;
  /** The complete frontmatter, `name` and `type` included, frozen throughout. */
  readonly frontmatter: Frontmatter;
}

export function sha256(bytes: string | Uint8Array): string;
export function claimsForm(bytes: Uint8Array): boolean;
/** An ordinary Node's identity, which always references its type. Throws a FormError if the bytes are not in Form or declare no type. */
export function identify(bytes: Uint8Array): Identity & { readonly type: Ref };
/** A root Node's identity: the one Node of a foundation that declares no type. Which Node that is, is the foundation owner's to decide. Throws a FormError if the bytes are not in Form or declare a type. */
export function identifyRoot(bytes: Uint8Array): Identity & { readonly type?: undefined };
