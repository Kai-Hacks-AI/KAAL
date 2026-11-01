import assert from 'node:assert/strict';
import { createController } from './controller.mjs';
import { fixture, snapshot } from '../full-fixtures.mjs';

// Transaction callbacks are synchronous; only the fake store lives in memory.
export function memoryStore() {
  let state;
  return { transaction(key, fn) {
    assert.equal(key, 'kaal-gates/v1');
    const draft = structuredClone(state ?? { epoch: 0, subjects: {}, slots: {}, operation: null });
    const result = fn(draft); assert.equal(typeof result?.then, 'undefined');
    state = draft; return structuredClone(result);
  } };
}
export function harness(event = 'pull_request', target = 'main') {
  const f = fixture(event, target), store = memoryStore(), checks = new Map(), writes = [];
  let beforeWrite, beforeAcquire, current = structuredClone(f.context), nextId = 900;
  const transport = { async request(req) {
    if (req.method === 'GET') return { status: 200, origin: 'https://api.github.com', body: structuredClone(checks.get(Number(req.path.split('/').at(-1)))) };
    writes.push(structuredClone(req));
    if (beforeWrite) await beforeWrite(req);
    const id = req.method === 'POST' ? nextId++ : Number(req.path.split('/').at(-1));
    const body = { ...checks.get(id), ...req.body, id, app: { id: 999 },
      head_sha: req.body.head_sha ?? checks.get(id)?.head_sha };
    checks.set(id, body);
    return { status: req.method === 'POST' ? 201 : 200, origin: 'https://api.github.com', body: structuredClone(body) };
  } };
  const acquirer = { async acquire() { if (beforeAcquire) await beforeAcquire(); return { kind: 'acquired', authority: f.authority, evidence: f.evidence, audit: [] }; } };
  const ports = { store, transport, acquirer, publisherAppId: 999,
    evaluatorRevision: '1'.repeat(40), clock: { now: () => f.now }, readCurrent: async () => structuredClone(current) };
  return { f, checks, writes, ports, setCurrent(c) { current = structuredClone(c); },
    onWrite(fn) { beforeWrite = fn; }, onAcquire(fn) { beforeAcquire = fn; },
    controller: createController(ports), run() { return this.controller.reconcile(f.context, snapshot(), f.now); } };
}
