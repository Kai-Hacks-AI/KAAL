// PREACH's structural check (agents/F4, agents/A4). It checks a report's shape against the PREACH
// Definition and nothing else: it never interprets the finding or a definition, never picks a
// candidate, never compares meanings, and never checks what a cited authority grants.

const MEMBERS = ["finding", "reportedBy", "candidates", "resolution"];
const CANDIDATE = ["term", "scope", "owner", "definition"];
const UNRESOLVED = ["status", "consult", "question"];
const RESOLVED = ["status", "chosen", "authority"];
const CHOSEN = ["scope", "term"];

const text = (v) => typeof v === "string" && v.trim() !== "";
const object = (v) => v !== null && typeof v === "object" && !Array.isArray(v);

function unknown(value, allowed, at, problems) {
  for (const key of Object.keys(value)) if (!allowed.includes(key)) problems.push(`unknown member: ${at}${key}`);
}

/** The problems of a parsed report, and its one line when it has none. */
export function check(report) {
  const problems = [];
  if (!object(report)) return { problems: ["the report is not a JSON object"] };
  unknown(report, MEMBERS, "", problems);
  if (report.finding === undefined || report.finding === null) problems.push("finding is missing");
  if (!text(report.reportedBy)) problems.push("reportedBy must name the program");
  const candidates = Array.isArray(report.candidates) ? report.candidates : [];
  if (candidates.length === 0) problems.push("candidates: at least one candidate is required");
  const seen = new Map();
  candidates.forEach((c, i) => {
    if (!object(c)) return problems.push(`candidates[${i}] is not an object`);
    unknown(c, CANDIDATE, `candidates[${i}].`, problems);
    for (const key of CANDIDATE) if (!text(c[key])) problems.push(`candidates[${i}]: ${key} is missing`);
    if (text(c.scope) && text(c.term)) {
      const id = `${c.scope}/${c.term}`;
      if (seen.has(id)) problems.push(`candidates[${i}]: duplicate of candidates[${seen.get(id)}] (${id})`);
      else seen.set(id, i);
    }
  });
  const r = report.resolution;
  let line;
  if (!object(r)) problems.push("resolution is missing");
  else if (r.status === "unresolved") {
    unknown(r, UNRESOLVED, "resolution.", problems);
    if (!text(r.consult)) problems.push("resolution: an unresolved report names whom to consult");
    if (!text(r.question)) problems.push("resolution: an unresolved report states the question");
    line = `PREACH report structurally valid: unresolved, consult ${r.consult}: ${r.question}`;
  } else if (r.status === "resolved") {
    unknown(r, RESOLVED, "resolution.", problems);
    if (!text(r.authority)) problems.push("resolution: a claimed resolution needs a cited authority");
    const chosen = object(r.chosen) ? r.chosen : {};
    if (object(r.chosen)) unknown(chosen, CHOSEN, "resolution.chosen.", problems);
    if (!text(chosen.term)) problems.push("resolution.chosen: term is missing");
    else if (!text(chosen.scope)) {
      const sharing = candidates.filter((c) => object(c) && c.term === chosen.term).length;
      problems.push(sharing > 1 ? `resolution.chosen is ambiguous: no scope, and ${sharing} candidates share the term ${chosen.term}` : "resolution.chosen: scope is missing");
    } else if (!seen.has(`${chosen.scope}/${chosen.term}`)) problems.push(`resolution.chosen ${chosen.scope}/${chosen.term} is not among the candidates`);
    line = `PREACH report structurally valid: resolution claimed under ${r.authority}: ${chosen.scope}/${chosen.term} (authority not verified)`;
  } else problems.push(`resolution.status must be "unresolved" or "resolved"`);
  return problems.length ? { problems } : { problems, line };
}
