// Fixtures of release/C50: one manifest that passes every rule, and the declaration it is judged by.
export const declaration = { scope: '@kaihacksai/', repository: 'git+https://github.com/Kai-Hacks-AI/KAAL.git' };
export const directory = 'packages/kaal-example';
export function manifest(change = {}) {
  return {
    name: '@kaihacksai/kaal-example', version: '0.0.1', license: 'MIT',
    engines: { node: '>=22' }, files: ['skills'], publishConfig: { access: 'public' },
    repository: { type: 'git', url: declaration.repository, directory },
    dependencies: { '@kaihacksai/kaal-foundation': '0.0.1' },
    ...change,
  };
}
export const registry = (change = {}) => ({ '@kaihacksai/kaal-example': [], '@kaihacksai/kaal-foundation': ['0.0.1'], ...change });
export async function judge() {
  const mod = await import('../../05-src/publishing/verify-package/judge.mjs').catch(() => null);
  return mod;
}
