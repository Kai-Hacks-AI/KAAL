// Reads the Release management records with the Markdown parser (commonmark), never with a regex over the raw file.
// Shared by the documentation Cases: the Delivery Cases in this folder and the Change Cases in ../00-changes.
//
// A record id is DEFINED where a heading, the leading strong text of a list item or paragraph, or the first cell of a
// table row carries it, and REFERENCED anywhere else (documentation-architecture-plan.md, criterion 5).
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Parser } from "commonmark";

const HERE = dirname(fileURLToPath(import.meta.url));
export const AREA = resolve(HERE, "..");
export const ROOT_DOCUMENTS = ["README.md", "01-intent/intent.md", "02-requirements/requirements.md", "03-architecture/architecture.md", "04-test/testing.md"];

const ID = /(?:release-management\/)?\b([IFGTA]\d+)\b/g;
const SCOPE = /^release-management\//;

export function parseFile(relative, base = AREA) {
  return new Parser().parse(readFileSync(join(base, relative), "utf8"));
}

/** All nodes of a type, in document order. */
export function nodes(root, ...types) {
  const out = [];
  const walker = root.walker();
  for (let e = walker.next(); e; e = walker.next()) if (e.entering && types.includes(e.node.type)) out.push(e.node);
  return out;
}

/** The text a node holds, links and code included, as one string. */
export function textOf(node) {
  const parts = [];
  const walker = node.walker();
  for (let e = walker.next(); e; e = walker.next()) {
    const n = e.node;
    if (!e.entering) continue;
    if (n.type === "text" || n.type === "code" || n.type === "code_block" || n.type === "html_inline") parts.push(n.literal);
    else if (n.type === "softbreak" || n.type === "linebreak") parts.push(" ");
  }
  return parts.join("").replace(/\s+/g, " ").trim();
}

/** The strong text a block starts with, or "" when it does not start with one. */
export function leadingStrong(block) {
  const first = block.firstChild;
  if (!first || first.type !== "paragraph") return "";
  const inline = first.firstChild;
  return inline && inline.type === "strong" ? textOf(inline) : "";
}

/** A pipe table is not a CommonMark block: its rows are paragraphs of `| a | b |` lines. Splits them into cells. */
export function tableRows(root) {
  const rows = [];
  for (const p of nodes(root, "paragraph")) {
    if (p.parent && p.parent.type === "item") continue;
    for (const line of textOfLines(p)) {
      if (!line.startsWith("|")) continue;
      const cells = line.replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
      if (cells.every((c) => /^-+$/.test(c))) continue;
      rows.push(cells);
    }
  }
  return rows;
}

function textOfLines(p) {
  const lines = [""];
  const walker = p.walker();
  for (let e = walker.next(); e; e = walker.next()) {
    const n = e.node;
    if (!e.entering) continue;
    if (n.type === "softbreak" || n.type === "linebreak") lines.push("");
    else if (n.type === "text" || n.type === "code") lines[lines.length - 1] += n.type === "code" ? `\`${n.literal}\`` : n.literal;
  }
  return lines;
}

function siblingsUntil(h) {
  const out = [];
  for (let n = h.next; n && !(n.type === "heading" && n.level <= h.level); n = n.next) out.push(n);
  return out;
}

const idsIn = (text) => [...text.matchAll(ID)].map((m) => m[1]);

/**
 * Definitions found in one file: { id, kind, file, text } where text is the whole definition (section, item or row).
 * Kinds: heading (id in a heading, text runs to the next heading of the same or a higher level), lead (leading strong
 * text of a list item, text is the item), row (first cell of a table row naming `release-management/<id>`).
 */
export function definitions(relative, base = AREA) {
  const root = parseFile(relative, base);
  const found = [];
  for (const h of nodes(root, "heading")) {
    const head = textOf(h);
    const mine = idsIn(head).filter((id) => /^[IFTAG]\d+$/.test(id));
    if (!mine.length || !/release-management\/|\[[IFTAG]\d+/.test(head)) continue;
    const parts = [head];
    for (let n = h.next; n && !(n.type === "heading" && n.level <= h.level); n = n.next) parts.push(textOf(n));
    const codes = [h, ...siblingsUntil(h)].flatMap((n) => nodes(n, "code").map((c) => c.literal));
    for (const id of mine) found.push({ id, kind: "heading", file: relative, text: parts.join(" ").trim(), codes });
  }
  for (const item of nodes(root, "item")) {
    const lead = leadingStrong(item);
    if (!lead) continue;
    const m = lead.match(/^release-management\/([IFTAG]\d+)\b/) ?? lead.match(/\[(?:release-management\/)?([IFTAG]\d+)\b[^\]]*\]/);
    if (m) found.push({ id: m[1], kind: "lead", file: relative, text: textOf(item), codes: nodes(item, "code").map((c) => c.literal) });
  }
  for (const cells of tableRows(root)) {
    const m = cells[0].match(/^release-management\/([IFTAG]\d+)$/);
    if (m) found.push({ id: m[1], kind: "row", file: relative, text: cells.slice(1).join(" | "), codes: [...cells.slice(1).join(" | ").matchAll(/`([^`]+)`/g)].map((c) => c[1]) });
  }
  return found;
}

export const strip = (id) => id.replace(SCOPE, "");

/** The concrete elements of a definition: its code spans, record ids and numbers. A reworded statement that drops or adds one is a change to declare. */
export function tokens(def) {
  const text = def.text.replace(/`[^`]*`/g, " ");
  return new Set([...(def.codes ?? []), ...[...text.matchAll(/\b([IFGTA]\d+)\b|\b(\d+)\b/g)].map((m) => m[1] ?? m[2])]);
}
