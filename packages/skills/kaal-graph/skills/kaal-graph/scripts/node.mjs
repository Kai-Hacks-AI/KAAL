// kaal-graph: a Node's Form and identity, as the Kernel in Core's payload states them.
// A Node is a Markdown file in UTF-8: a line `---`, frontmatter, a line `---`, LF line
// endings. Its id is the SHA-256 of its exact bytes. Pure: it touches no host.
import { createHash } from "node:crypto";
import { isAlias, isMap, isScalar, isSeq, parseDocument } from "yaml";

/** Bytes that are not a Node in Form. */
export class FormError extends Error {
  name = "FormError";
}

/** SHA-256, hex, of exact bytes. No normalization of any kind. */
export function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

/** Whether the bytes begin like frontmatter, i.e. claim to be a Node. */
export function claimsForm(bytes) {
  return Buffer.from(bytes.subarray(0, 4)).toString("utf8") === "---\n" || Buffer.from(bytes.subarray(0, 5)).toString("utf8") === "---\r\n";
}

/** A name: on one line (no line break of any kind), with no leading or trailing whitespace. */
const NAME = /^\S(?:[^\n\r\v\f\u0085\u2028\u2029]*\S)?$/u;
const ID = /^[0-9a-f]{64}$/;

/** Whether a value is a name a Node or a reference may have. */
export function isName(value) {
  return typeof value === "string" && NAME.test(value);
}

/** Whether a value is a Node id: lowercase hex SHA-256. */
export function isId(value) {
  return typeof value === "string" && ID.test(value);
}

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
function frontmatterOf(text) {
  if (!text.startsWith("---\n")) throw new FormError(NOT_IN_FORM);
  const close = text.indexOf("\n---\n", 3);
  if (close < 0) throw new FormError(NOT_IN_FORM);
  const source = text.slice(4, close + 1);
  if (source.includes("\r")) throw new FormError(NOT_IN_FORM);
  const doc = parseDocument(source, { version: "1.2", schema: "core", uniqueKeys: true, merge: false, prettyErrors: false });
  if (doc.errors.length || doc.warnings.length) throw new FormError(`${NOT_IN_FORM}: ${[...doc.errors, ...doc.warnings][0].message.split("\n")[0]}`);
  if (!isMap(doc.contents)) throw new FormError(`${NOT_IN_FORM}: the frontmatter is not a mapping`);
  const reserved = new Map(doc.contents.items.filter((p) => isScalar(p.key) && (p.key.value === "name" || p.key.value === "type")).map((p) => [p.key.value, p.value]));
  return { frontmatter: value(doc.contents), reserved };
}

/** Convert a parsed YAML node, refusing anything outside the Form. */
function value(n) {
  if (isAlias(n)) throw new FormError(`${NOT_IN_FORM}: aliases are not allowed`);
  if (n?.anchor) throw new FormError(`${NOT_IN_FORM}: anchors are not allowed`);
  if (n?.tag && !TAGS.has(n.tag)) throw new FormError(`${NOT_IN_FORM}: the tag ${n.tag} is not allowed`);
  if (isScalar(n)) return n.value;
  if (isSeq(n)) return Object.freeze(n.items.map(value));
  if (isMap(n)) {
    const map = {};
    for (const pair of n.items) {
      if (!isScalar(pair.key) || typeof pair.key.value !== "string") throw new FormError(`${NOT_IN_FORM}: every key is a string`);
      if (pair.key.value === "<<") throw new FormError(`${NOT_IN_FORM}: merge keys are not allowed`);
      value(pair.key);
      Object.defineProperty(map, pair.key.value, { value: pair.value === null ? null : value(pair.value), enumerable: true, writable: false, configurable: false });
    }
    return Object.freeze(map);
  }
  if (n === null) return null;
  throw new FormError(NOT_IN_FORM);
}

/**
 * A reserved value, read as written: the scalar's own text, whatever type the
 * core schema would give it, so that a name or an id is never read as a
 * number, a boolean or null. Undefined unless it is a scalar that is a string
 * or carries no tag but `!!str`.
 */
function literal(n) {
  if (!isScalar(n) || (n.tag && n.tag !== "tag:yaml.org,2002:str")) return undefined;
  if (typeof n.value === "string") return n.value;
  return n.type === "PLAIN" && typeof n.source === "string" ? n.source : undefined;
}

/**
 * Read a Node's identity from its exact bytes: { id, name, type?, frontmatter },
 * the frontmatter complete, uninterpreted beyond `name` and `type`. The identity
 * is frozen throughout, as its bytes are: nothing in it can be changed.
 * Throws a FormError if the bytes are not in Form.
 */
export function identify(bytes) {
  return identity(bytes);
}

/**
 * Read a root Node's identity from its exact bytes, as identify() reads any
 * Node: { id, name, frontmatter }, with no type. A root is the one Node of a
 * foundation that declares no type, because the other Nodes' types lead back
 * to it; which Node is a foundation's root is that foundation's owner's to
 * decide, never Graph's. Throws a FormError if the bytes are not in Form, or
 * if they declare a type, which makes them an ordinary Node for identify().
 */
export function identifyRoot(bytes) {
  const node = identity(bytes);
  if (node.type) throw new FormError(`not a root: ${node.name} declares a type, ${node.type.name} (${node.type.id}); read it with identify()`);
  return node;
}

function identity(bytes) {
  let text;
  try {
    text = new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(bytes);
  } catch {
    throw new FormError("not UTF-8: a Node is a Markdown file in UTF-8");
  }
  const { frontmatter: parsed, reserved } = frontmatterOf(text);
  const name = literal(reserved.get("name"));
  if (!isName(name)) throw new FormError(`${NOT_IN_FORM}: \`name\` is a single-line string with no surrounding whitespace`);
  let ref;
  if (reserved.has("type")) {
    const t = reserved.get("type");
    const fields = isMap(t) && [undefined, "tag:yaml.org,2002:map"].includes(t.tag) ? new Map(t.items.map((p) => [isScalar(p.key) ? p.key.value : undefined, literal(p.value)])) : new Map();
    const [tname, tid] = [fields.get("name"), fields.get("id")];
    if (fields.size !== 2 || !isName(tname) || !isId(tid)) throw new FormError(`${NOT_IN_FORM}: \`type\` is a mapping of exactly \`name\` and a lowercase hex SHA-256 \`id\``);
    ref = Object.freeze({ name: tname, id: tid });
  }
  const frontmatter = Object.freeze({ ...parsed, name, ...(ref ? { type: ref } : {}) });
  return Object.freeze({ id: sha256(bytes), name, ...(ref ? { type: ref } : {}), frontmatter });
}
