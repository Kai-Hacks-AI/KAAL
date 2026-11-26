import { readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

// The files of a folder, in a fixed order, depth first; none when the folder is not there.
export const walk = (dir) => (existsSync(dir) ? readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name)).flatMap((e) => (e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)])) : []);


// The frontmatter of a Markdown file as keys and lists; null when there is none.
export function frontmatter(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---(\n|$)/);
  if (!m) return null;
  const out = {};
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^([A-Za-z][\w-]*):\s*(.*)$/);
    if (!kv) continue;
    const v = kv[2].trim();
    out[kv[1]] = v.startsWith('[') ? v.slice(1, v.lastIndexOf(']')).split(',').map((s) => s.trim()).filter(Boolean) : v;
  }
  return out;
}

