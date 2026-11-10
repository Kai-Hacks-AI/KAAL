// track Work (release-management/C7): a read-only report of where each piece of Work stands per station. It judges nothing: it sorts the
// facts the release controls hold and the verdicts they gave. Pure functions of data the caller gathers (run.mjs gathers).
const ENVELOPE_CHECK = "verify Envelope"; // the control's check; the rule itself lives only in that control
const ROLES = { cto: ["about to open", "in stock"], cpo: ["about to close"] };
const STATIONS = ["10-npmjs", "11-main", "12-collectors"];

const stationOf = (base) => (base === "main" ? "11-main" : "12-collectors");
const changeIdOf = (title) => /\/(C\d+) /.exec(title ?? "")?.[1] ?? null;
const plural = (n, w) => `${n} ${w}${n === 1 ? "" : "s"}`;

function sortPr(pr) {
  let waitsOn = [];
  if (pr.ci === "FAILURE" || pr.ci === "ERROR") waitsOn.push("CI is red");
  else if (pr.ci !== "SUCCESS") waitsOn.push("CI is pending");
  if (pr.behind) waitsOn.push(`the branch is behind ${pr.base}`);
  if (pr.unresolved > 0) waitsOn.push(`${plural(pr.unresolved, "unresolved conversation")}`);
  if (pr.envelope === "fail") waitsOn.push("the envelope fails");
  const envelope = pr.envelope ?? "unknown";
  const provisional = envelope === "unknown" ? ["envelope unknown (provisional)"] : [];
  let state, owner;
  if (waitsOn.length) [state, owner] = ["in stock", "CTO"];
  else if (!pr.approvedAtHead) [state, owner, waitsOn] = ["about to close", "CPO", ["approval at this head"]];
  else if (!pr.autoMerge) [state, owner, waitsOn] = ["in stock", "CTO", ["auto-merge is off"]];
  else [state, owner, waitsOn] = ["queued", "nobody", ["the merge queue"]];
  return { station: stationOf(pr.base), ref: `#${pr.number}`, changeId: changeIdOf(pr.title), headSha: pr.headSha, state, owner, envelope, waitsOn: [...waitsOn, ...provisional] };
}

export function trackWork(facts, { role } = {}) {
  const prs = facts.prs ?? [];
  const work = prs.map(sortPr);
  for (const b of facts.branches ?? []) {
    work.push({ station: stationOf(b.base), ref: b.name, changeId: null, headSha: b.headSha, state: "about to open", owner: "CTO", waitsOn: ["a pull request"] });
  }
  for (const c of facts.collectors ?? []) {
    if (c.aheadOfMain > 0 && !prs.some((p) => p.base === "main" && p.head === c.name)) {
      work.push({ station: "11-main", ref: c.name, changeId: null, headSha: c.headSha, state: "about to open", owner: "CTO", waitsOn: ["a promotion pull request"] });
    }
  }
  const m = facts.main ?? {};
  if (m.aheadOfLastTag > 0 && !m.release) {
    work.push({ station: "10-npmjs", ref: "main", changeId: null, headSha: m.headSha, state: "about to open", owner: "CTO", waitsOn: ["a Release for the new head"] });
  }
  work.sort((a, b) => STATIONS.indexOf(a.station) - STATIONS.indexOf(b.station) || a.ref.localeCompare(b.ref));
  return { work: role ? work.filter((w) => ROLES[role]?.includes(w.state)) : work, gaps: facts.gaps ?? [] };
}

// The role-facing report: a role is required, and what could not be read is shown, never implied away.
export function render(result, { role } = {}) {
  if (!ROLES[role]) throw new Error("--role cto|cpo is required");
  const lines = result.work.filter((w) => ROLES[role].includes(w.state)).map((w) =>
    `${w.station}  ${w.ref}  ${w.changeId ?? "-"}  ${w.headSha ?? "-"}  ${w.state}: ${w.waitsOn.join("; ")}`);
  if (!lines.length) lines.push(`nothing ${role.toUpperCase()} can work on from what was read`);
  for (const g of result.gaps) lines.push(`incomplete: ${g}`);
  return lines.join("\n");
}

// One open pull request as GraphQL gives it (see run.mjs) to the input of trackWork.
export function fromGraphql(node) {
  const last = node.commits?.nodes?.at(-1)?.commit;
  const rollup = last?.statusCheckRollup;
  const context = rollup?.contexts?.nodes?.find((c) => (c.name ?? c.context) === ENVELOPE_CHECK);
  const verdict = context?.conclusion ?? context?.state;
  return {
    number: node.number, title: node.title, head: node.headRefName, headSha: node.headRefOid, base: node.baseRefName,
    behind: node.mergeStateStatus === "BEHIND",
    ci: rollup?.state ?? "PENDING",
    unresolved: (node.reviewThreads?.nodes ?? []).filter((t) => !t.isResolved).length,
    approvedAtHead: (node.latestReviews?.nodes ?? []).some((r) => r.state === "APPROVED" && r.commit?.oid === node.headRefOid),
    autoMerge: Boolean(node.autoMergeRequest),
    envelope: verdict === "SUCCESS" ? "pass" : verdict && verdict !== "PENDING" ? "fail" : "unknown",
  };
}
