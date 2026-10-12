import { createHash } from "node:crypto";

/** A reference to a Node: the id is the identity, the name is checked by resolving it. */
export interface Ref {
  name: string;
  id: string;
}

/** What a Node says about itself, read from its exact bytes. */
export interface Identity {
  /** SHA-256, lowercase hex, of the exact bytes. */
  id: string;
  name: string;
  /** Absent only for the genesis Node. */
  type?: Ref;
}

export class KaalError extends Error {
  override name = "KaalError";
}

/** SHA-256, hex, of exact bytes. No normalization of any kind. */
export function sha256(bytes: string | Uint8Array): string {
  return createHash("sha256").update(bytes).digest("hex");
}

/**
 * The Kernel's Form, exactly: `---`, `name: <name>`, optionally `type:` with
 * indented `name:` and `id:` lines, `---`. LF line endings only; a name has
 * no leading or trailing whitespace. Nothing else is a Form.
 */
const FORM = /^---\nname: (\S(?:[^\n]*\S)?)\n(?:type:\n {2}name: (\S(?:[^\n]*\S)?)\n {2}id: ([0-9a-f]{64})\n)?---\n/;

/** Whether the bytes begin like frontmatter, i.e. claim to be a Node. */
export function claimsForm(bytes: Uint8Array): boolean {
  return Buffer.from(bytes.subarray(0, 4)).toString("utf8") === "---\n" || Buffer.from(bytes.subarray(0, 5)).toString("utf8") === "---\r\n";
}

/** Read a Node's identity from its exact bytes, or throw if the bytes are not in Form. */
export function identify(bytes: Uint8Array): Identity {
  let text: string;
  try {
    text = new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(bytes);
  } catch {
    throw new KaalError("not UTF-8: a Node is a Markdown file in UTF-8");
  }
  const form = FORM.exec(text);
  if (!form) throw new KaalError("not in Form: a Node begins with frontmatter of `name` and optionally `type` (`name`, `id`), LF line endings");
  const [, name, typeName, typeId] = form;
  return { id: sha256(bytes), name, ...(typeName ? { type: { name: typeName, id: typeId } } : {}) };
}

export function compareRefs(a: Ref, b: Ref): number {
  return a.name < b.name ? -1 : a.name > b.name ? 1 : a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
}
