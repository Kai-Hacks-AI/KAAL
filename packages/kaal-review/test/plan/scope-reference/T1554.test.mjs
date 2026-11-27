// Case review/T1554 tests: review/F36. What an item examines may be an element, a file, a folder or a set, and it is found from a file and from a folder above it.
import assert from 'node:assert/strict';
import { item, kinds, load, tree } from './lib.mjs';
export const id = 'review/T1554';
export const tests = ['review/F36'];
export const title = 'an item that examines a folder or a set is found from a file inside it and from a folder above it, an element id is still matched exactly, an item below a folder is not found from the folder above, and each malformed path entry is a named finding while the item stays listed';
export async function run() {
  const { navigate, about } = await load();
  const root = tree({
    'v/V1.md': item('ns/V1', { validates: ['path:docs/guide.md'] }),
    'v/V2.md': item('ns/V2', { validates: ['path:docs/'] }),
    'v/V3.md': item('ns/V3', { validates: ['path:docs/deep/'] }),
    'v/V4.md': item('ns/V4', { validates: ['x/F1', 'path:src/a.mjs', 'path:src/b.mjs'] }),
    'v/V5.md': item('ns/V5', { validates: ['path:docsx/'] }),
    'v/V6.md': item('ns/V6', { validates: ['path:/'] }),
    'v/V7.md': item('ns/V7', { validates: ['path:docs/g'] }),
  });
  const answer = await navigate(root, {});
  const found = (subject) => Object.values(about(answer, subject).validatedBy).flat().sort();

  assert.deepEqual(found('path:docs/guide.md'), ['ns/V1', 'ns/V2'], 'a file is found by the item that names it and by the item that names its folder');
  assert.deepEqual(found('path:docs/deep/note.md'), ['ns/V2', 'ns/V3'], 'a file is found by every folder above it');
  assert.deepEqual(found('path:docs/'), ['ns/V2'], 'a folder is found by the item that names it, and not by one that names only a folder below it');
  assert.deepEqual(found('path:docs/deep/'), ['ns/V2', 'ns/V3'], 'a folder is found by a folder above it');
  assert.deepEqual(found('path:docs/g'), ['ns/V2', 'ns/V7'], 'a file is matched whole');
  assert.deepEqual(found('path:docs/g/x.md'), ['ns/V2'], 'a file entry is not a folder, so it does not cover what only begins with its name');
  assert.deepEqual(found('path:docs/g'), ['ns/V2', 'ns/V7'], 'a file is matched whole');
  assert.deepEqual(found('path:docs/g/x.md'), ['ns/V2'], 'a file entry is not a folder, so it does not cover what only begins with its name');
  assert.deepEqual(found('path:docsx/y.md'), ['ns/V5'], 'a folder name that only shares letters with another is another folder');
  assert.deepEqual(found('path:src/b.mjs'), ['ns/V4'], 'a set is found by each of its entries');
  assert.deepEqual(found('x/F1'), ['ns/V4'], 'an element id is matched exactly');
  assert.deepEqual(found('x/F'), [], 'an element id is not a prefix match');
  assert.deepEqual(found('path:other.md'), [], 'a file that nothing names is found by nothing');

  const bad = tree({
    'v/V1.md': item('ns/V1', { validates: ['path:'] }),
    'v/V2.md': item('ns/V2', { validates: ['path:/etc/x'] }),
    'v/V3.md': item('ns/V3', { validates: ['path:a\\b'] }),
    'v/V4.md': item('ns/V4', { validates: ['path:a/../b'] }),
    'v/V5.md': item('ns/V5', { validates: ['path:./a'] }),
    'v/V6.md': item('ns/V6', { validates: ['path:ok/', 'path:fine.md'] }),
  });
  const n = await navigate(bad, {});
  assert.deepEqual(kinds(n), ['bad-scope-reference', 'bad-scope-reference', 'bad-scope-reference', 'bad-scope-reference', 'bad-scope-reference'], 'each malformed path entry is one named finding and a sound one is none');
  assert.deepEqual(n.items.map((i) => i.id), ['ns/V1', 'ns/V2', 'ns/V3', 'ns/V4', 'ns/V5', 'ns/V6'], 'an item with a malformed entry stays listed');
  assert.deepEqual(Object.values(about(n, 'path:ok/x.md').validatedBy).flat(), ['ns/V6']);
  assert.deepEqual(Object.values(about(n, 'path:a/../b').validatedBy).flat(), [], 'a malformed subject is found by nothing, even by the entry that is written the same');
  assert.deepEqual(Object.values(about(n, 'path:a/../b').validatedBy).flat(), [], 'a malformed subject is found by nothing, even by the entry that is written the same');
  assert.deepEqual(Object.values(about(n, 'path:b').validatedBy).flat(), [], 'a malformed entry does not match anything');
  assert.deepEqual(n.items[5].scope, ['path:ok/', 'path:fine.md'], 'the scope of an item is listed as written');
}
