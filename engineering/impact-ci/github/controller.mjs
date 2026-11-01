// Unwired: trusted composition supplies durable serializable transactions, API
// authentication, current-context reads and the authenticating acquisition port.
import { digest, establishFullMatrix, fullExpected, fullManifest } from '../full-policy.mjs';
import { judgeFullMatrix } from '../full-gate.mjs';
const root = '/repos/Kai-Hacks-AI/KAAL/check-runs';
const journal = 'kaal-gates/v1';
const unresolved = error => ({ state: 'unresolved', errors: [String(error)], enforcementGap: true });
export function createController({ store, transport, acquirer, readCurrent, clock, publisherAppId, evaluatorRevision }) {
  if (!store?.transaction || !transport?.request || !acquirer?.acquire || !readCurrent || !clock?.now ||
      !Number.isSafeInteger(publisherAppId) || publisherAppId <= 0 || publisherAppId === 15368 ||
      !/^[a-f0-9]{40}$/.test(evaluatorRevision)) throw new TypeError('dedicated trusted publisher ports required');
  const tx = fn => store.transaction(journal, fn);
  async function request(method, path, body) {
    const r = await transport.request({ method, path, ...(body ? { body } : {}), redirect: 'error' });
    if (r.origin !== 'https://api.github.com' || r.status !== (method === 'POST' ? 201 : 200))
      throw new Error('publication acknowledgement unknown');
    return r.body;
  }
  async function write(slotKey, epoch, expected, result, now) {
    const reservation = await tx(s => {
      const slot = s.slots[slotKey];
      if (s.operation || s.epoch !== epoch) return null;
      const external_id = `kaal:${digest({ slotKey, epoch, context: slot.contextDigest, evaluatorRevision })}`;
      const pending = result.verdict === 'pending';
      const body = { name: slot.gate, external_id, status: pending ? 'in_progress' : 'completed',
        conclusion: pending ? null : result.verdict === 'passed' ? 'success' : 'failure',
        output: { title: result.verdict.toUpperCase(), summary: JSON.stringify({
          state: result.verdict === 'unresolved' ? 'UNRESOLVED' : result.verdict,
          certificate: slot.certificate, evaluatorRevision, epoch, observedAt: now,
          evidenceDigest: result.evidenceDigest ?? null, errors: result.errors, ledger: result.ledger ?? [] }) } };
      if (!slot.checkId) body.head_sha = slot.sha;
      s.operation = { slotKey, epoch, checkId: slot.checkId, external_id, body, state: 'reserved' };
      return s.operation;
    });
    if (!reservation) throw new Error('publication fenced by changed generation/outbox');
    // Persist BEFORE network. A crash/timeout leaves an unresolved operation.
    // Do not retry creates or clear uncertain writes on an in-memory lease.
    try {
      const method = reservation.checkId ? 'PATCH' : 'POST';
      const path = reservation.checkId ? `${root}/${reservation.checkId}` : root;
      const ack = await request(method, path, reservation.body);
      if (!Number.isSafeInteger(ack.id) || ack.id <= 0 || reservation.checkId && ack.id !== reservation.checkId)
        throw new Error('publisher check identity mismatch');
      const got = await request('GET', `${root}/${ack.id}`);
      const slot = await tx(s => s.slots[slotKey]);
      if (got.id !== ack.id || got.app?.id !== publisherAppId || got.head_sha !== slot.sha ||
          got.name !== slot.gate || got.external_id !== reservation.external_id ||
          got.status !== reservation.body.status || got.conclusion !== reservation.body.conclusion)
        throw new Error('publisher read-back mismatch');
      const fresh = await tx(s => {
        s.slots[slotKey].checkId = got.id;
        s.slots[slotKey].last = result.verdict;
        s.slots[slotKey].lastReadBack = { id: got.id, appId: got.app.id, sha: got.head_sha,
          externalId: got.external_id, status: got.status, conclusion: got.conclusion, acknowledgedAt: clock.now() };
        s.operation = null;
        return s.epoch === epoch;
      });
      return fresh;
    } catch (error) {
      await tx(s => { if (s.operation) s.operation.state = 'unknown'; });
      throw error;
    }
  }
  return Object.freeze({ async reconcile(input, snapshot) {
    let registration, expected, trustedContext;
    try {
      const now = clock.now();
      const context = structuredClone(input);
      // Authenticate the current tuple before policy establishment, so drift or
      // retargeting that makes establishment fail can still retire old assurance.
      if (digest(await readCurrent(context)) !== digest(context)) throw new Error('current context mismatch');
      trustedContext = context;
      const authority = establishFullMatrix(context, snapshot); expected = fullExpected(authority);
      if (!Number.isSafeInteger(now) || now < context.startedAt) throw new Error('trusted clock unavailable');
      if (digest(await readCurrent(context)) !== expected.contextDigest) throw new Error('current context mismatch');
      const subject = digest({ repositoryId: context.repositoryId, event: context.event, pr: context.pr });
      const key = digest({ repositoryId: context.repositoryId, sha: context.publicationSha, gate: expected.gate });
      const bindingDigest = digest({ context: expected.contextDigest, policy: expected.policyDigest,
        matrix: expected.matrixDigest, evaluatorRevision });
      registration = await tx(s => {
        s.epoch++;
        if (s.operation) return { blocked: 'outstanding publication requires external reconciliation' };
        const previous = s.subjects[subject], old = s.slots[key];
        const collision = old && old.subject !== subject;
        const changedWithoutGeneration = previous && previous.bindingDigest !== bindingDigest && context.generation <= previous.generation;
        const retire = previous && previous.key !== key ? previous.key : null;
        s.slots[key] ??= { subject, gate: expected.gate, sha: context.publicationSha, checkId: null };
        const slot = s.slots[key];
        slot.conflict = Boolean(slot.conflict || collision || changedWithoutGeneration);
        slot.contextDigest = expected.contextDigest; slot.generation = context.generation;
        slot.certificate = { context: expected.context, policy: expected.policy,
          policyDigest: expected.policyDigest, matrixDigest: expected.matrixDigest };
        s.subjects[subject] = { key, bindingDigest, generation: context.generation };
        return { key, epoch: s.epoch, retire, conflict: slot.conflict };
      });
      if (registration.blocked) return unresolved(registration.blocked);
      const { epoch, retire, conflict } = registration;
      if (retire) {
        // Old SHA is revoked before replacement evaluation. Read-back is required;
        // this still cannot fence a GitHub merge during registration latency.
        if (!await write(retire, epoch, expected, { verdict: 'unresolved', errors: ['retired subject revision'] }, now))
          throw new Error('retirement fenced');
      }
      if (!await write(key, epoch, expected, { verdict: conflict ? 'unresolved' : 'pending',
        errors: conflict ? ['competing subject or non-monotonic generation'] : ['acquiring full execution evidence'] }, now))
        throw new Error('initial invalidation fenced');
      if (conflict) return unresolved('same-SHA context conflict requires governed resolution');
      const acquired = await acquirer.acquire(context, snapshot, now);
      const current = await readCurrent(context);
      const judgedAt = clock.now();
      let result;
      if (!Number.isSafeInteger(judgedAt) || judgedAt < now) result = { verdict: 'unresolved', errors: ['clock regressed during acquisition'] };
      else if (digest(current) !== expected.contextDigest) result = { verdict: 'unresolved', errors: ['context advanced before finalization'] };
      else if (acquired.kind !== 'acquired') result = { verdict: 'unresolved', errors: acquired.errors ?? ['acquisition unavailable'] };
      else {
        let matching = false;
        try { matching = fullExpected(acquired.authority).contextDigest === expected.contextDigest; } catch { /* refused below */ }
        result = matching ? judgeFullMatrix(acquired.authority, fullManifest(acquired.authority), acquired.evidence, current, judgedAt)
          : { verdict: 'unresolved', errors: ['authenticated authority mismatch'] };
      }
      if (acquired.kind === 'acquired') result.evidenceDigest = digest({ evidence: acquired.evidence,
        capture: acquired.capture ?? null, audit: acquired.audit ?? [] });
      const fresh = await write(key, epoch, expected, result, judgedAt);
      const publishedAt = clock.now();
      if (!fresh || !Number.isSafeInteger(publishedAt) || publishedAt < judgedAt ||
          result.verdict === 'passed' && publishedAt >= context.deadline || digest(await readCurrent(context)) !== expected.contextDigest) {
        // Compensate a detected stale write. It may already have been observable;
        // never claim this provides atomic invalidation or a merge fence.
        const repairEpoch = await tx(s => ++s.epoch);
        await write(key, repairEpoch, expected, { verdict: 'unresolved', errors: ['publication race detected'] }, now);
        return unresolved('publication race detected; intervening merge cannot be excluded');
      }
      return { state: ({ passed: 'green', failed: 'red', pending: 'pending', unresolved: 'unresolved' })[result.verdict],
        result, capture: acquired.capture ?? null, audit: acquired.audit ?? [],
        acquisitionStartedAt: now, evaluatedAt: judgedAt, publicationObservedAt: publishedAt, enforcementGap: true };
    } catch (error) {
      if (trustedContext) {
        try {
          const subject = digest({ repositoryId: trustedContext.repositoryId, event: trustedContext.event, pr: trustedContext.pr });
          const retirement = await tx(s => {
            if (s.operation) return null; // unknown in-flight write cannot be safely retried
            const previous = s.subjects[subject];
            if (!previous) return null;
            return { key: previous.key, epoch: ++s.epoch };
          });
          if (retirement) await write(retirement.key, retirement.epoch, expected,
            { verdict: 'unresolved', errors: [error.message] }, clock.now());
        } catch (revokeError) { return unresolved(`${error.message}; revocation unresolved: ${revokeError.message}`); }
      }
      return unresolved(error.message);
    }
  } });
}
