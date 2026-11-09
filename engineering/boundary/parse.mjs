// What the Boundary Engine's code detectors read: syntax trees, never text patterns (Owner, 9 Nov: no brittle setups).
// JavaScript and TypeScript go through the TypeScript parser, Markdown through commonmark (its js and ts code blocks go through the
// TypeScript parser, the prose is not scanned), JSON and YAML through their parsers as data. Any other file type has no parser:
// it is reported, so the result is unknown, and no pattern is used instead.
import { Parser as MarkdownParser } from "commonmark";
import ts from "typescript";
import { parseDocument } from "yaml";

const CODE = new Map([
  [".js", ts.ScriptKind.JS], [".mjs", ts.ScriptKind.JS], [".cjs", ts.ScriptKind.JS], [".jsx", ts.ScriptKind.JSX],
  [".ts", ts.ScriptKind.TS], [".mts", ts.ScriptKind.TS], [".cts", ts.ScriptKind.TS], [".tsx", ts.ScriptKind.TSX],
]);
const FENCES = new Map([["js", ts.ScriptKind.JS], ["javascript", ts.ScriptKind.JS], ["mjs", ts.ScriptKind.JS], ["ts", ts.ScriptKind.TS], ["typescript", ts.ScriptKind.TS]]);
const extensionOf = (path) => (path.includes(".") ? path.slice(path.lastIndexOf(".")).toLowerCase() : "");

/**
 * `{ kind, sources }` for one file. kind is `code` (sources: syntax trees with the line the text starts at), `data` (parsed, nothing to
 * detect), `none` (no parser for this file type) or `error` (the file did not parse).
 */
export function parseSource(path, text) {
  const extension = extensionOf(path);
  if (CODE.has(extension)) {
    const tree = ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true, CODE.get(extension));
    return tree.parseDiagnostics.length > 0 ? { kind: "error", sources: [] } : { kind: "code", sources: [{ tree, firstLine: 1 }] };
  }
  if (extension === ".md") {
    const sources = [];
    const walker = new MarkdownParser().parse(text).walker();
    for (let step = walker.next(); step; step = walker.next()) {
      const { node, entering } = step;
      const kind = entering && node.type === "code_block" ? FENCES.get((node.info ?? "").trim().toLowerCase()) : undefined;
      if (kind === undefined) continue;
      sources.push({ tree: ts.createSourceFile(path, node.literal, ts.ScriptTarget.Latest, true, kind), firstLine: node.sourcepos[0][0] + 1 });
    }
    return { kind: "code", sources };
  }
  if (extension === ".json") {
    try {
      JSON.parse(text);
      return { kind: "data", sources: [] };
    } catch {
      return { kind: "error", sources: [] };
    }
  }
  if (extension === ".yml" || extension === ".yaml") {
    return parseDocument(text).errors.length > 0 ? { kind: "error", sources: [] } : { kind: "data", sources: [] };
  }
  return { kind: "none", sources: [] };
}

/** 1-based line, in the file, of a node of one of the file's syntax trees. */
export const lineOf = (source, node) => source.tree.getLineAndCharacterOfPosition(node.getStart(source.tree)).line + source.firstLine;
