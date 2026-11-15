// kaal-graph: the Form's frontmatter, read from exact bytes. A line `---`, one YAML 1.2
// mapping, a line `---`, LF line endings. Imports no host module, so a pure caller can read
// frontmatter without taking on anything else of Graph's.
import { isAlias, isMap, isScalar, isSeq, parseDocument } from "yaml";

/** Bytes that are not in Form. */
export class FormError extends Error {
  name = "FormError";
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

const NOT_IN_FORM = "not in Form: frontmatter is a line `---`, one YAML mapping, and a line `---`, LF line endings";

/** The explicit tags the Form allows: YAML 1.2's core schema, and nothing a parser could read differently. */
const TAGS = new Set(["str", "int", "float", "bool", "null", "seq", "map"].map((t) => `tag:yaml.org,2002:${t}`));

/** The bytes as UTF-8 text, or a FormError with the given message. */
export function decode(bytes, message) {
  try {
    return new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(bytes);
  } catch {
    throw new FormError(message);
  }
}

/**
 * The frontmatter's YAML mapping node, read with the core schema. Keys are strings and never
 * repeat; there are no anchors, aliases or merge keys, and no tag outside the core schema
 * (checked by convert). Anything else throws a FormError with the given message.
 */
export function mappingOf(text, message) {
  if (!text.startsWith("---\n")) throw new FormError(message);
  const close = text.indexOf("\n---\n", 3);
  if (close < 0) throw new FormError(message);
  const source = text.slice(4, close + 1);
  if (source.includes("\r")) throw new FormError(message);
  const doc = parseDocument(source, { version: "1.2", schema: "core", uniqueKeys: true, merge: false, prettyErrors: false });
  if (doc.errors.length || doc.warnings.length) throw new FormError(`${message}: ${[...doc.errors, ...doc.warnings][0].message.split("\n")[0]}`);
  if (!isMap(doc.contents)) throw new FormError(`${message}: the frontmatter is not a mapping`);
  return doc.contents;
}

/** Convert a parsed YAML node to a frozen value, refusing anything outside the Form. */
export function convert(n, message) {
  if (isAlias(n)) throw new FormError(`${message}: aliases are not allowed`);
  if (n?.anchor) throw new FormError(`${message}: anchors are not allowed`);
  if (n?.tag && !TAGS.has(n.tag)) throw new FormError(`${message}: the tag ${n.tag} is not allowed`);
  if (isScalar(n)) return n.value;
  if (isSeq(n)) return Object.freeze(n.items.map((item) => convert(item, message)));
  if (isMap(n)) {
    const map = {};
    for (const pair of n.items) {
      if (!isScalar(pair.key) || typeof pair.key.value !== "string") throw new FormError(`${message}: every key is a string`);
      if (pair.key.value === "<<") throw new FormError(`${message}: merge keys are not allowed`);
      convert(pair.key, message);
      Object.defineProperty(map, pair.key.value, { value: pair.value === null ? null : convert(pair.value, message), enumerable: true, writable: false, configurable: false });
    }
    return Object.freeze(map);
  }
  if (n === null) return null;
  throw new FormError(message);
}

/**
 * Read the frontmatter of any Markdown file in Form, a Node or not: the complete mapping,
 * frozen throughout, with nothing interpreted. The body is never read. Throws a FormError
 * if the bytes are not UTF-8 or not in Form.
 */
export function readFrontmatter(bytes) {
  return convert(mappingOf(decode(bytes, "not UTF-8: frontmatter is read from UTF-8"), NOT_IN_FORM), NOT_IN_FORM);
}
