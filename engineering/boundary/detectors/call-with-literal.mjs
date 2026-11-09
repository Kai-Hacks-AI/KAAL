// Detector `call-with-literal`: a call of a named function whose first argument is exactly a quoted string equal to a listed literal (the string is followed by `,` or `)`).
// Case and a hyphen are ignored; spaces inside the parentheses and ', " or ` quotes are tolerated (engineering/boundary/PLAN.md R2).
// Name boundary: the callee must start its identifier, so `createHash(` and the member call `crypto.createHash(` or `h.digest(`
// match, and `myDigest(` or `xcreateHash(` do not. The member call is intended: the platform is asked whichever object it is on.
// This is lexical evidence, not proof of an executable call: the same text in a comment or a string also matches, and a call whose
// name or argument is held in a variable is not seen. A finding is a place to look at.
export const name = "call-with-literal";
export const params = { callee: "name-list", literal: "string-list" };

const normal = (text) => text.toLowerCase().replaceAll("-", "");

export function prepare(test) {
  return { call: new RegExp(`(?<![\\w$])(?:${test.callee.join("|")})\\(\\s*(["'\`])([^"'\`]*)\\1\\s*[,)]`, "g"), literals: new Set(test.literal.map(normal)), unreadable: [] };
}

export function detect(_test, state, file) {
  const found = [];
  file.lines.forEach((text, i) => {
    for (const m of text.matchAll(state.call)) {
      if (state.literals.has(normal(m[2]))) {
        found.push(i + 1);
        break;
      }
    }
  });
  return found;
}
