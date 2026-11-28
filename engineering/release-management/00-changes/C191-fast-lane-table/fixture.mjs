// The fixtures the Cases of release/C191 share: two kinds of lane entries (an editable one, an add-only one) and a diff entry helper.
export const ITEM_ROOT = 'packages/kaal-backlog/00-backlog/';
export const CLAIM_ROOT = 'packages/kaal-core/00-claims/';
export const item = { kind: 'item', roots: [ITEM_ROOT], name: '^B([1-9][0-9]*)(?:-[a-z0-9]+(?:-[a-z0-9]+)*)?\\.md$', allow: '^packages/[a-z0-9]+(?:-[a-z0-9]+)*/00-backlog/$' };
export const claim = { kind: 'claim', roots: [CLAIM_ROOT], name: '^K([1-9][0-9]*)\\.json$', allow: '^packages/[a-z0-9]+(?:-[a-z0-9]+)*/00-claims/$', status: ['A'] };
export const lanes = [item, claim];
export const add = (path) => ({ path, status: 'A', mode: '100644' });
export const mod = (path) => ({ path, status: 'M', mode: '100644' });
export const codes = (r) => r.findings.map((f) => f.code);
export async function load(url) {
  const { pathToFileURL } = await import('node:url');
  const { join } = await import('node:path');
  const { fileURLToPath } = await import('node:url');
  const repo = fileURLToPath(url).split('/engineering/')[0];
  return (await import(pathToFileURL(join(repo, 'engineering/release-management/05-src/lane/qualify.mjs')).href)).qualify;
}
