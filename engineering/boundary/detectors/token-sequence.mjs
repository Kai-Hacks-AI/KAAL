// Detector `token-sequence`: literal tokens in order, each on the previous token's line or within `window` lines after it, found
// in the syntax tree of JavaScript or TypeScript. A token that is a number matches a numeric literal by value (0x428a2f98,
// 0X428A2F98, 0x428a_2f98 and 1116352408 are one token); any other token matches a string literal or a name, case-insensitively.
// Comments are not tokens. The place is the line of the first token. Bounded (engineering/boundary/PLAN.md R2).
import ts from "typescript";
import { lineOf } from "../parse.mjs";

export const name = "token-sequence";
export const params = { tokens: "string-list", window: "window" };
export const needsParse = true;

const numeric = (text) => (/^[+-]?(?:0[xXoObB][0-9a-fA-F_]+|[0-9][0-9_]*(?:\.[0-9_]+)?)$/.test(text) ? Number(text.replaceAll("_", "")) : NaN);

export function prepare(test) {
  return { tokens: test.tokens.map((t) => ({ number: numeric(t), text: t.toLowerCase() })), unreadable: [] };
}

const matches = (token, found) => (Number.isNaN(token.number) ? found.text === token.text : found.number === token.number);

export function detect(test, state, file) {
  const found = new Set();
  for (const source of file.sources) {
    const literals = [];
    const visit = (node) => {
      if (ts.isNumericLiteral(node)) literals.push({ line: lineOf(source, node), number: Number(node.text.replaceAll("_", "")), text: node.text.toLowerCase() });
      else if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) literals.push({ line: lineOf(source, node), number: NaN, text: node.text.toLowerCase() });
      else if (ts.isIdentifier(node)) literals.push({ line: lineOf(source, node), number: NaN, text: node.text.toLowerCase() });
      ts.forEachChild(node, visit);
    };
    visit(source.tree);
    for (const first of literals) {
      if (!matches(state.tokens[0], first)) continue;
      let at = first.line;
      let ok = true;
      for (const token of state.tokens.slice(1)) {
        const next = literals.find((l) => l.line >= at && l.line <= at + test.window && matches(token, l));
        if (!next) {
          ok = false;
          break;
        }
        at = next.line;
      }
      if (ok) found.add(first.line);
    }
  }
  return [...found].sort((a, b) => a - b);
}
