// Types for kaal-graph/form (form.mjs), for TypeScript callers.

/** A frontmatter value, as YAML 1.2's core schema types it. */
export type FrontmatterValue = string | number | boolean | null | readonly FrontmatterValue[] | Frontmatter;

/** A Node's frontmatter, as one mapping. `name` and `type` are interpreted; every other key is whatever capability defines it. */
export interface Frontmatter {
  readonly [key: string]: FrontmatterValue;
}

/** Bytes that are not in Form. */
export class FormError extends Error {}

/** Whether a value is a name a Node or a reference may have. */
export function isName(value: unknown): value is string;
/** Whether a value is a Node id: lowercase hex SHA-256. */
export function isId(value: unknown): value is string;
/** The frontmatter of any Markdown file in Form, a Node or not, frozen throughout and uninterpreted; the body is never read. Throws a FormError if the bytes are not UTF-8 or not in Form. */
export function readFrontmatter(bytes: Uint8Array): Frontmatter;
