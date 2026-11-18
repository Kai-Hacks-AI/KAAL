// Usage: node build-page.mjs <cvi.json> <out.html> <generated> <Title=file>...
// Builds the Show WIP page. Every input is read first; if one cannot be read, or is empty, it prints what and exits 2 without writing the page.
import { readFileSync, writeFileSync } from 'node:fs';
import { renderPage } from './page.mjs';

try {
  const [themeFile, out, generated, ...parts] = process.argv.slice(2);
  if (!themeFile || !out || !generated || parts.length === 0) throw new Error('could not start: expected <cvi.json> <out.html> <generated> <Title=file>...');
  if (Number.isNaN(Date.parse(generated))) throw new Error(`could not read the time ${generated}`);
  const read = (file) => {
    let text;
    try { text = readFileSync(file, 'utf8'); } catch { throw new Error(`could not read ${file}`); }
    if (!text.trim()) throw new Error(`${file} is empty`);
    return text;
  };
  const theme = JSON.parse(read(themeFile));
  const sections = parts.map((p) => {
    const at = p.indexOf('=');
    if (at < 1) throw new Error(`${p} is not Title=file`);
    return { title: p.slice(0, at), text: read(p.slice(at + 1)) };
  });
  writeFileSync(out, renderPage({ theme, title: 'Show WIP', generated, sections }));
} catch (error) {
  console.error(`build page: ${error.message}`);
  process.exitCode = 2;
}
