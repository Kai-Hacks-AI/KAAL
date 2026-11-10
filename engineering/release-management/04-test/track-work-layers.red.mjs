// release-management/T67 to T77 (RED): track Work in three layers. The capability classifies Work from observable facts with a model it is
// handed and names no role and nothing of KAAL; the consumer binds it to a configuration that defines stages, stations, checks and views.
// Carried unwired by the PLAN (00-changes/track-work-layers-plan.md); the DO moves it next to the components, wires it into test:engineering
// and makes it GREEN. Run by hand from the repository root:
//
//   node --test engineering/release-management/04-test/track-work-layers.red.mjs
//
// The Cases fail today because the component answers by role with KAAL's names inside. Do not edit a Case to make it pass.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { render, rollUp, select, trackWork } from "../05-src/track-work/track-work.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const CAPABILITY = join(HERE, "../05-src/track-work");
const CONSUMER = join(HERE, "../05-src/track-work-kaal");
const HEAD = "a".repeat(40);
// A consumer that is not KAAL: its own default branch, integration prefix, station names and envelope check.
const MODEL = {
  defaultBranch: "trunk", integrationPrefix: "int/", checks: { envelope: "lint Pull Request" },
  order: ["branch", "change", "promotion", "release"],
  waits: [
    { name: "pull-request", any: ["noPullRequest"] },
    { name: "fix", any: ["ciRed", "ciPending", "behind", "unresolved", "envelopeFails"] },
    { name: "approval", any: ["notApprovedAtHead"] },
    { name: "fix", any: ["autoMergeOff"] },
    { name: "merge", any: [] },
  ],
  provisional: ["envelopeFails"],
  changeId: "\\b(T-\\d+)\\b", record: "^(rec/\\d{2}/\\d{2}/\\d{2}/\\d{2})/",
  positions: {
    branch: { stage: "Draft", station: null }, change: { stage: "Review", station: "R1" },
    promotion: { stage: "Ship", station: "S1" }, release: { stage: "Live", station: "L1" },
  },
};
const pr = (change = {}) => ({
  number: 7, title: "T-12 do the thing", head: "work/x", headSha: HEAD, base: "int/a", behind: false, ci: "SUCCESS", unresolved: 0, approvedAtHead: false, autoMerge: true, envelope: "pass", paths: ["docs/x.md", "rec/26/11/10/01/change.md"], ...change,
});
const facts = () => ({
  prs: [pr(), pr({ number: 8, ci: "FAILURE" }), pr({ number: 9, approvedAtHead: true }), pr({ number: 10, base: "trunk", head: "int/b" })],
  branches: [{ name: "work/lonely", headSha: HEAD, base: null }],
  collectors: [{ name: "int/c", headSha: HEAD, aheadOfMain: 2 }],
  main: { aheadOfLastTag: 3, headSha: HEAD, release: null },
  gaps: ["Live: the deployment request is not read"],
});
const all = () => trackWork(facts(), { model: MODEL });
const by = (r, key) => Object.fromEntries(r.work.map((w) => [w.ref, w[key]]));

describe("release-management/T67 the capability classifies by observable facts and names no owner", () => {
  it("approval, fix, merge and pull-request", () => {
    const w = by(all(), "waitingFor");
    assert.deepEqual([w["#7"], w["#8"], w["#9"], w["work/lonely"]], ["approval", "fix", "merge", "pull-request"]);
  });
  it("no piece carries an owner or a role", () => {
    for (const w of all().work) assert.ok(!("owner" in w) && !("role" in w), JSON.stringify(w));
  });
  it("a call without a model is refused: the capability has no defaults", () => {
    assert.throws(() => trackWork(facts()), /model/);
  });
});

describe("release-management/T68 where each Change is: position, stage, station and Change id come from the facts and the model, not from the code", () => {
  it("every piece carries position, stage, station, Change id, collector, full head and what it waits for", () => {
    const w = all().work.find((x) => x.ref === "#7");
    assert.deepEqual([w.position, w.stage, w.station, w.changeId, w.collector, w.headSha, w.waitingFor], ["change", "Review", "R1", "T-12", "int/a", HEAD, "approval"]);
  });
  it("a pull request carries the record folder its changed paths name, by the model's pattern, so a Change can be composed from facts", () => {
    const r = by(all(), "record");
    assert.deepEqual([r["#7"], r["work/lonely"]], ["rec/26/11/10/01", null]);
    assert.equal(by(trackWork({ ...facts(), prs: [pr({ paths: ["docs/x.md"] })] }, { model: MODEL }), "record")["#7"], null);
  });
  it("the consumer's stage names label the positions it was given", () => {
    const s = by(all(), "stage");
    assert.deepEqual([s["work/lonely"], s["#7"], s["#10"], s["int/c"], s["main"]], ["Draft", "Review", "Ship", "Ship", "Live"]);
    assert.equal(by(all(), "station")["work/lonely"], null);
  });
  it("the default branch and the integration prefix decide the position and the collector", () => {
    const c = by(all(), "collector");
    assert.deepEqual([c["#7"], c["#10"], c["int/c"], c["work/lonely"]], ["int/a", "int/b", "int/c", null]);
  });
  it("another model gives another answer from the same facts", () => {
    const other = trackWork(facts(), { model: { ...MODEL, defaultBranch: "int/a" } });
    assert.equal(by(other, "stage")["#7"], "Ship", "a pull request into the default branch is a promotion");
  });
  it("the envelope is read from the check the model names", () => {
    const named = trackWork({ ...facts(), prs: [pr({ envelope: "fail" })] }, { model: MODEL });
    assert.equal(named.work[0].waitingFor, "fix");
  });
});

describe("release-management/T69 select narrows by stage, station, collector and what it waits for", () => {
  it("any-of within a selector, all-of between selectors, none lists everything", () => {
    assert.ok(select(all(), { stage: ["Review"] }).work.every((w) => w.stage === "Review"));
    assert.deepEqual(select(all(), { station: ["S1"] }).work.map((w) => w.ref).sort(), ["#10", "int/c"].sort());
    assert.deepEqual(select(all(), { waitingFor: ["approval"] }).work.map((w) => w.ref), ["#7"]);
    assert.deepEqual(select(all(), { waitingFor: ["fix", "pull-request"] }).work.map((w) => w.ref).sort(), ["#8", "work/lonely"].sort());
    assert.deepEqual(select(all(), { stage: ["Review"], waitingFor: ["merge"], collector: ["int/a"] }).work.map((w) => w.ref), ["#9"]);
    assert.equal(select(all(), {}).work.length, all().work.length);
  });
  it("the unread facts stay on the result whatever is selected", () => {
    assert.equal(select(all(), { waitingFor: ["approval"] }).gaps.length, 1);
  });
  it("an unknown value is refused and the known ones are named, stations from the model", () => {
    assert.throws(() => select(all(), { stage: ["Operations"] }), /Draft.*Review.*Ship.*Live/s);
    assert.throws(() => select(all(), { station: ["Z9"] }), /R1.*S1.*L1/s);
    assert.throws(() => select(all(), { waitingFor: ["cpo"] }), /pull-request.*fix.*approval.*merge/s);
  });
});

describe("release-management/T70 the report needs no role and names none", () => {
  it("every line has the stage, station, Change id, collector, full head and what it waits for, then the unread facts", () => {
    const out = render(all());
    assert.match(out, /Review .*R1 .*#7 .*T-12 .*a{40}.*waiting for approval/);
    assert.match(out, /incomplete: Live/);
  });
  it("no role word appears in the output", () => {
    assert.ok(!/\b(CTO|CPO|role)\b/i.test(render(all())));
  });
});

describe("release-management/T71 the capability's source holds nothing of KAAL and no role", () => {
  const FILES = ["track-work.mjs", "gather.mjs", "run.mjs"].map((f) => join(CAPABILITY, f)).filter((f) => { try { readFileSync(f); return true; } catch { return false; } });
  it("has none of KAAL's names, forms or roles", () => {
    assert.ok(FILES.length >= 2);
    for (const f of FILES) {
      const text = readFileSync(f, "utf8").replace(/\/\/.*$/gm, "");
      for (const word of ["kaal/", "verify Envelope", "CTO", "CPO", "12-collectors", "11-main", "10-npmjs", "Promote", "SYNC", "Kai-Hacks-AI", "--role"]) {
        assert.ok(!text.includes(word), `${f} contains ${word}`);
      }
    }
  });
  it("imports only itself and Node built-ins, never the consumer", () => {
    for (const f of FILES) {
      const specs = [...readFileSync(f, "utf8").matchAll(/from\s+"([^"]+)"/g)].map((m) => m[1]);
      for (const s of specs) assert.ok(s.startsWith("node:") || s.startsWith("./"), `${f} imports ${s}`);
    }
  });
});

describe("release-management/T72 the consumer holds KAAL's configuration in one data file and expands views", () => {
  const config = () => JSON.parse(readFileSync(join(CONSUMER, "config.json"), "utf8"));
  it("the configuration defines the model and the views", () => {
    const c = config();
    assert.deepEqual(Object.keys(c).sort(), ["model", "views"]);
    assert.ok(c.model.defaultBranch && c.model.integrationPrefix && c.model.positions && c.model.changeId && c.model.checks?.envelope);
    assert.ok(Object.keys(c.views).length >= 1);
  });
  it("a view is a set of selectors over the capability's vocabulary", () => {
    for (const v of Object.values(config().views)) for (const k of Object.keys(v)) assert.ok(["stage", "station", "collector", "waitingFor"].includes(k), k);
  });
});

describe("release-management/T73 the consumer's entry takes --view or selectors and refuses --role", () => {
  const run = (...args) => spawnSync(process.execPath, [join(CONSUMER, "run.mjs"), ...args], { encoding: "utf8" });
  it("an unknown view is refused and the configured ones are named", () => {
    const r = run("--view", "nobody");
    assert.equal(r.status, 2);
    for (const name of Object.keys(JSON.parse(readFileSync(join(CONSUMER, "config.json"), "utf8")).views)) assert.match(r.stderr, new RegExp(name));
  });
  it("--role is refused and the usage names the selectors and --view", () => {
    const r = run("--role", "x");
    assert.equal(r.status, 2);
    assert.match(r.stderr, /--waiting-for/);
    assert.match(r.stderr, /--view/);
  });
});

describe("release-management/T74 a Change is where its least-advanced piece is, ranked by the model", () => {
  const composition = { "rec/26/11/10/01": { state: "Accepted", pieces: ["#7", "#10"] }, "rec/26/11/10/02": { state: "Proposed", pieces: ["#9", "#99"] } };
  const rolled = () => rollUp(all(), composition, { model: MODEL });
  it("the Change takes the position, stage, station and wait of its least-advanced piece, and carries its lifecycle state", () => {
    const c = rolled().changes["rec/26/11/10/01"];
    assert.deepEqual([c.position, c.stage, c.station, c.waitingFor, c.state], ["change", "Review", "R1", "approval", "Accepted"]);
  });
  it("a piece the facts do not contain is reported as unread, never ignored", () => {
    const r = rolled();
    assert.ok(r.gaps.some((g) => /#99/.test(g)));
    assert.equal(r.changes["rec/26/11/10/02"].position, "change");
  });
  it("it keeps no role and no ranking of its own: another model order gives another answer", () => {
    const reversed = { ...MODEL, order: ["release", "promotion", "change", "branch"] };
    assert.throws(() => rollUp(all(), composition, { model: { ...MODEL, order: undefined } }), /order/, "the order has no default");
    const c = rollUp(all(), composition, { model: reversed }).changes["rec/26/11/10/01"];
    assert.equal(c.position, "promotion");
  });
});

describe("release-management/T75 the classification is the model's policy over fixed conditions, tested as a derived judgment", () => {
  it("the same facts are classified differently by a model that groups the waits differently", () => {
    const other = {
      ...MODEL,
      waits: [
        { name: "pull-request", any: ["noPullRequest"] }, { name: "rebase", any: ["behind"] }, { name: "repair", any: ["ciRed", "ciPending", "unresolved", "envelopeFails"] },
        { name: "review", any: ["notApprovedAtHead"] }, { name: "repair", any: ["autoMergeOff"] }, { name: "queue", any: [] },
      ],
    };
    const w = (m, over) => trackWork({ ...facts(), prs: [pr(over)] }, { model: m }).work[0].waitingFor;
    assert.deepEqual([w(MODEL, { behind: true }), w(other, { behind: true })], ["fix", "rebase"]);
    assert.deepEqual([w(MODEL, {}), w(other, {})], ["approval", "review"]);
  });
  it("the first true wait in the model's order wins, so priority is the model's", () => {
    const w = trackWork({ ...facts(), prs: [pr({ ci: "FAILURE", approvedAtHead: false })] }, { model: MODEL }).work[0];
    assert.equal(w.waitingFor, "fix", "a red check outranks a missing approval");
  });
  it("a wait with no condition always applies and a model without one is refused", () => {
    assert.throws(() => trackWork(facts(), { model: { ...MODEL, waits: MODEL.waits.slice(0, 4) } }), /waits/);
  });
});

describe("release-management/T76 nothing is reported with confidence from missing facts", () => {
  const one = (over, model = MODEL) => trackWork({ ...facts(), prs: [pr(over)] }, { model }).work[0];
  it("a piece whose checks could not be read is unknown, naming what is missing, and the report says so", () => {
    const w = one({ ci: null });
    assert.equal(w.waitingFor, "unknown");
    assert.deepEqual(w.missing, ["ci"]);
    assert.match(render(trackWork({ ...facts(), prs: [pr({ ci: null })] }, { model: MODEL })), /incomplete: .*#7.*ci/);
  });
  it("a true higher-priority wait stands even when a lower one is unknown", () => {
    assert.equal(one({ behind: true, approvedAtHead: undefined }).waitingFor, "fix");
  });
  it("a provisional condition that is unknown does not make the piece unknown, and is shown as provisional", () => {
    const w = one({ envelope: "unknown" });
    assert.equal(w.waitingFor, "approval");
    assert.deepEqual(w.provisional, ["envelopeFails"]);
  });
  it("a condition that is not provisional makes the same piece unknown", () => {
    const strict = { ...MODEL, provisional: [] };
    const w = one({ envelope: "unknown" }, strict);
    assert.equal(w.waitingFor, "unknown");
    assert.deepEqual(w.missing, ["envelope"]);
  });
  it("each classification names the head it was read at and where the facts came from", () => {
    const w = one({});
    assert.equal(w.evidence.headSha, HEAD);
    assert.ok(w.evidence.sources.ci && w.evidence.sources.approval);
  });
});

describe("release-management/T77 a Change is unknown when a piece is, and the roll-up claims no universal order", () => {
  const composition = { "rec/26/11/10/01": { state: "Accepted", pieces: ["#7", "#8"] } };
  it("a piece that is unknown makes the Change unknown, naming it", () => {
    const f = { ...facts(), prs: [pr(), pr({ number: 8, ci: null })] };
    const c = rollUp(trackWork(f, { model: MODEL }), composition, { model: MODEL }).changes["rec/26/11/10/01"];
    assert.equal(c.waitingFor, "unknown");
    assert.deepEqual(c.unknownPieces, ["#8"]);
  });
  it("the Change takes the wait of the piece it took its position from, and a tie takes the first wait of the model", () => {
    const f = { ...facts(), prs: [pr(), pr({ number: 8, ci: "FAILURE" })] };
    const c = rollUp(trackWork(f, { model: MODEL }), composition, { model: MODEL }).changes["rec/26/11/10/01"];
    assert.deepEqual([c.position, c.waitingFor], ["change", "fix"]);
  });
});
