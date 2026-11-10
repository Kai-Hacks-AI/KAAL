// track Work capability (release-management/F23): says where each piece of Work stands, from observable facts and a model the caller hands in.
// Read-only and pure. It names no role and nothing of a consumer: stations, stages, prefixes, check names and the policy of what is waited for
// all come from the model, and there are no defaults. The consumer's configuration decides them (see ../track-work-kaal/).

const CONDITIONS = {
  noPullRequest: null, ciRed: "ci", ciPending: "ci", behind: "behind", unresolved: "unresolved",
  envelopeFails: "envelope", notApprovedAtHead: "approval", autoMergeOff: "autoMerge",
};
const POSITIONS = ["branch", "change", "promotion", "release"];
const BAD = new Set(["FAILURE", "TIMED_OUT", "CANCELLED", "STARTUP_FAILURE", "ACTION_REQUIRED", "ERROR"]);
const OK = new Set(["SUCCESS", "NEUTRAL", "SKIPPED"]);
const FILTER_KEYS = ["stage", "station", "collector", "waitingFor"];
const plural = (list) => list.join(", ");

function checkModel(model, { order = false } = {}) {
  if (!model || typeof model !== "object") throw new Error("a model is required: the capability has no defaults");
  for (const k of ["defaultBranch", "integrationPrefix"]) if (typeof model[k] !== "string" || !model[k]) throw new Error(`model.${k} is required`);
  if (!model.checks || typeof model.checks.envelope !== "string") throw new Error("model.checks.envelope is required");
  for (const p of POSITIONS) if (!model.positions?.[p] || typeof model.positions[p].stage !== "string") throw new Error(`model.positions.${p}.stage is required`);
  const waits = model.waits;
  if (!Array.isArray(waits) || !waits.length || waits.at(-1).any?.length !== 0) throw new Error("model.waits is required and its last wait must always apply (any: [])");
  for (const w of waits) {
    if (typeof w.name !== "string" || !Array.isArray(w.any)) throw new Error("model.waits: each wait has a name and a list of conditions (any)");
    for (const c of w.any) if (!(c in CONDITIONS)) throw new Error(`model.waits: unknown condition ${c}; the vocabulary is ${plural(Object.keys(CONDITIONS))}`);
  }
  if (order && (!Array.isArray(model.order) || model.order.length !== POSITIONS.length || POSITIONS.some((p) => !model.order.includes(p)))) {
    throw new Error(`model.order is required, a ranking of ${plural(POSITIONS)}, least advanced first`);
  }
}

export function vocabulary(model) {
  checkModel(model);
  const uniq = (xs) => [...new Set(xs)];
  return {
    stage: uniq(POSITIONS.map((p) => model.positions[p].stage)),
    station: uniq(POSITIONS.map((p) => model.positions[p].station).filter(Boolean)),
    waitingFor: [...uniq(model.waits.map((w) => w.name)), "unknown"],
  };
}

// The conditions of one piece: true, false or null (unknown, the fact was not read).
function conditionsOf(piece) {
  if (!piece.pr) return { noPullRequest: true, ciRed: false, ciPending: false, behind: false, unresolved: false, envelopeFails: false, notApprovedAtHead: false, autoMergeOff: false };
  const p = piece.pr;
  const known = (v, f) => (v === undefined || v === null ? null : f(v));
  return {
    noPullRequest: false,
    ciRed: known(p.ci, (v) => v === "FAILURE" || v === "ERROR"),
    ciPending: known(p.ci, (v) => v !== "SUCCESS" && v !== "FAILURE" && v !== "ERROR"),
    behind: known(p.behind, Boolean),
    unresolved: known(p.unresolved, (v) => v > 0),
    envelopeFails: p.envelope === "fail" ? true : p.envelope === "pass" ? false : null,
    notApprovedAtHead: known(p.approvedAtHead, (v) => !v),
    autoMergeOff: known(p.autoMerge, (v) => !v),
  };
}

// The first wait of the model with a true condition wins. An unknown condition before it makes the piece unknown, unless the model marks it provisional.
function waitOf(model, conds) {
  const provisional = [];
  for (const wait of model.waits) {
    if (wait.any.length === 0) return { waitingFor: wait.name, missing: [], provisional };
    if (wait.any.some((c) => conds[c] === true)) return { waitingFor: wait.name, missing: [], provisional };
    const unknown = wait.any.filter((c) => conds[c] === null);
    const blocking = unknown.filter((c) => !model.provisional?.includes(c));
    for (const c of unknown) if (!provisional.includes(c) && model.provisional?.includes(c)) provisional.push(c);
    if (blocking.length) return { waitingFor: "unknown", missing: [...new Set(blocking.map((c) => CONDITIONS[c]))], provisional };
  }
  throw new Error("model.waits: no wait applied");
}

const sourcesOf = (model) => ({
  ci: "the checks of the head", approval: "the reviews of the head", behind: "the merge state", unresolved: "the review threads",
  autoMerge: "the auto-merge request", envelope: `the check "${model.checks.envelope}"`,
});

export function trackWork(facts, { model } = {}) {
  checkModel(model);
  const re = (s) => (s ? new RegExp(s) : null);
  const [idRe, recRe] = [re(model.changeId), re(model.record)];
  const pieces = [];
  const prs = facts.prs ?? [];
  for (const p of prs) {
    const promotion = p.base === model.defaultBranch;
    const change = !promotion && p.base?.startsWith(model.integrationPrefix);
    pieces.push({
      ref: `#${p.number}`, pr: p, position: promotion ? "promotion" : change ? "change" : "branch",
      collector: promotion ? p.head ?? null : change ? p.base : null,
      changeId: idRe?.exec(p.title ?? "")?.[1] ?? null,
      record: p.paths?.map((x) => recRe?.exec(x)?.[1]).find(Boolean) ?? null, headSha: p.headSha,
    });
  }
  for (const b of facts.branches ?? []) pieces.push({ ref: b.name, position: "branch", collector: null, changeId: null, record: null, headSha: b.headSha });
  for (const c of facts.collectors ?? []) {
    if (c.aheadOfMain > 0 && !prs.some((p) => p.base === model.defaultBranch && p.head === c.name)) {
      pieces.push({ ref: c.name, position: "promotion", collector: c.name, changeId: null, record: null, headSha: c.headSha });
    }
  }
  const m = facts.main ?? {};
  if (m.aheadOfLastTag > 0 && !m.release) pieces.push({ ref: m.name ?? "main", position: "release", collector: null, changeId: null, record: null, headSha: m.headSha });
  const sources = sourcesOf(model);
  const work = pieces.map((x) => {
    const { pr, ...rest } = x;
    const wait = waitOf(model, conditionsOf(x));
    const pos = model.positions[x.position];
    return {
      ...rest, stage: pos.stage, station: pos.station ?? null, ...wait,
      evidence: { headSha: x.headSha, sources: x.pr ? { ...sources, ...x.pr.sources } : {} },
    };
  });
  return { work, gaps: facts.gaps ?? [], vocabulary: vocabulary(model) };
}

// Selectors: any-of within one, all-of between them, none lists everything. An unknown value is refused and the known ones named.
export function select(result, selectors = {}) {
  const field = { stage: "stage", station: "station", collector: "collector", waitingFor: "waitingFor" };
  const vocab = { stage: result.vocabulary.stage, station: result.vocabulary.station, waitingFor: result.vocabulary.waitingFor };
  for (const [k, values] of Object.entries(selectors)) {
    if (!FILTER_KEYS.includes(k)) throw new Error(`unknown selector ${k}; the selectors are ${plural(FILTER_KEYS)}`);
    for (const v of values) if (vocab[k] && !vocab[k].includes(v)) throw new Error(`unknown ${k} ${v}; known: ${plural(vocab[k])}`);
  }
  const work = result.work.filter((w) => Object.entries(selectors).every(([k, values]) => !values?.length || values.includes(w[field[k]])));
  return { ...result, work };
}

// Where a Change is: its least-advanced piece by the model's order; a tie takes the first wait of the model; unknown when a piece is.
export function rollUp(result, composition, { model } = {}) {
  checkModel(model, { order: true });
  const byRef = new Map(result.work.map((w) => [w.ref, w]));
  const waitRank = (w) => model.waits.findIndex((x) => x.name === w.waitingFor);
  const changes = {};
  const gaps = [...result.gaps];
  for (const [id, { state, pieces }] of Object.entries(composition)) {
    const found = [];
    for (const ref of pieces) {
      if (byRef.has(ref)) found.push(byRef.get(ref));
      else gaps.push(`${id}: piece ${ref} is not in the facts that were read`);
    }
    found.sort((a, b) => model.order.indexOf(a.position) - model.order.indexOf(b.position) || waitRank(a) - waitRank(b));
    const [least] = found;
    const unknownPieces = found.filter((w) => w.waitingFor === "unknown").map((w) => w.ref);
    changes[id] = {
      state, pieces, position: least?.position ?? null, stage: least?.stage ?? null, station: least?.station ?? null,
      waitingFor: unknownPieces.length || !least ? "unknown" : least.waitingFor, unknownPieces,
    };
  }
  return { changes, gaps };
}

export function render(result) {
  const rank = (w) => POSITIONS.indexOf(w.position);
  const lines = [...result.work].sort((a, b) => rank(a) - rank(b)).map((w) => {
    const notes = [];
    if (w.provisional.length) notes.push(`provisional: ${w.provisional.join(", ")} not read`);
    return `${w.stage}  ${w.station ?? "-"}  ${w.ref}  ${w.changeId ?? "-"}  ${w.collector ?? "-"}  ${w.headSha ?? "-"}  waiting for ${w.waitingFor}${notes.length ? ` (${notes.join("; ")})` : ""}`;
  });
  if (!lines.length) lines.push("nothing matches what was read");
  for (const w of result.work) if (w.waitingFor === "unknown") lines.push(`incomplete: ${w.ref} is unknown, could not read ${w.missing.join(", ")}`);
  for (const g of result.gaps) lines.push(`incomplete: ${g}`);
  return lines.join("\n");
}

// CI is read per check, newest run of each name: an older failed run that a later run of the same check superseded is not red.
// Falls back to the rollup state when the contexts are absent.
export function ciOf(rollup) {
  const nodes = rollup?.contexts?.nodes;
  if (!nodes?.length || rollup.contexts.pageInfo?.hasNextPage) return rollup?.state ?? "PENDING";
  const newest = new Map();
  for (const c of nodes) {
    const key = c.name ?? c.context;
    const seen = newest.get(key);
    if (!seen || (c.startedAt ?? "") >= (seen.startedAt ?? "")) newest.set(key, c);
  }
  const verdicts = [...newest.values()].map((c) => (c.name ? (c.status && c.status !== "COMPLETED" ? "PENDING" : c.conclusion ?? "PENDING") : c.state));
  if (verdicts.some((v) => BAD.has(v))) return "FAILURE";
  return verdicts.every((v) => OK.has(v)) ? "SUCCESS" : "PENDING";
}

// One open pull request as GraphQL gives it (see gather.mjs) to the input of trackWork. The envelope is the verdict of the check the model names.
export function fromGraphql(node, model) {
  checkModel(model);
  const rollup = node.commits?.nodes?.at(-1)?.commit?.statusCheckRollup;
  const context = rollup?.contexts?.nodes?.find((c) => (c.name ?? c.context) === model.checks.envelope);
  const verdict = context?.conclusion ?? context?.state;
  return {
    number: node.number, title: node.title, head: node.headRefName, headSha: node.headRefOid, base: node.baseRefName,
    behind: node.mergeStateStatus === undefined ? undefined : node.mergeStateStatus === "BEHIND",
    ci: ciOf(rollup),
    unresolved: node.reviewThreads ? node.reviewThreads.nodes.filter((t) => !t.isResolved).length : undefined,
    approvedAtHead: node.latestReviews ? node.latestReviews.nodes.some((r) => r.state === "APPROVED" && r.commit?.oid === node.headRefOid) : undefined,
    autoMerge: Boolean(node.autoMergeRequest),
    envelope: verdict === "SUCCESS" ? "pass" : verdict && verdict !== "PENDING" ? "fail" : "unknown",
    paths: (node.files?.nodes ?? []).map((f) => f.path),
  };
}
