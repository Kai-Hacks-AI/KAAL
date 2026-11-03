// The Review record: its schema, its validation, its extraction from a published body, and its analysis.
// Deterministic and dependency-free. It reads records and judges their shape; it decides nothing about any work.
export const SCHEMA = "kaal-review/1";
export const MARKER = "kaal-review:record";
export const KNOWN_SCHEMAS = [SCHEMA];
export const SEVERITIES = ["blocker", "major", "minor", "nit"];
export const STATUSES = ["open", "fixed", "not fixed", "withdrawn"];
export const DIMENSIONS = ["correctness", "tests", "error handling", "security", "performance", "compatibility", "documentation", "dependencies", "other"];
export const OUTCOMES = ["satisfied", "failed", "not_shown"];

const REQUEST_FIELDS = ["subject", "scope", "lenses", "severity_floor", "evidence_expected", "checks", "claims", "independence", "prior"];
const AUTHORITY_FIELDS = ["approval", "approve", "approved", "merge", "verdict", "decision", "authority"];
const TOP_FIELDS = [
  "schema", "id", "reviewer", "time", "subject", "request", "lenses", "checks", "findings", "below_floor", "claims",
  "not_checked", "human_to_observe", "self_check", "round", "prior", "dispositions",
];

const isObject = (v) => typeof v === "object" && v !== null && !Array.isArray(v);
const isString = (v) => typeof v === "string" && v.length > 0;
const rank = (s) => SEVERITIES.indexOf(s);

/** Validate a record. Returns { errors }. Never throws on malformed input. */
export function validateRecord(record) {
  const errors = [];
  const err = (m) => errors.push(m);
  if (!isObject(record)) return { errors: ["the record is not an object"] };
  if (!KNOWN_SCHEMAS.includes(record.schema)) err(`schema must be one of ${KNOWN_SCHEMAS.join(", ")}, not ${JSON.stringify(record.schema)}`);
  for (const key of AUTHORITY_FIELDS) if (key in record) err(`${key}: a record has no approval, merge or verdict field; approval is separate from Review`);
  for (const key of Object.keys(record)) if (!TOP_FIELDS.includes(key) && !AUTHORITY_FIELDS.includes(key)) err(`${key}: unknown field`);
  for (const key of ["id", "time"]) if (!isString(record[key])) err(`${key} is required`);
  if (!isObject(record.reviewer) || !isString(record.reviewer.actor) || !isString(record.reviewer.independence)) err("reviewer needs actor and independence");
  if (!isObject(record.subject) || !isString(record.subject.repository) || !isString(record.subject.head)) err("subject needs repository and head");
  else if (record.subject.paths !== undefined && !Array.isArray(record.subject.paths)) err("subject.paths must be a list");
  const request = isObject(record.request) ? record.request : (err("request is required"), {});
  for (const key of Object.keys(request)) {
    if (AUTHORITY_FIELDS.includes(key)) err(`request.${key}: a request cannot ask Review to approve, merge or decide`);
    else if (!REQUEST_FIELDS.includes(key)) err(`request.${key}: unknown request field`);
  }
  const floor = request.severity_floor ?? "nit";
  if (!SEVERITIES.includes(floor)) err(`request.severity_floor must be one of ${SEVERITIES.join(", ")}`);
  for (const key of ["lenses", "checks", "findings", "claims", "not_checked", "human_to_observe"]) if (!Array.isArray(record[key])) err(`${key} must be a list`);
  if (!Number.isInteger(record.below_floor) || record.below_floor < 0) err("below_floor must be a count of findings below the severity floor");
  if (!Number.isInteger(record.round) || record.round < 1) err("round must be a whole number from 1");
  if (record.prior !== null && !isString(record.prior)) err("prior must be the id of the earlier record, or null");
  if (record.dispositions !== undefined && !isObject(record.dispositions)) err("dispositions must be an object keyed by finding id (the invoker's, never written by Review)");

  const findings = Array.isArray(record.findings) ? record.findings : [];
  const ids = new Set();
  findings.forEach((f, i) => {
    const name = isObject(f) && isString(f.id) ? f.id : `findings[${i}]`;
    if (!isObject(f)) return err(`${name} is not an object`);
    if (ids.has(f.id)) err(`${name}: duplicate id`);
    ids.add(f.id);
    for (const key of ["id", "location", "claim", "impact", "direction"]) if (!isString(f[key])) err(`${name}: ${key} is required`);
    if (!SEVERITIES.includes(f.severity)) err(`${name}: severity must be one of ${SEVERITIES.join(", ")}`);
    else if (SEVERITIES.includes(floor) && rank(f.severity) > rank(floor)) err(`${name}: ${f.severity} is below the severity floor ${floor}; count it in below_floor, do not list it`);
    if (!DIMENSIONS.includes(f.dimension)) err(`${name}: dimension must be one of ${DIMENSIONS.join(", ")}`);
    if (!STATUSES.includes(f.status)) err(`${name}: status must be one of ${STATUSES.join(", ")}`);
    if (!isObject(f.evidence) || !["observed", "inferred"].includes(f.evidence.kind) || !isString(f.evidence.detail)) err(`${name}: evidence needs kind (observed or inferred) and detail`);
  });

  const recorded = new Set((Array.isArray(record.checks) ? record.checks : []).map((c) => c && c.command));
  (Array.isArray(record.checks) ? record.checks : []).forEach((c, i) => {
    if (!isObject(c) || !isString(c.command) || !Number.isInteger(c.exit_status) || typeof c.output !== "string") err(`checks[${i}] needs command, exit_status and output as observed`);
  });

  const sc = isObject(record.self_check) ? record.self_check : (err("self_check is required"), {});
  const listed = (key, field) => new Set((Array.isArray(sc[key]) ? sc[key] : []).map((e) => e && e[field]));
  for (const c of Array.isArray(request.checks) ? request.checks : []) {
    const command = isObject(c) ? c.command : c;
    if (!listed("checks", "command").has(command)) err(`self_check.checks: requested check ${JSON.stringify(command)} is missing`);
  }
  for (const e of Array.isArray(sc.checks) ? sc.checks : []) {
    if (e && e.ran === true && !recorded.has(e.command)) err(`self_check.checks: ${JSON.stringify(e.command)} is stated as run but there is no record of it`);
  }
  for (const l of Array.isArray(request.lenses) ? request.lenses : []) {
    if (!listed("lenses", "source").has(l)) err(`self_check.lenses: requested lens ${JSON.stringify(l)} is missing`);
  }
  for (const c of Array.isArray(request.claims) ? request.claims : []) {
    if (!listed("claims", "claim").has(c)) err(`self_check.claims: requested claim ${JSON.stringify(c)} is missing`);
  }
  for (const e of Array.isArray(sc.claims) ? sc.claims : []) if (e && !OUTCOMES.includes(e.outcome)) err(`self_check.claims: outcome must be one of ${OUTCOMES.join(", ")}`);
  if (!Array.isArray(sc.inference_only)) err("self_check.inference_only must list the findings that rest on inference alone");
  else for (const f of findings) {
    if (isObject(f) && isObject(f.evidence) && f.evidence.kind === "inferred" && !sc.inference_only.includes(f.id)) err(`${f.id}: rests on inference and must be listed in self_check.inference_only`);
  }
  return { errors };
}

/** Find the records in a published body: only those that follow the marker, as the next fenced json block. */
export function extractRecords(text) {
  const found = [];
  const re = new RegExp(`${MARKER}[^\\n]*\\n+\\s*\`\`\`json\\s*\\n([\\s\\S]*?)\\n\\s*\`\`\``, "g");
  for (const m of String(text).matchAll(re)) {
    try {
      found.push({ record: JSON.parse(m[1]) });
    } catch (e) {
      found.push({ error: `the record after the marker is not valid JSON: ${e.message}` });
    }
  }
  return found;
}

const bump = (o, k, n = 1) => {
  o[k] = (o[k] ?? 0) + n;
};

/** The capability a path belongs to, from its package folder; the path's own convention, not a lookup. */
export function capabilityOf(path) {
  const m = /^packages\/(?:skills\/|extensions\/)?([^/]+)\//.exec(path);
  return m ? m[1] : "other";
}

/** Analyse records across pull requests. Observations only: it holds no verdict, approval or gate. */
export function analyse(items) {
  const s = {
    records: items.length, bySeverity: {}, byStatus: {}, byRound: {}, byDimension: {}, byCapability: {},
    failedChecks: [], failedClaims: [], lensesNotFound: [], unknownSchema: [], invalid: [], converged: [],
  };
  for (const { source, record, error } of items) {
    if (error) {
      s.invalid.push({ source, errors: [error] });
      continue;
    }
    if (isObject(record) && typeof record.schema === "string" && !KNOWN_SCHEMAS.includes(record.schema)) {
      s.unknownSchema.push({ source, schema: record.schema });
      continue;
    }
    const { errors } = validateRecord(record);
    if (errors.length) {
      s.invalid.push({ source, errors });
      continue;
    }
    bump(s.byRound, record.round);
    const paths = record.subject.paths ?? [];
    const caps = [...new Set(paths.map(capabilityOf))].filter((c) => c !== "other");
    for (const f of record.findings) {
      bump(s.bySeverity, f.severity);
      bump(s.byStatus, f.status);
      bump(s.byDimension, f.dimension);
    }
    for (const c of caps) bump(s.byCapability, c);
    for (const c of record.checks) if (c.exit_status !== (c.expected_status ?? 0)) s.failedChecks.push({ source, command: c.command, exit_status: c.exit_status });
    for (const c of record.claims) if (c.outcome === "failed") s.failedClaims.push({ source, claim: c.claim });
    for (const l of record.lenses) if (l.applied === false) s.lensesNotFound.push({ source, source_of_lens: l.source, source: l.source });
    const floor = record.request.severity_floor ?? "nit";
    const open = record.findings.filter((f) => f.status === "open" && rank(f.severity) <= rank(floor));
    s.converged.push({ source, id: record.id, observed: open.length === 0 });
  }
  return s;
}
