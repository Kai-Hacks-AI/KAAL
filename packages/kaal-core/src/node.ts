import { createHash } from "node:crypto";
import { isAlias, isMap, isScalar, isSeq, parseDocument } from "yaml";

/** A reference to a Node: the id is the identity, the name is checked by resolving it. */
export interface Ref {
  name: string;
  id: string;
}

/** A frontmatter value: every scalar is read as a string. */
export type FrontmatterValue = string | FrontmatterValue[] | Frontmatter;

/** A Node's frontmatter, as one mapping. Core interprets `name` and `type`; every other key belongs to whatever capability defines it. */
export interface Frontmatter {
  [key: string]: FrontmatterValue;
}

/** What a Node says about itself, read from its exact bytes. */
export interface Identity {
  /** SHA-256, lowercase hex, of the exact bytes. */
  id: string;
  name: string;
  /** Absent only for the genesis Node. */
  type?: Ref;
  /** The complete frontmatter, `name` and `type` included, uninterpreted beyond them. */
  frontmatter: Frontmatter;
}

export class KaalError extends Error {
  override name = "KaalError";
}

/** SHA-256, hex, of exact bytes. No normalization of any kind. */
export function sha256(bytes: string | Uint8Array): string {
  return createHash("sha256").update(bytes).digest("hex");
}

/** Whether the bytes begin like frontmatter, i.e. claim to be a Node. */
export function claimsForm(bytes: Uint8Array): boolean {
  return Buffer.from(bytes.subarray(0, 4)).toString("utf8") === "---\n" || Buffer.from(bytes.subarray(0, 5)).toString("utf8") === "---\r\n";
}

/** A name: on one line (no line break of any kind), with no leading or trailing whitespace. */
const NAME = /^\S(?:[^\n\r\v\f\u0085\u2028\u2029]*\S)?$/u;
const ID = /^[0-9a-f]{64}$/;

const NOT_IN_FORM = "not in Form: a Node begins with `---`, one YAML mapping with a `name` and optionally a `type` (`name`, `id`), and `---`, LF line endings";

/**
 * The Kernel's Form: a line `---`, frontmatter, a line `---`, LF line endings.
 * The frontmatter is one YAML mapping read with the failsafe schema, so every
 * scalar is a string: keys are strings, values are strings, sequences or
 * mappings, and there are no repeated keys, tags, anchors or aliases.
 */
function frontmatterOf(text: string): Frontmatter {
  if (!text.startsWith("---\n")) throw new KaalError(NOT_IN_FORM);
  const close = text.indexOf("\n---\n", 3);
  if (close < 0) throw new KaalError(NOT_IN_FORM);
  const source = text.slice(4, close + 1);
  if (source.includes("\r")) throw new KaalError(NOT_IN_FORM);
  const doc = parseDocument(source, { schema: "failsafe", uniqueKeys: true, merge: false, prettyErrors: false });
  if (doc.errors.length || doc.warnings.length) throw new KaalError(`${NOT_IN_FORM}: ${[...doc.errors, ...doc.warnings][0].message.split("\n")[0]}`);
  if (!isMap(doc.contents)) throw new KaalError(`${NOT_IN_FORM}: the frontmatter is not a mapping`);
  return value(doc.contents) as Frontmatter;
}

/** Convert a parsed YAML node, refusing anything outside the Form. */
function value(n: unknown): FrontmatterValue {
  if (isAlias(n)) throw new KaalError(`${NOT_IN_FORM}: aliases are not allowed`);
  const node = n as { tag?: string; anchor?: string } | null;
  if (node?.tag) throw new KaalError(`${NOT_IN_FORM}: tags are not allowed`);
  if (node?.anchor) throw new KaalError(`${NOT_IN_FORM}: anchors are not allowed`);
  if (isScalar(n)) return String(n.value);
  if (isSeq(n)) return n.items.map(value);
  if (isMap(n)) {
    const map: Frontmatter = {};
    for (const pair of n.items) {
      if (!isScalar(pair.key)) throw new KaalError(`${NOT_IN_FORM}: every key is a string`);
      const key = value(pair.key) as string;
      Object.defineProperty(map, key, { value: pair.value === null ? "" : value(pair.value), enumerable: true, writable: false, configurable: false });
    }
    return Object.freeze(map);
  }
  if (n === null) return "";
  throw new KaalError(NOT_IN_FORM);
}

/** Read a Node's identity from its exact bytes, or throw if the bytes are not in Form. */
export function identify(bytes: Uint8Array): Identity {
  let text: string;
  try {
    text = new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(bytes);
  } catch {
    throw new KaalError("not UTF-8: a Node is a Markdown file in UTF-8");
  }
  const frontmatter = frontmatterOf(text);
  const { name, type } = frontmatter;
  if (typeof name !== "string" || !NAME.test(name)) throw new KaalError(`${NOT_IN_FORM}: \`name\` is a single-line string with no surrounding whitespace`);
  let ref: Ref | undefined;
  if (type !== undefined) {
    const keys = typeof type === "object" && !Array.isArray(type) ? Object.keys(type).sort() : [];
    const t = type as Frontmatter;
    if (keys.join() !== "id,name" || typeof t.name !== "string" || !NAME.test(t.name) || typeof t.id !== "string" || !ID.test(t.id))
      throw new KaalError(`${NOT_IN_FORM}: \`type\` is a mapping of exactly \`name\` and a lowercase hex SHA-256 \`id\``);
    ref = { name: t.name, id: t.id };
  }
  return { id: sha256(bytes), name, ...(ref ? { type: ref } : {}), frontmatter };
}

export function compareRefs(a: Ref, b: Ref): number {
  return a.name < b.name ? -1 : a.name > b.name ? 1 : a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
}
