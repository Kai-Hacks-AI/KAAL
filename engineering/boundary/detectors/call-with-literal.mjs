// Detector `call-with-literal`: a call of a named function whose first argument is a string literal equal to a listed literal,
// found in the syntax tree of JavaScript or TypeScript (a plain template literal counts). The callee is the called name, so
// `createHash(`, `crypto.createHash(` and `h.digest(` match and `myDigest(` does not. Case and a hyphen are ignored.
// A call in a comment or inside a string is not a call, and a call split across lines is one. A call whose name or argument is
// held in a variable is not seen: this is structural evidence, not proof of what runs. A finding is a place to look at.
import ts from "typescript";
import { lineOf } from "../parse.mjs";

export const name = "call-with-literal";
export const params = { callee: "name-list", literal: "string-list" };
export const needsParse = true;

const normal = (text) => text.toLowerCase().replaceAll("-", "");

export function prepare(test) {
  return { callees: new Set(test.callee), literals: new Set(test.literal.map(normal)), unreadable: [] };
}

export function detect(_test, state, file) {
  const found = new Set();
  for (const source of file.sources) {
    const visit = (node) => {
      if (ts.isCallExpression(node)) {
        const callee = node.expression;
        const called = ts.isIdentifier(callee) ? callee : ts.isPropertyAccessExpression(callee) ? callee.name : null;
        const [first] = node.arguments;
        if (called && state.callees.has(called.text) && first && (ts.isStringLiteral(first) || ts.isNoSubstitutionTemplateLiteral(first)) && state.literals.has(normal(first.text))) {
          found.add(lineOf(source, called));
        }
      }
      ts.forEachChild(node, visit);
    };
    visit(source.tree);
  }
  return [...found].sort((a, b) => a - b);
}
