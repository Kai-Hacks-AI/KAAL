// kaal-guard outer acceptance, Requirements verification, part 4: discovery of kaal-guard.json (guard/F43, guard/F44, guard/F45).
// Each Case runs this package's Guard in a scratch Git repository of its own.
import assert from "node:assert/strict";
import { join } from "node:path";
import { describe, it } from "node:test";
import { ALWAYS, AREA, baseline, cleanup, commit, hook, kg, plan, ran, rev, scratch, scripts } from "./discovery-support.mjs";

describe("guard/F43 [guard/I1] discovery", () => {
  const ALL = ['alpha', 'alpha-lib', 'beta', 'c7', 'c8', 'c9', 'always', 'declared'];
  it("guard/T209 [guard/F43, guard/A21]: Guard finds the nearest kaal-guard.json of each changed file, at a package root or in an open Change folder wherever it lives, runs only those checks narrowed by their when, runs the .kaal root file on every run, and stops running a Change's checks once its file is gone", () => {
    const dir = scratch({
      ...baseline, ...scripts('alpha', 'alpha-lib', 'beta', 'c7', 'c8', 'c9', 'always'),
      [ALWAYS]: kg('always'),
      'packages/kaal-alpha/kaal-guard.json': kg('alpha', { id: 'alpha-lib', when: ['lib/**'] }),
      'packages/kaal-beta/kaal-guard.json': kg('beta'),
      'somewhere/else/entirely/00-changes/C7-x/kaal-guard.json': kg('c7'),
      [`${AREA}/00-changes/C8-x/kaal-guard.json`]: kg('c8'),
      'packages/kaal-alpha/00-changes/C9-x/kaal-guard.json': kg('c9'),
    });
    try {
      const base = rev(dir, 'HEAD');
      // A change outside lib/: the package's unnarrowed check, the .kaal file, never another package's or a Change's.
      commit(dir, { 'packages/kaal-alpha/README.md': 'x\n' });
      let r = hook(dir, base);
      assert.deepEqual(ran(r, ALL), ['alpha', 'always', 'declared'], `wrong selection for a package file outside lib/: ${r.out}`);
      commit(dir, { 'packages/kaal-alpha/lib/a.mjs': 'x\n' });
      r = hook(dir, base);
      assert.deepEqual(ran(r, ALL), ['alpha', 'alpha-lib', 'always', 'declared'], `when did not widen to lib/: ${r.out}`);
      // A file in an open Change folder finds the Change's file, wherever the folder is, and the host package's file is not nearest.
      commit(dir, { 'somewhere/else/entirely/00-changes/C7-x/note.md': 'x\n', [`${AREA}/00-changes/C8-x/note.md`]: 'x\n', 'packages/kaal-alpha/00-changes/C9-x/note.md': 'x\n' });
      r = hook(dir, base);
      assert.deepEqual(ran(r, ['c7', 'c8', 'c9', 'beta']), ['c7', 'c8', 'c9'], `a Change's own file was not the nearest: ${r.out}`);
      // A file with no nearest kaal-guard.json selects nothing; the .kaal root file still runs.
      const base2 = rev(dir, 'HEAD');
      commit(dir, { '.github/workflows/x.yml': 'x\n' });
      r = hook(dir, base2);
      assert.deepEqual(ran(r, ALL), ['always', 'declared'], `a file with no kaal-guard.json selected a check, or the .kaal file did not run: ${r.out}`);
      assert.equal(r.status, 0, r.out);
      // A closed Change: its file is removed and its checks are gone.
      const base3 = rev(dir, 'HEAD');
      commit(dir, { 'somewhere/else/entirely/00-changes/C7-x/kaal-guard.json': null, 'somewhere/else/entirely/00-changes/C7-x/note.md': 'y\n' });
      r = hook(dir, base3);
      assert.deepEqual(ran(r, ['c7']), [], `a closed Change's checks still ran: ${r.out}`);
    } finally { cleanup(dir); }
  });
});

describe("guard/F43 [guard/I1] nearest declaration, whatever the listing order", () => {
  it("guard/T216 [guard/F43, guard/A21]: a changed file under a nested folder's kaal-guard.json selects that file and never the enclosing package's, whether the nested file sorts before or after the enclosing one, and a root-level file loses to any folder's", () => {
    const dir = scratch({
      ...baseline, ...scripts('outer-a', 'inner-a', 'outer-z', 'inner-z', 'root'),
      // The nested file sorts before the enclosing one ("00-changes" < "kaal-guard.json") ...
      'packages/kaal-a/kaal-guard.json': kg('outer-a'),
      'packages/kaal-a/00-changes/C1-x/kaal-guard.json': kg('inner-a'),
      // ... and after it ("kaal-guard.json" < "zz-changes").
      'packages/kaal-z/kaal-guard.json': kg('outer-z'),
      'packages/kaal-z/zz-changes/C1-x/kaal-guard.json': kg('inner-z'),
      'kaal-guard.json': kg('root'),
    });
    try {
      const base = rev(dir, 'HEAD');
      const NAMES = ['outer-a', 'inner-a', 'outer-z', 'inner-z', 'root'];
      commit(dir, { 'packages/kaal-a/00-changes/C1-x/note.md': 'x\n' });
      assert.deepEqual(ran(hook(dir, base), NAMES), ['inner-a'], 'the enclosing package was selected, or the nested file was not');
      const base2 = rev(dir, 'HEAD');
      commit(dir, { 'packages/kaal-z/zz-changes/C1-x/note.md': 'x\n' });
      assert.deepEqual(ran(hook(dir, base2), NAMES), ['inner-z'], 'the enclosing package was selected, or the nested file was not');
      const base3 = rev(dir, 'HEAD');
      commit(dir, { 'packages/kaal-a/a.txt': 'x\n' });
      assert.deepEqual(ran(hook(dir, base3), NAMES), ['outer-a'], 'a package file did not select its own file alone');
      const base4 = rev(dir, 'HEAD');
      commit(dir, { 'elsewhere.txt': 'x\n' });
      assert.deepEqual(ran(hook(dir, base4), NAMES), ['root'], 'a root-level file did not select the root file');
    } finally { cleanup(dir); }
  });
});

describe("guard/F44 [guard/I1] discovery", () => {
  
  it("guard/T210 [guard/F44, guard/A21]: a package may change its own kaal-guard.json, removing checks included, and Guard runs it as the candidate has it; a malformed file, a check with no command or a command that cannot start is cannot judge, naming the file", () => {
    const dir = scratch({ ...baseline, ...scripts('one', 'two'), 'packages/kaal-alpha/kaal-guard.json': kg('one', 'two') });
    try {
      const base = rev(dir, 'HEAD');
      // The package changes its contract: removes a check, adds nothing. That is allowed and runs as is.
      commit(dir, { 'packages/kaal-alpha/kaal-guard.json': kg('one'), 'packages/kaal-alpha/a.txt': 'x\n' });
      let r = hook(dir, base);
      assert.deepEqual(ran(r, ['one', 'two']), ['one'], `the candidate's own file was not run as it is: ${r.out}`);
      assert.equal(r.status, 0, r.out);
      for (const [why, text] of [['malformed', '{ not json'], ['no command', JSON.stringify({ checks: [{ id: 'x' }] })], ['unstartable', JSON.stringify({ checks: [{ id: 'x', run: 'no-such-command-c143' }] })]]) {
        commit(dir, { 'packages/kaal-alpha/kaal-guard.json': text, 'packages/kaal-alpha/a.txt': `${why}\n` });
        r = hook(dir, base);
        assert.equal(r.status, 2, `${why} was not cannot judge: ${r.status} ${r.out}`);
        assert.match(r.out, /packages\/kaal-alpha\/kaal-guard\.json/, `${why}: the file is not named: ${r.out}`);
      }
    } finally { cleanup(dir); }
  });
});

describe("guard/F45 [guard/I1] discovery", () => {
  const ALL = ['alpha', 'beta', 'gamma', 'declared'];
  it("guard/T211 [guard/F45, guard/A21]: when the selection is unknown, or --full is given, Guard runs every kaal-guard.json; the Engine's plan adds capabilities in flight; an invalid, unreadable or empty plan is cannot judge; no outcome is a silent success", () => {
    const dir = scratch({ ...baseline, ...scripts('alpha', 'beta', 'gamma'), 'packages/kaal-alpha/kaal-guard.json': kg('alpha'), 'packages/kaal-beta/kaal-guard.json': kg('beta'), 'packages/kaal-gamma/kaal-guard.json': kg('gamma') });
    try {
      const base = rev(dir, 'HEAD');
      commit(dir, { 'packages/kaal-alpha/a.txt': '1\n' });
      let r = hook(dir, base, [], { noChanged: true });
      assert.deepEqual(ran(r, ['alpha', 'beta', 'gamma']), ['alpha', 'beta', 'gamma'], `an uncomputable selection did not run everything: ${r.out}`);
      assert.match(r.out, /unknown/i, 'a run on an unknown selection does not say so');
      r = hook(dir, base, ['--full']);
      assert.deepEqual(ran(r, ALL), ALL, `--full did not run everything: ${r.out}`);
      r = hook(dir, base, ['--plan', plan(dir, { 'in-flight': ['packages/kaal-beta'] })]);
      assert.deepEqual(ran(r, ALL), ['alpha', 'beta', 'declared'], `the plan's capability in flight was not added: ${r.out}`);
      r = hook(dir, base, ['--plan', plan(dir, { unknown: true })]);
      assert.deepEqual(ran(r, ALL), ALL, `an unknown plan did not run everything: ${r.out}`);
      for (const bad of [{ 'in-flight': 'beta' }, {}, [], { 'in-flight': [] }]) {
        r = hook(dir, base, ['--plan', plan(dir, bad)]);
        assert.equal(r.status, 2, `an invalid plan ${JSON.stringify(bad)} was not cannot judge: ${r.status} ${r.out}`);
      }
      r = hook(dir, base, ['--plan', join(dir, '.git', 'no-such-plan.json')]);
      assert.equal(r.status, 2, `an unreadable plan was not cannot judge: ${r.status} ${r.out}`);
    } finally { cleanup(dir); }
  });
});
