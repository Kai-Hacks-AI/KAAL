import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
export const repo = new URL('../../../../', import.meta.url).pathname;
export const example = readFileSync(join(repo, 'engineering/project/examples/P1-control-status.md'), 'utf8');
export const PKG = join(repo, 'packages/kaal-project');
export async function load() {
  const file = join(PKG, 'lib/project.mjs');
  if (!existsSync(file)) throw new Error('packages/kaal-project/lib/project.mjs is absent');
  return import(pathToFileURL(file).href);
}
export const fm = (id, extra = '') => `---\nid: ${id}\ntitle: t\n${extra}---\n# ${id}\n`;
export const project = (delivers) => `---\nid: project/P9\ntitle: t\ndelivers: [${delivers}]\n---\n`;
