// Local/offline input adapter. Hosting owns process and filesystem mechanics.
import { execute } from 'kaal-hosting';
import { establishFullMatrix } from './full-policy.mjs';
const sha = s => typeof s === 'string' && /^[a-f0-9]{40}$/.test(s);
async function git(root, args) {
  const r = await execute('git', args, { cwd: root });
  if (r.status !== 0) throw new Error(`trusted Git input unavailable: ${args[0]}`);
  return r.stdout;
}
export async function readTargetSnapshot(root, revision) {
  if (!sha(revision)) throw new TypeError('immutable target commit SHA required');
  if ((await git(root, ['rev-parse', '--verify', `${revision}^{commit}`])).trim() !== revision)
    throw new Error('target is not the named commit');
  const paths = (await git(root, ['ls-tree', '-rz', '--name-only', revision, '--', '.github/workflows', '.kaal/config/guard']))
    .split('\0').filter(Boolean);
  const sources = {};
  for (const path of paths) sources[path] = await git(root, ['show', `${revision}:${path}`]);
  return { revision, sources };
}
export async function authorityFromGit(root, context) {
  if (!context || !['baseSha', 'headSha', 'testedSha', 'governanceSha'].every(k => sha(context[k])))
    throw new TypeError('independently supplied immutable evaluation context required');
  // Git proves these object facts; current PR/target/generation must additionally
  // be supplied by a trusted provider observer before any future publication.
  for (const key of ['headSha', 'governanceSha'])
    if ((await git(root, ['rev-parse', '--verify', `${context[key]}^{commit}`])).trim() !== context[key])
      throw new Error(`unknown ${key}`);
  const proof = (await git(root, ['show', '-s', '--format=%T%n%P', context.testedSha])).trim().split('\n');
  if (proof[0] !== context.testedTreeSha || JSON.stringify(proof[1]?.split(' ') ?? []) !== JSON.stringify(context.parents))
    throw new Error('tested tree/parent proof differs from trusted context');
  return establishFullMatrix(context, await readTargetSnapshot(root, context.baseSha));
}
