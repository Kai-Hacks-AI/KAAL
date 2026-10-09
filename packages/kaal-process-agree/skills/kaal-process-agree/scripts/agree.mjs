#!/usr/bin/env node
// agree begin <loop> --worker <actor> --reviewer <actor> --rounds <n> --words <text|@file>
// agree state <loop>
// agree request <loop> [--standard <SKILL.md of kaal-intent>]
// agree submit <loop> <file>
// agree relay <loop> --result findings|converged --actor <actor> --saw <file> --source <text> [--findings <text|@file>]
// agree direct <loop> --reason <code> --direction continue|stop [--rounds <n>] --words <text|@file>
//
// The Agreement process for describing an Intent: a Worker puts versions of an
// Intent forward, a Reviewer the Owner named reports on each, and `state` says
// from the record, every time, what may happen next. Nothing is stored as a
// status. The record is `<loop>/grant.md` (the Owner's, read here and never
// written after `begin`) and `<loop>/log/NN-subject.md | NN-round.md | NN-how.md`,
// one gapless sequence. Review owns the form of a round (its own parser reads
// it) and Intent owns what an Intent is and its identity; this file owns only
// the relation between them. Of a round it reads the outcome, the subject
// identity, its place and one `Actor:` line, and nothing inside the findings.
// It cannot see who runs it; the grant, the actor line and the provenance in a
// round are for an owner to inspect, not proof.
import { createHash } from "node:crypto";
import { existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const here = (relative) => new URL(relative, import.meta.url).href;
async function sibling(name, file) {
  try {
    return await import(here(`../../${name}/scripts/${file}`));
  } catch (e) {
    if (e?.code === "ERR_MODULE_NOT_FOUND") throw Object.assign(new Error(`${name} must be installed beside this Skill: ${name}/scripts/${file} is not there`), { fatal: true });
    throw e;
  }
}

const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");
const short = (id) => id.slice(0, 8);
const text = (path) => readFileSync(path, "utf8");

/** The one subject kind of 0.0.1: its name, and which Skill decides what it is and what its identity is. */
const SUBJECTS = { Intent: { sibling: "kaal-intent", script: "intent.mjs" } };

export const REASONS = {
  grant: "no valid grant of authority from the Owner",
  seat: "a report is not the granted Reviewer's",
  evidence: "the record is not a loop of this process",
  contradiction: "the record says both converged and findings about one subject",
  unrevised: "review was asked again with the subject unchanged",
  oscillation: "an earlier subject has come back",
  ceiling: "the rounds the Owner granted are spent without agreement",
};

// ---------- the grant ----------

/** The grant, or why it is not one. */
export function readGrant(loop) {
  const path = join(loop, "grant.md");
  if (!existsSync(path) || !lstatSync(path).isFile()) return { ok: false, why: `${path} is missing` };
  const m = /^# Grant\n\nWorker: ([^\n]+)\nReviewer: ([^\n]+)\nRounds: (\d+)\nSubject: ([A-Za-z]+)\n\n## Words\n\n([\s\S]*\S[\s\S]*)$/.exec(text(path));
  if (!m) return { ok: false, why: "grant.md is not in the form: '# Grant', then Worker, Reviewer, Rounds, Subject lines, then '## Words' and the Owner's words" };
  const [, worker, reviewer, rounds, subject] = m;
  if (worker.trim() !== worker || reviewer.trim() !== reviewer) return { ok: false, why: "an actor has leading or trailing space" };
  if (worker === reviewer) return { ok: false, why: "the Worker and the Reviewer are one actor; the grant must name two" };
  if (Number(rounds) < 1) return { ok: false, why: "Rounds is at least 1" };
  if (!(subject in SUBJECTS)) return { ok: false, why: `Subject ${subject} is not one this process knows: ${Object.keys(SUBJECTS).join(", ")}` };
  return { ok: true, worker, reviewer, rounds: Number(rounds), subject };
}

// ---------- the log ----------

function listLog(loop) {
  const dir = join(loop, "log");
  const events = [];
  const problems = [];
  if (!existsSync(dir) || !lstatSync(dir).isDirectory()) return { events, problems: [`${dir} is not a directory`] };
  const names = readdirSync(dir).sort();
  names.forEach((name, i) => {
    const m = /^(\d\d)-(subject|round|how)\.md$/.exec(name);
    if (!m || Number(m[1]) !== i + 1) return void problems.push(`${name} is not the next event: the log is 01-…, 02-… without a gap and with nothing else`);
    if (!lstatSync(join(dir, name)).isFile()) return void problems.push(`${name} is not a file`);
    events.push({ n: m[1], kind: m[2], name, path: join(dir, name) });
  });
  return { events, problems };
}

/** A direction: the human's record answering a reason. */
export function parseDirection(content) {
  const m = /^# HOW\n\nReason: ([a-z]+)\nDirection: (continue|stop)\n(?:Rounds: (\d+)\n)?\n## Words\n\n([\s\S]*\S[\s\S]*)$/.exec(content);
  if (!m) return undefined;
  const [, reason, direction, rounds] = m;
  if (direction === "continue" && (rounds === undefined || Number(rounds) < 1)) return undefined;
  if (direction === "stop" && rounds !== undefined) return undefined;
  return { reason, direction, rounds: rounds === undefined ? undefined : Number(rounds) };
}

// ---------- state, derived ----------

/** Replay the record. Returns the state and every fact the brief shows. */
export async function derive(loop) {
  const review = await sibling("kaal-review", "review.mjs");
  const g = readGrant(loop);
  const out = { state: undefined, reason: undefined, detail: undefined, events: [], ignored: [], subject: undefined, used: 0, rounds: g.rounds, grant: g };
  const { events, problems } = listLog(loop);
  out.events = events;
  const fire = (reason, detail) => ((out.state = "HOW"), (out.reason = reason), (out.detail = detail));
  if (!g.ok) return fire("grant", g.why), out;
  if (problems.length) return fire("evidence", problems.join("; ")), out;
  const subject = await sibling(SUBJECTS[g.subject].sibling, SUBJECTS[g.subject].script);

  let latest; // { name, identity } of the latest applied subject
  let awaiting = false; // a subject is waiting for its report
  let last; // outcome of the latest applied round, if it is the latest applied event
  let agreed = false;
  let stopped = false;
  let window = { seen: [], findings: 0, budget: g.rounds };
  const results = new Map(); // identity -> outcomes recorded about it
  let pendingRound; // a round that fired a condition but is counted once a direction continues

  for (const [i, e] of events.entries()) {
    if (stopped) { out.ignored.push(`${e.name} (the loop was stopped)`); continue; }
    if (out.state === "HOW" && e.kind !== "how") { out.ignored.push(...events.slice(i).map((x) => `${x.name} (after HOW was required)`)); break; }
    if (e.kind === "how") {
      const d = parseDirection(text(e.path));
      if (out.state !== "HOW") { fire("evidence", `${e.name} is a direction with no HOW to answer`); continue; }
      if (!d || d.reason !== out.reason) { out.ignored.push(`${e.name} (not a direction answering '${out.reason}')`); continue; }
      e.answers = d.reason;
      e.direction = d.direction;
      if (d.direction === "stop") { out.state = "STOPPED"; out.reason = undefined; stopped = true; continue; }
      if (pendingRound) { // the round that reached the ceiling counts once it is answered
        if (pendingRound.outcome === "findings") { awaiting = false; last = "findings"; }
        pendingRound = undefined;
      }
      window = { seen: latest ? [latest.identity] : [], findings: 0, budget: d.rounds };
      out.state = undefined; out.reason = undefined; out.detail = undefined;
      continue;
    }
    if (e.kind === "subject") {
      if (awaiting || agreed) { fire("evidence", `${e.name} is out of turn: ${awaiting ? "the previous subject has no report yet" : "agreement was already reached"}`); continue; }
      const bytes = readFileSync(e.path);
      const why = subject.problem(bytes);
      if (why) { fire("evidence", `${e.name} is not an ${g.subject}: ${why}`); continue; }
      const identity = subject.identity(bytes);
      e.identity = identity;
      if (latest && identity === latest.identity) { fire("unrevised", `${e.name} has the identity of the previous subject, ${short(identity)}`); latest = { name: e.name, identity }; awaiting = true; continue; }
      if (window.seen.includes(identity)) { fire("oscillation", `${e.name} has the identity ${short(identity)} seen earlier in this window`); latest = { name: e.name, identity }; awaiting = true; continue; }
      window.seen.push(identity);
      latest = { name: e.name, identity };
      awaiting = true; last = undefined;
      continue;
    }
    // a round
    if (!awaiting) { fire("evidence", `${e.name} is out of turn: there is no subject waiting for a report`); continue; }
    const round = review.parse(text(e.path));
    if (!round || round.of !== g.subject) { fire("evidence", `${e.name} is not a Review round about ${g.subject}`); continue; }
    const now = sha256(readFileSync(join(loop, "log", latest.name)));
    if (round.identity !== now) { fire("evidence", `${e.name} names ${short(round.identity)}, not the subject as it is now (${short(now)})`); continue; }
    e.identity = round.identity; e.outcome = round.outcome;
    const actor = /^Actor: (.+)$/m.exec(round.reviewer.split("\n")[0] ?? "")?.[1];
    e.actor = actor;
    if (actor === undefined || actor !== g.reviewer || actor === g.worker) { fire("seat", `${e.name} is attributed to ${actor === undefined ? "no actor" : `'${actor}'`}, and the grant names '${g.reviewer}' as the Reviewer and '${g.worker}' as the Worker`); continue; }
    const before = results.get(round.identity) ?? new Set();
    results.set(round.identity, before.add(round.outcome));
    if ([...before].some((o) => o !== round.outcome)) { fire("contradiction", `${e.name} says ${round.outcome} about ${short(round.identity)}, which was also reported as ${[...before].find((o) => o !== round.outcome)}`); continue; }
    if (round.outcome === "findings") {
      window.findings += 1;
      if (window.findings >= window.budget) { fire("ceiling", `${window.findings} of the ${window.budget} rounds granted for this window have found something`); pendingRound = { outcome: "findings" }; continue; }
      awaiting = false; last = "findings";
    } else { awaiting = false; agreed = true; last = "converged"; }
  }

  out.used = window.findings; out.rounds = window.budget;
  out.subject = latest && { path: join(loop, "log", latest.name), identity: latest.identity };
  if (out.state === "HOW" || out.state === "STOPPED") return out;
  out.state = agreed ? "AGREED" : awaiting ? "REVIEW" : last === "findings" ? "REVISE" : "DESCRIBE";
  return out;
}

const NEXT = {
  DESCRIBE: "the Worker describes the Intent and submits it",
  REVIEW: "the Worker requests a targeted review of the subject, then records the Reviewer's report",
  REVISE: "the Worker revises the Intent in answer to the findings and submits it",
  AGREED: "none: the Reviewer the Owner named reported convergence on exactly this subject; the Worker stops revising, and establishing the Intent is the Owner's",
  STOPPED: "none: a human ended the loop; no agreement is claimed",
};

/** The brief `state` prints. */
export function brief(d, loop) {
  const lines = [d.state];
  if (d.state === "HOW") {
    lines.push("next: a human directs: the Worker does not continue, conclude or escalate on its own");
    lines.push(`reason: ${d.reason}: ${REASONS[d.reason]}`);
    lines.push(`detail: ${d.detail}`);
  } else lines.push(`next: ${NEXT[d.state]}`);
  if (d.subject) lines.push(`subject: ${d.subject.path} ${d.subject.identity}`);
  if (d.grant.ok) lines.push(`rounds: ${d.used} of ${d.rounds} used in this window; worker: ${d.grant.worker}; reviewer: ${d.grant.reviewer}`);
  for (const e of d.events) lines.push(`${e.n} ${e.kind}${e.outcome ? ` ${e.outcome}` : ""}${e.direction ? ` ${e.direction} (answers ${e.answers})` : ""}${e.actor ? ` by ${e.actor}` : ""}${e.identity ? ` ${short(e.identity)}` : ""}`);
  for (const x of d.ignored) lines.push(`ignored: ${x}`);
  if (d.state === "HOW") lines.push(`direct with: agree.mjs direct ${loop} --reason ${d.reason} --direction continue --rounds <n> --words <text|@file>  (or --direction stop)`);
  return lines;
}

const exitOf = (d) => (d.state === "HOW" ? 3 : 0);

// ---------- acts ----------

const refuse = (message) => { throw Object.assign(new Error(message), { refused: true }); };

function append(loop, kind, content) {
  const dir = join(loop, "log");
  const n = String(readdirSync(dir).length + 1).padStart(2, "0");
  const path = join(dir, `${n}-${kind}.md`);
  writeFileSync(path, content, { flag: "wx" });
  return path;
}

const given = (rest, flags, once = true) => {
  const out = {};
  for (let i = 0; i < rest.length; i += 2) {
    if (!flags.includes(rest[i]) || (once && rest[i] in out) || rest[i + 1] === undefined) throw Object.assign(new Error(`unexpected argument ${rest[i]}`), { usage: true });
    out[rest[i]] = rest[i + 1].startsWith("@") ? readFileSync(rest[i + 1].slice(1), "utf8") : rest[i + 1];
  }
  return out;
};
const oneLine = (label, v) => { if (typeof v !== "string" || v.trim() === "" || /[\r\n]/.test(v)) refuse(`${label} is one non-empty line`); return v.trim(); };
const clean = (v) => String(v).replace(/\r\n?/g, "\n").trim();

export async function begin(loop, a) {
  if (existsSync(join(loop, "grant.md"))) refuse(`${loop}/grant.md exists: a grant is not replaced`);
  const worker = oneLine("--worker", a["--worker"]);
  const reviewer = oneLine("--reviewer", a["--reviewer"]);
  if (!/^\d+$/.test(a["--rounds"] ?? "")) refuse("--rounds is a positive integer");
  const words = clean(a["--words"] ?? "");
  if (words === "") refuse("--words is the Owner's words and cannot be empty");
  if (worker === reviewer) refuse("the Worker and the Reviewer are one actor; the grant must name two");
  if (Number(a["--rounds"]) < 1) refuse("--rounds is at least 1");
  const content = `# Grant\n\nWorker: ${worker}\nReviewer: ${reviewer}\nRounds: ${Number(a["--rounds"])}\nSubject: Intent\n\n## Words\n\n${words}\n`;
  mkdirSync(join(loop, "log"), { recursive: true });
  writeFileSync(join(loop, "grant.md"), content, { flag: "wx" });
  return loop;
}

export async function submit(loop, file) {
  const d = await derive(loop);
  if (d.state !== "DESCRIBE" && d.state !== "REVISE") refuse(`the state is ${d.state}: ${d.state === "HOW" ? `HOW is required (${d.reason})` : NEXT[d.state] ?? ""}; nothing is submitted`);
  const subject = await sibling(SUBJECTS[d.grant.subject].sibling, SUBJECTS[d.grant.subject].script);
  const bytes = readFileSync(file);
  const why = subject.problem(bytes);
  if (why) refuse(`${file} is not an ${d.grant.subject}: ${why}`);
  return append(loop, "subject", bytes);
}

export async function relay(loop, a) {
  const review = await sibling("kaal-review", "review.mjs");
  const d = await derive(loop);
  if (d.state !== "REVIEW") refuse(`the state is ${d.state}: a report is recorded only while a subject waits for one`);
  const actor = oneLine("--actor", a["--actor"]);
  const source = oneLine("--source", a["--source"]);
  const seen = sha256(readFileSync(a["--saw"] ?? refuse("--saw is the subject as the Reviewer saw it")));
  const now = sha256(readFileSync(d.subject.path));
  if (seen !== now) refuse(`the report is of a different subject: what the Reviewer saw is ${short(seen)} and the subject now is ${short(now)}; request a review of the current subject`);
  const statement = `Actor: ${actor}\nRecorded by the Worker (${d.grant.worker}) from the report of ${actor}, the Reviewer named in the Owner's grant: the Worker copied the report and decided nothing in it. Source: ${source}`;
  const content = review.render({ of: d.grant.subject, identity: now, outcome: a["--result"], reviewer: statement, findings: a["--findings"] === undefined ? undefined : clean(a["--findings"]) });
  return append(loop, "round", content);
}

export async function direct(loop, a) {
  const d = await derive(loop);
  if (d.state !== "HOW") refuse(`the state is ${d.state}: there is no HOW to answer`);
  if (a["--reason"] !== d.reason) refuse(`the reason in force is '${d.reason}', not '${a["--reason"]}': a direction answers the reason that holds`);
  const direction = a["--direction"];
  if (direction !== "continue" && direction !== "stop") refuse("--direction is continue or stop");
  if (direction === "continue" && !/^[1-9]\d*$/.test(a["--rounds"] ?? "")) refuse("--direction continue grants a new budget: --rounds is a positive integer");
  if (direction === "stop" && a["--rounds"] !== undefined) refuse("--direction stop grants nothing: no --rounds");
  const words = clean(a["--words"] ?? "");
  if (words === "") refuse("--words is the human's words and cannot be empty");
  return append(loop, "how", `# HOW\n\nReason: ${d.reason}\nDirection: ${direction}\n${direction === "continue" ? `Rounds: ${a["--rounds"]}\n` : ""}\n## Words\n\n${words}\n`);
}

export async function request(loop, standard = "skills/kaal-intent/SKILL.md") {
  const d = await derive(loop);
  if (d.state !== "REVIEW") refuse(`the state is ${d.state}: a review is requested only while a subject waits for one`);
  if (!existsSync(standard)) refuse(`${standard} is not found: pass --standard <the SKILL.md of kaal-intent as installed>`);
  return [
    "@codex review",
    "",
    "Targeted review: is this Intent correctly described? Examine only the file named here, nothing else in this pull request.",
    `Subject: ${d.subject.path} (SHA-256 ${d.subject.identity}). Review it as it is at the commit that holds it.`,
    `Standard: the Way of Working of the Intent capability, ${standard} (SHA-256 ${sha256(readFileSync(standard))}).`,
    "Examine: whether it says what is wanted and why, with the outcomes and the boundaries, in the Owner's own terms; whether it stays out of Requirements, Architecture and implementation; whether it is short enough for the Owner to hold; and whether every boundary is the Owner's rather than a convenient guess.",
    'Report: one comment per finding, citing the line and saying what must be resolved. If there is nothing to resolve, comment "No findings" (do not only react).',
  ].join("\n");
}

// ---------- command line ----------

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const usage = "usage: agree begin|state|request|submit|relay|direct <loop> …  (see the Skill)";
  const [command, loop, ...rest] = process.argv.slice(2);
  try {
    if (!loop) throw Object.assign(new Error(usage), { usage: true });
    const show = async (path) => {
      const d = await derive(loop);
      console.log(path);
      for (const l of brief(d, loop)) console.log(l);
      process.exitCode = exitOf(d);
    };
    if (command === "state" && rest.length === 0) {
      const d = await derive(loop);
      for (const l of brief(d, loop)) console.log(l);
      process.exitCode = exitOf(d);
    } else if (command === "begin") {
      console.log(await begin(loop, given(rest, ["--worker", "--reviewer", "--rounds", "--words"])));
    } else if (command === "submit" && rest.length === 1) {
      await show(await submit(loop, rest[0]));
    } else if (command === "relay") {
      await show(await relay(loop, given(rest, ["--result", "--actor", "--saw", "--source", "--findings"])));
    } else if (command === "direct") {
      await show(await direct(loop, given(rest, ["--reason", "--direction", "--rounds", "--words"])));
    } else if (command === "request" && (rest.length === 0 || (rest.length === 2 && rest[0] === "--standard"))) {
      console.log(await request(loop, rest[1]));
    } else {
      throw Object.assign(new Error(usage), { usage: true });
    }
  } catch (e) {
    console.error(e.message);
    process.exitCode = e.usage ? 2 : 1;
  }
}
