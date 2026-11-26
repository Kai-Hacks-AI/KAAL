// Case review/T1537 tests: review/F34. The separation of the two jobs of the Inspector's workflow is judged as text.
import assert from 'node:assert/strict';
import { kinds, load, WORKFLOW } from './lib.mjs';
export const id = 'review/T1537';
export const tests = ['review/F34'];
export const title = 'a workflow that keeps the separation of the judge and the sign job is in, and each of a secret in the judge, kept credentials, the key outside the sign job, a signer that reads or checks out the change, a missing needs, pull_request_target, write permissions, a missing job, an action not pinned to a commit, text of the change used as a command, and a verdict not bound to the revision is out with its own finding';
const KEY = 'INSPECTOR_PRIVATE_KEY';
export async function run() {
  const { judgeWorkflow } = await load();
  assert.deepEqual(judgeWorkflow(WORKFLOW), { verdict: 'in', findings: [] });

  const bad = (f, kind, why) => {
    const text = f(WORKFLOW);
    assert.notEqual(text, WORKFLOW, `${why}: the mutation changed nothing`);
    const v = judgeWorkflow(text);
    assert.equal(v.verdict, 'out', why);
    assert.ok(kinds(v).includes(kind), `${why}: expected ${kind}, got ${kinds(v)}`);
  };
  bad((t) => t.replace('      - name: Keep the verdicts as data', `      - run: echo \${{ secrets.${KEY} }}\n      - name: Keep the verdicts as data`), 'judge-names-secret', 'the key named in the judge job');
  bad((t) => t.replace('          persist-credentials: false\n      - name: Fetch', '      - name: Fetch'), 'judge-keeps-credentials', 'a judge that keeps credentials');
  bad((t) => t.replace('  pull_request:\n', '  pull_request_target:\n'), 'pull-request-target', 'pull_request_target');
  bad((t) => t.replace('permissions: {}', 'permissions: write-all'), 'permissions-not-empty', 'write-all permissions');
  bad((t) => t.replace(/(  sign:[\s\S]*?ref: )\$\{\{[^}]*\}\}/, '$1refs/pull/1/head'), 'sign-reads-change', 'a signer that checks out the change');
  bad((t) => t.replace('needs: judge', ''), 'sign-without-needs', 'a signer that does not need the judge');
  bad((t) => t.replace(/(  sign:[\s\S]*)INSPECTOR_PRIVATE_KEY: \$\{\{ secrets\.INSPECTOR_PRIVATE_KEY \}\}/, '$1X: 1'), 'sign-lacks-key', 'a signer without the key');
  bad((t) => t.replace('name: inspector\n', `name: inspector\nenv:\n  K: \${{ secrets.${KEY} }}\n`), 'key-outside-sign', 'the key named at the top');
  bad((t) => t.replace(/  sign:[\s\S]*$/, ''), 'job-missing', 'a workflow without the sign job');
  bad((t) => t.replace('    permissions:\n      contents: read\n    env:\n      BASE_SHA', '    permissions:\n      contents: write\n    env:\n      BASE_SHA'), 'judge-holds-more', 'a judge that holds more than contents read');
  bad((t) => t.replace('actions/upload-artifact@cf430e030ddbb5b0abf93d22962f4752f3646cd9', 'actions/upload-artifact@v4'), 'action-unpinned', 'an action named by a movable tag');
  bad((t) => t.replace('actions/download-artifact@9000827ccba6bdab643e8b6fd33ac0654aef8333', 'actions/download-artifact@main'), 'action-unpinned', 'an action named by a branch');
  bad((t) => t.replace('node packages/kaal-controls/skills/kaal-controls/scripts/judge.mjs', 'echo "${{ github.event.pull_request.title }}"; node packages/kaal-controls/skills/kaal-controls/scripts/judge.mjs'), 'change-text-in-command', 'the title of the change inside a command');
  bad((t) => t.replace('      PR_NUMBER:', '      HEAD_LABEL: ${{ github.event.pull_request.head.label }}\n      PR_NUMBER:'), 'change-text-in-command', 'the head label of the change taken into the environment');
  bad((t) => t.replace('--revision "$HEAD_SHA" ', ''), 'verdict-unbound', 'a signer that posts without naming the revision');
  bad((t) => t.replace('--head "$HEAD_SHA" ', '--head refs/remotes/pull/head '), 'verdict-unbound', 'a judge that judges a moving ref and not the revision');
  bad((t) => t.replace('          test "$(git rev-parse refs/remotes/pull/head)" = "$HEAD_SHA"\n', ''), 'verdict-unbound', 'a fetched head that is never compared with the revision');
  bad((t) => t.replace(' --run "$GITHUB_RUN_ID" --out', ' --out'), 'verdict-unbound', 'verdicts that do not carry the run that judged them');
  assert.equal(judgeWorkflow('').verdict, 'out', 'empty text must be out, not an exception');
  assert.equal(judgeWorkflow(undefined).verdict, 'out', 'a missing text must be out, not an exception');
}
