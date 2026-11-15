// Engineering orchestration only. Authority, observations and verdicts belong to
// the supplied integration ports; Testing owns all scheduling/duplicate semantics.
const object = (x) => x !== null && typeof x === "object" && !Array.isArray(x);
const text = (x) => typeof x === "string" && x.trim().length > 0;

function validate(input, ports) {
  if (!object(input) || !Array.isArray(input.requests) || input.requests.length === 0 || !object(input.context)) throw new TypeError("execution input needs requests and context");
  const ids = new Set();
  for (const q of input.requests) {
    if (!object(q) || !text(q.id) || ids.has(q.id) || q.owner == null || q.entrypoint == null) throw new TypeError("every request needs a unique id, owner and original entrypoint");
    ids.add(q.id);
  }
  if (!object(ports) || !object(ports.testing)) throw new TypeError("execution ports are required");
  for (const name of ["execute", "original", "evaluate", "publish"]) if (typeof ports[name] !== "function") throw new TypeError(`missing execution port ${name}`);
  for (const name of ["schedule", "duplicates"]) if (typeof ports.testing[name] !== "function") throw new TypeError(`missing Testing port ${name}`);
}

// Check consumer-side reference integrity, never compute a deduplication key or
// group files ourselves. Invalid owner plans cannot silently omit obligations.
function readable(plan, group) {
  if (!object(plan) || !Array.isArray(plan.runs) || !Array.isArray(plan.reads) || !Array.isArray(plan.findings) || plan.findings.length || plan.runs.length === 0) return false;
  const by = new Map(group.map((g) => [g.request.id, g.qualified.request]));
  if (group.some((g) => !Array.isArray(g.qualified.request.files) || g.qualified.request.files.some((f) => !object(f) || !text(f.path) || !text(f.sha256)))) return false;
  const seen = new Map();
  for (const r of plan.reads) {
    if (!object(r) || !by.has(r.by) || !Number.isInteger(r.run) || r.run < 0 || r.run >= plan.runs.length) return false;
    const run = plan.runs[r.run], q = by.get(r.by);
    if (!object(run) || !Array.isArray(run.for) || !run.for.includes(r.by) || r.file !== run.file || !Array.isArray(q.files)) return false;
    if (!q.files.some((f) => f?.path === run.file && f.sha256 === run.sha256) || run.subject !== q.subject || run.platform !== q.platform || run.node !== q.node) return false;
    if (!seen.has(r.by)) seen.set(r.by, new Set());
    if (seen.get(r.by).has(r.run)) return false;
    seen.get(r.by).add(r.run);
  }
  for (const [id, q] of by) {
    if (!Array.isArray(q.files) || q.files.length === 0 || !seen.has(id)) return false;
    for (const f of q.files) if (!plan.reads.some((r) => r.by === id && plan.runs[r.run].file === f.path && plan.runs[r.run].sha256 === f.sha256)) return false;
  }
  return plan.runs.every((r, i) => object(r) && Array.isArray(r.for) && r.for.length > 0 && r.for.every((id) => by.has(id) && plan.reads.some((read) => read.by === id && read.run === i)));
}

/**
 * Run declared work through trusted integration ports. There is no live CI
 * provider here. With no independent authorization, every original path runs.
 * No state, observation cache, clock, host access or evidence transport is kept.
 */
export async function run(input, ports) {
  validate(input, ports);
  const { requests, context } = input;
  const findings = [], executions = [], fatal = [];
  const advice = { availability: "unknown", schedulingFindings: [] };
  const requestResults = requests.map((q) => ({ id: q.id, owner: q.owner, context, observations: [] }));
  const results = new Map(requestResults.map((r) => [r.id, r]));
  let authorization;
  try { if (typeof ports.authorize === "function") authorization = await ports.authorize(input); }
  catch (error) { findings.push({ code: "activation-unavailable", error }); }
  const authorized = object(authorization) && context.mode === "reuse";
  const mode = authorized ? "reuse" : "original";
  if (!authorized && !findings.length) findings.push({ code: "activation-unqualified" });

  const classified = [];
  for (const request of requests) {
    let qualified;
    if (authorized) {
      try { if (typeof ports.qualify === "function") qualified = await ports.qualify(request, context); }
      catch (error) { findings.push({ code: "qualification-unavailable", request: request.id, error }); }
    }
    if (qualified !== undefined && (!object(qualified) || qualified.domain == null || qualified.domain === "" || !object(qualified.request) || qualified.request.by !== request.id)) {
      findings.push({ code: "qualification-unqualified", request: request.id });
      qualified = undefined;
    }
    classified.push({ request, qualified });
  }

  // Contiguous groups preserve original ordering. An opaque/original operation
  // or another domain is a barrier; wider reuse needs a separate proven contract.
  const steps = [];
  for (const item of classified) {
    const last = steps.at(-1);
    if (item.qualified && last?.kind === "scheduled" && last.domain === item.qualified.domain) last.group.push(item);
    else steps.push(item.qualified ? { kind: "scheduled", domain: item.qualified.domain, group: [item] } : { kind: "original", group: [item] });
  }

  async function acquire(kind, detail, operation) {
    let observation;
    try {
      observation = await operation();
      if (!object(observation)) throw new TypeError("the execution port returned no original observation");
    } catch (error) {
      fatal.push(error);
      findings.push({ code: "execution-unavailable", kind, ...detail, error });
    }
    executions.push({ kind, ...detail, observation });
    return observation;
  }
  async function originals(group) {
    for (const { request } of group) {
      const observation = await acquire("original", { request: request.id }, () => ports.original(request));
      results.get(request.id).observations.push(observation);
    }
  }
  for (const step of steps) {
    if (step.kind === "original") { await originals(step.group); continue; }
    let plan;
    try { plan = await ports.testing.schedule(step.group.map((g) => g.qualified.request)); }
    catch (error) { findings.push({ code: "schedule-unavailable", error }); }
    if (!readable(plan, step.group)) {
      if (Array.isArray(plan?.findings)) advice.schedulingFindings.push(...plan.findings);
      findings.push({ code: "schedule-unqualified" });
      await originals(step.group);
      continue;
    }
    const observed = [];
    for (const scheduled of plan.runs) observed.push(await acquire("scheduled", { run: scheduled, domain: step.domain }, () => ports.execute(scheduled, step.domain)));
    for (const read of plan.reads) results.get(read.by).observations.push(observed[read.run]);
  }

  let verdict;
  try { verdict = await ports.evaluate(requestResults, context); }
  catch (error) { fatal.push(error); findings.push({ code: "evaluation-unavailable", error }); }
  if (!object(verdict)) {
    const error = new TypeError("the evaluator returned no original verdict");
    fatal.push(error); findings.push({ code: "evaluation-unavailable", error });
  }

  // An incomplete observation is never profiled as a complete distribution.
  const complete = executions.every((e) => object(e.observation) && e.observation.complete === true && Array.isArray(e.observation.events));
  if (complete) {
    try {
      const runs = executions.flatMap((e) => e.observation.events);
      advice.duplicates = await ports.testing.duplicates({ runs });
      if (object(advice.duplicates) && ["challenged", "unchallenged", "unknown"].includes(advice.duplicates.result)) advice.availability = advice.duplicates.result === "unknown" ? "unknown" : "available";
      else findings.push({ code: "analysis-unavailable" });
    } catch (error) { findings.push({ code: "analysis-unavailable", error }); }
  } else findings.push({ code: "analysis-unavailable", reason: "original event evidence is incomplete" });

  const report = { mode, requestResults, executions, verdict, advice, findings };
  try { await ports.publish(Object.freeze({ ...report })); }
  catch (error) { findings.push({ code: "publication-unavailable", error }); }
  if (fatal.length) {
    const error = new AggregateError(fatal, "original execution or evaluation could not be established");
    error.report = report;
    throw error;
  }
  return report;
}
