// Detector `call-with-literal`: a call of a named function whose first argument is a quoted string equal to a listed literal.
// Case and a hyphen are ignored; spaces inside the parentheses and ', " or ` quotes are tolerated (engineering/boundary/PLAN.md R2).
export const name = "call-with-literal";
export const params = { callee: "name-list", literal: "string-list" };

const normal = (text) => text.toLowerCase().replaceAll("-", "");

export function prepare(test) {
  return { call: new RegExp(`(?:${test.callee.join("|")})\\(\\s*(["'\`])([^"'\`]*)\\1`, "g"), literals: new Set(test.literal.map(normal)), unreadable: [] };
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
