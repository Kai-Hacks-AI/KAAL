// kaal-graph: a Node's Form and identity, as the Kernel in Core's payload states them.
// A Node is a Markdown file in UTF-8: a line `---`, frontmatter, a line `---`, LF line
// endings. Its id is the SHA-256 of its exact bytes. Pure: it touches no host.
import { createHash } from "node:crypto";
import { isMap, isScalar } from "yaml";
import { convert, decode, FormError, isId, isName, mappingOf } from "./form.mjs";

export { FormError, isId, isName };

/** SHA-256, hex, of exact bytes. No normalization of any kind. */
export function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

/** Whether the bytes begin like frontmatter, i.e. claim to be a Node. */
export function claimsForm(bytes) {
  return Buffer.from(bytes.subarray(0, 4)).toString("utf8") === "---\n" || Buffer.from(bytes.subarray(0, 5)).toString("utf8") === "---\r\n";
}

const NOT_IN_FORM = "not in Form: a Node begins with `---`, one YAML mapping with a `name` and optionally a `type` (`name`, `id`), and `---`, LF line endings";

/**
 * The Kernel's Form: a line `---`, frontmatter, a line `---`, LF line endings, read as
 * form.mjs reads it. Returns the parsed mapping, with its YAML nodes for the reserved fields.
 */
function frontmatterOf(text) {
  const contents = mappingOf(text, NOT_IN_FORM);
  const reserved = new Map(contents.items.filter((p) => isScalar(p.key) && (p.key.value === "name" || p.key.value === "type")).map((p) => [p.key.value, p.value]));
  return { frontmatter: convert(contents, NOT_IN_FORM), reserved };
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
 * Read an ordinary Node's identity from its exact bytes: { id, name, type, frontmatter },
 * the frontmatter complete, uninterpreted beyond `name` and `type`. The identity
 * is frozen throughout, as its bytes are: nothing in it can be changed.
 * Throws a FormError if the bytes are not in Form, or if they declare no type:
 * an ordinary Node references its type, and only a root declares none.
 */
export function identify(bytes) {
  const node = identity(bytes);
  if (!node.type) throw new FormError(`untyped: ${node.name} declares no type; an ordinary Node references its type, and only a root, read with identifyRoot(), declares none`);
  return node;
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
  const text = decode(bytes, "not UTF-8: a Node is a Markdown file in UTF-8");
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
