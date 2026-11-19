// Case release/T1154 tests: release/F70
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { RM, draft, load, text, ACT, HOTFIX, PLAN, DO, SYNC, ev } from '../../03-architecture/A65-raise-from-the-event/fixtures.mjs';
export const id = 'release/T1154';
export const tests = ['release/F70'];
export const title = "the raise creates a draft once: a closed PROMOTION of the revision, a moved tip or a dry run write nothing";
export async function run() {
  const { raiseAll, marker } = await load('raise.mjs');
  const { decideFinal } = await load('final-step.mjs');
  const sha = 'd'.repeat(40), head = 'kaal/release/some-thing';
  const dec = decideFinal(ev({ base: head, body: ACT, mergeSha: sha }));
  const run = async ({ seen = [], tip = sha, live = true }) => {
    const calls = [];
    const api = async (m, p, b) => { calls.push([m, p, b]); if (m === 'POST') return { number: 9, head: { sha } }; if (/git\/ref/.test(p)) return { object: { sha: tip } }; return seen; };
    const out = await raiseAll({ api, repo: 'o/r', decisions: [dec], live });
    return { out, posts: calls.filter(([m]) => m === 'POST'), calls };
  };
  const a = await run({});
  assert.equal(a.out[0].result, 'raised');
  assert.equal(a.posts.length, 1);
  assert.equal(a.posts[0][2].draft, true, 'it is created as a draft');
  assert.ok(a.calls.every(([m]) => m === 'GET' || m === 'POST'));
  const closed = await run({ seen: [{ number: 3, state: 'closed', body: 'x' + marker(head, sha) }] });
  assert.equal(closed.out[0].result, 'already-raised');
  assert.equal(closed.posts.length, 0);
  const moved = await run({ tip: 'e'.repeat(40) });
  assert.equal(moved.out[0].result, 'moved');
  assert.equal(moved.posts.length, 0);
  const dry = await run({ live: false });
  assert.equal(dry.out[0].result, 'would-raise');
  assert.equal(dry.posts.length, 0);
}
