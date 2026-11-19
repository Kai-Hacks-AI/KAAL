// Case testing/T371 tests: testing/F147, testing/N32. The installed package depends on Hosting and c8 only, and no other KAAL package.
import assert from 'node:assert/strict';
import { DEPENDENCIES, FAMILY, NAME, arrived, files, install, manifest, text, unintended } from './lib.mjs';
export const id = 'testing/T371';
export const tests = ['testing/F147', 'testing/N32'];
export const title = 'the installed kaal-testing declares only Hosting, Foundation and c8, imports nothing else, and no other KAAL package or Skill arrives with it';
export async function run() {
  const { project, root } = install();
  const m = manifest(root);
  const declared = Object.keys({ ...m.dependencies, ...m.peerDependencies, ...m.optionalDependencies }).sort();
  assert.deepEqual(declared.filter((d) => !DEPENDENCIES.includes(d)), [], 'the package declares a runtime dependency beyond Hosting, Foundation and c8');
  for (const must of ['@kaihacksai/kaal-hosting', 'c8']) assert.ok(declared.includes(must), `${must} is imported but not declared`);
  assert.equal(Object.values({ ...m.dependencies }).some((v) => /^(file|link|workspace|git)/.test(v)), false, 'a dependency points at a path or a workspace, not at a published version');

  const everything = arrived(project);
  assert.ok(everything.includes(NAME) && everything.includes('@kaihacksai/kaal-hosting'), 'the install lacks the package itself or Hosting');
  assert.deepEqual(unintended(everything), [], 'the install brought a KAAL-family package that is not on the fixed allowlist (kaal-testing, Hosting, Foundation), directly or as a transitive arrival');

  const bare = new Set();
  for (const f of files(root).filter((n) => /^(lib|bin)\/.+\.mjs$/.test(n))) {
    for (const [, s] of text(root, f).matchAll(/(?:from|import\()\s*['"]([^'".][^'"]*)['"]/g)) bare.add(s);
  }
  const outside = [...bare].filter((s) => !s.startsWith('node:') && !DEPENDENCIES.some((d) => s === d || s.startsWith(`${d}/`)) && !s.startsWith(`${NAME}/`));
  assert.deepEqual(outside, [], 'a file imports a module that is neither built in nor a declared dependency');
}
