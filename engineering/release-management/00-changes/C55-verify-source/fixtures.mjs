// Fixtures of release/C55: one run record that passes every rule, and the declaration it is judged by.
export const declaration = { command: 'npm test' };
export const directory = 'packages/kaal-example';
export function run(change = {}) {
  return { command: declaration.command, cwd: directory, status: 0, ...change };
}
export async function judge() {
  const mod = await import('../../05-src/publishing/verify-source/judge.mjs').catch(() => null);
  return mod;
}
