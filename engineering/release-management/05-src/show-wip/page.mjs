// Show WIP page: the text of Show WIP as one static HTML page in the corporate visual identity.
// Pure: the theme, a title, a time and named sections in, the page out. Static: no script, no external origin, text escaped.
// Identity rules kept: warm paper ground, ink text, brick only in the mark (one accent per surface), the mark no smaller than 28 px, no dash as a sentence break.
const escape = (text) => String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

export function renderPage({ theme, title, generated, sections }) {
  const { color: c, font: f } = theme;
  const body = sections.map((s) => `<section>\n<h2>${escape(s.title)}</h2>\n<pre>${escape(s.text)}</pre>\n</section>`).join('\n');
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src data:">
<title>${escape(title)}</title>
<style>
:root { --paper: ${c.paper}; --paper-warm: ${c.paperWarm}; --ink: ${c.ink}; --ink-soft: ${c.inkSoft}; --ink-mute: ${c.inkMute}; --rule: ${c.rule}; --sea: ${c.sea}; }
* { box-sizing: border-box; }
body { margin: 0; background: var(--paper); color: var(--ink); font-family: ${f.prose}; line-height: 1.55; }
main { max-width: 1080px; margin: 0 auto; padding: 2rem 1rem 4rem; }
header { display: flex; align-items: center; gap: 1rem; border-bottom: 1px solid var(--rule); padding-bottom: 1.25rem; margin-bottom: 1.5rem; }
header svg { height: ${theme.markHeight}px; width: ${theme.markHeight}px; flex: none; }
h1 { font-family: ${f.display}; font-weight: 540; font-size: 1.875rem; margin: 0; }
.eyebrow { font-family: ${f.mono}; font-size: 0.75rem; color: var(--ink-mute); margin: 0; }
h2 { font-family: ${f.display}; font-weight: 540; font-size: 1.375rem; color: var(--sea); margin: 2rem 0 0.5rem; }
pre { font-family: ${f.mono}; font-size: 0.8125rem; background: var(--paper-warm); border: 1px solid var(--rule); padding: 1rem; overflow-x: auto; white-space: pre; margin: 0; }
footer { font-family: ${f.mono}; font-size: 0.75rem; color: var(--ink-mute); border-top: 1px solid var(--rule); margin-top: 2rem; padding-top: 1rem; }
</style>
</head>
<body>
<main>
<header>
${theme.mark}
<div>
<p class="eyebrow">kaal, operations</p>
<h1>${escape(title)}</h1>
</div>
</header>
${body}
<footer>Read from the repository at ${escape(generated)}. It shows where work stands and authorizes nothing.</footer>
</main>
</body>
</html>
`;
}
