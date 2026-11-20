// Compares a run report with a register of expected failures. Pure: no I/O, no import. It lists what it finds and decides nothing.
// The register belongs to someone else; this module knows only its format.
export const SCHEMA = 'kaal-testing/expectations@1';
export const REGISTER_SCHEMA = 'kaal-testing/expected-failures@1';

/** Throws unless `register` is a register in the format above: a list of entries with unique ids and an optional text reference. */
export function checkRegister(register) {
  if (!register || typeof register !== 'object' || register.schema !== REGISTER_SCHEMA) throw new Error(`invalid register: schema must be ${REGISTER_SCHEMA}`);
  if (!Array.isArray(register.expected)) throw new Error('invalid register: expected must be a list');
  const seen = new Set();
  for (const e of register.expected) {
    if (!e || typeof e.id !== 'string' || e.id === '') throw new Error('invalid register: an entry has no id');
    if (e.reference !== undefined && typeof e.reference !== 'string') throw new Error('invalid register: reference must be text');
    if (seen.has(e.id)) throw new Error(`invalid register: duplicate id ${e.id}`);
    seen.add(e.id);
  }
}

/**
 * Lists, for each registered id, whether the run observed it failing (`held`), passing (`notHolding`: the entry no longer describes the test and its owner removes it),
 * neither (`unconfirmed`) or not at all (`absent`, provisional when its file was not run or its execution had problems), and which RED nobody registered (`unexpected`).
 * The report is not changed and its counts stay what was observed. `complete` repeats whether the run itself was complete: no conclusion is stronger than the observation behind it.
 */
export function compareExpectations(report, register) {
  checkRegister(register);
  const byId = new Map(report.tests.map((t) => [t.id, t]));
  const entry = (e, extra = {}) => ({ id: e.id, ...(e.reference === undefined ? {} : { reference: e.reference }), ...extra });
  const out = { schema: SCHEMA, complete: report.execution.complete, register: { count: register.expected.length }, held: [], notHolding: [], unconfirmed: [], absent: [], unexpected: [] };
  const listed = new Set(register.expected.map((e) => e.id));
  for (const e of register.expected) {
    const t = byId.get(e.id);
    if (!t) {
      const file = e.id.split(' > ')[0];
      const why = !report.execution.files.includes(file) ? 'file not run' : report.execution.problems.some((p) => p.file === file) ? 'file had execution problems' : null;
      out.absent.push(entry(e, { provisional: why !== null, ...(why ? { reason: why } : {}) }));
    } else if (t.actual === 'RED') out.held.push(entry(e));
    else if (t.actual === 'GREEN') out.notHolding.push(entry(e, { actual: 'GREEN', note: 'the entry no longer describes this test; its owner removes it' }));
    else out.unconfirmed.push(entry(e, { actual: t.actual }));
  }
  for (const t of report.tests) if (t.actual === 'RED' && !listed.has(t.id)) out.unexpected.push({ id: t.id });
  out.counts = { held: out.held.length, notHolding: out.notHolding.length, unconfirmed: out.unconfirmed.length, absent: out.absent.length, unexpected: out.unexpected.length };
  return out;
}
