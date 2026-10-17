import { createHash } from "node:crypto";
import { isAlias, isMap, isScalar, isSeq, parseDocument, type Scalar } from "yaml";

/** A reference to a Node: the id is the identity, the name is checked by resolving it. */
export interface Ref {
  name: string;
  id: string;
}

/** A frontmatter value, as YAML 1.2's core schema types it. */
export type FrontmatterValue = string | number | boolean | null | FrontmatterValue[] | Frontmatter;

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

/** The explicit tags the Form allows: YAML 1.2's core schema, and nothing a parser could read differently. */
const TAGS = new Set(["str", "int", "float", "bool", "null", "seq", "map"].map((t) => `tag:yaml.org,2002:${t}`));

/**
 * The Kernel's Form: a line `---`, frontmatter, a line `---`, LF line endings.
 * The frontmatter is one YAML 1.2 mapping read with the core schema. Keys are
 * strings and never repeat; there are no anchors, aliases or merge keys, and
 * no tag outside the core schema. Returns the parsed mapping, with its YAML
 * nodes for the reserved fields.
 */
function frontmatterOf(text: string): { frontmatter: Frontmatter; reserved: Map<string, unknown> } {
  if (!text.startsWith("---\n")) throw new KaalError(NOT_IN_FORM);
  const close = text.indexOf("\n---\n", 3);
  if (close < 0) throw new KaalError(NOT_IN_FORM);
  const source = text.slice(4, close + 1);
  if (source.includes("\r")) throw new KaalError(NOT_IN_FORM);
  const doc = parseDocument(source, { version: "1.2", schema: "core", uniqueKeys: true, merge: false, prettyErrors: false });
  if (doc.errors.length || doc.warnings.length) throw new KaalError(`${NOT_IN_FORM}: ${[...doc.errors, ...doc.warnings][0].message.split("\n")[0]}`);
  if (!isMap(doc.contents)) throw new KaalError(`${NOT_IN_FORM}: the frontmatter is not a mapping`);
  const reserved = new Map(doc.contents.items.filter((p) => isScalar(p.key) && (p.key.value === "name" || p.key.value === "type")).map((p) => [(p.key as Scalar).value as string, p.value]));
  return { frontmatter: value(doc.contents) as Frontmatter, reserved };
}

/** Convert a parsed YAML node, refusing anything outside the Form. */
function value(n: unknown): FrontmatterValue {
  if (isAlias(n)) throw new KaalError(`${NOT_IN_FORM}: aliases are not allowed`);
  const node = n as { tag?: string; anchor?: string } | null;
  if (node?.anchor) throw new KaalError(`${NOT_IN_FORM}: anchors are not allowed`);
  if (node?.tag && !TAGS.has(node.tag)) throw new KaalError(`${NOT_IN_FORM}: the tag ${node.tag} is not allowed`);
  if (isScalar(n)) return n.value as string | number | boolean | null;
  if (isSeq(n)) return n.items.map(value);
  if (isMap(n)) {
    const map: Frontmatter = {};
    for (const pair of n.items) {
      if (!isScalar(pair.key) || typeof pair.key.value !== "string") throw new KaalError(`${NOT_IN_FORM}: every key is a string`);
      if (pair.key.value === "<<") throw new KaalError(`${NOT_IN_FORM}: merge keys are not allowed`);
      value(pair.key);
      Object.defineProperty(map, pair.key.value, { value: pair.value === null ? null : value(pair.value), enumerable: true, writable: false, configurable: false });
    }
    return Object.freeze(map);
  }
  if (n === null) return null;
  throw new KaalError(NOT_IN_FORM);
}

/**
 * A reserved value, read as written: the scalar's own text, whatever type the
 * core schema would give it, so that a name or an id is never read as a
 * number, a boolean or null. Undefined unless it is a scalar that is a string
 * or carries no tag but `!!str`.
 */
function literal(n: unknown): string | undefined {
  if (!isScalar(n) || (n.tag && n.tag !== "tag:yaml.org,2002:str")) return undefined;
  if (typeof n.value === "string") return n.value;
  return n.type === "PLAIN" && typeof n.source === "string" ? n.source : undefined;
}

/** Read a Node's identity from its exact bytes, or throw if the bytes are not in Form. */
export function identify(bytes: Uint8Array): Identity {
  let text: string;
  try {
    text = new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(bytes);
  } catch {
    throw new KaalError("not UTF-8: a Node is a Markdown file in UTF-8");
  }
  const { frontmatter: parsed, reserved } = frontmatterOf(text);
  const name = literal(reserved.get("name"));
  if (name === undefined || !NAME.test(name)) throw new KaalError(`${NOT_IN_FORM}: \`name\` is a single-line string with no surrounding whitespace`);
  let ref: Ref | undefined;
  if (reserved.has("type")) {
    const t = reserved.get("type");
    const fields = isMap(t) && [undefined, "tag:yaml.org,2002:map"].includes((t as { tag?: string }).tag) ? new Map(t.items.map((p) => [isScalar(p.key) ? p.key.value : undefined, literal(p.value)])) : new Map();
    const [tname, tid] = [fields.get("name"), fields.get("id")];
    if (fields.size !== 2 || tname === undefined || !NAME.test(tname) || tid === undefined || !ID.test(tid))
      throw new KaalError(`${NOT_IN_FORM}: \`type\` is a mapping of exactly \`name\` and a lowercase hex SHA-256 \`id\``);
    ref = { name: tname, id: tid };
  }
  const frontmatter = Object.freeze({ ...parsed, name, ...(ref ? { type: Object.freeze({ ...ref }) } : {}) });
  return { id: sha256(bytes), name, ...(ref ? { type: ref } : {}), frontmatter };
}

export function compareRefs(a: Ref, b: Ref): number {
  return a.name < b.name ? -1 : a.name > b.name ? 1 : a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
}
