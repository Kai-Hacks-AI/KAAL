// Detector `token-sequence`: literal tokens in order, each on the previous token's line or within `window` lines after it.
// The place is the line of the first token. Case-insensitive, bounded (engineering/boundary/PLAN.md R2).
export const name = "token-sequence";
export const params = { tokens: "string-list", window: "window" };

export function prepare(test) {
  return { tokens: test.tokens.map((t) => t.toLowerCase()), unreadable: [] };
}

export function detect(test, state, file) {
  const lower = file.lines.map((l) => l.toLowerCase());
  const found = [];
  lower.forEach((text, start) => {
    if (!text.includes(state.tokens[0])) return;
    let at = start;
    for (const token of state.tokens.slice(1)) {
      let next = -1;
      for (let j = at; j <= Math.min(at + test.window, lower.length - 1); j++) {
        if (lower[j].includes(token)) {
          next = j;
          break;
        }
      }
      if (next < 0) return;
      at = next;
    }
    found.push(start + 1);
  });
  return found;
}
