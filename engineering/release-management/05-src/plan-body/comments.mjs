// Removes HTML comments the way a renderer does: a comment runs to its closing marker,
// and an unterminated one runs to the end. No comment opener survives in the result.
export function stripComments(text) {
  let out = '';
  let at = 0;
  for (;;) {
    const open = text.indexOf('<!--', at);
    if (open === -1) return out + text.slice(at);
    out += text.slice(at, open);
    const close = text.indexOf('-->', open + 4);
    if (close === -1) return out;
    at = close + 3;
  }
}
