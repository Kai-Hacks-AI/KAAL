// release-management/T72, T73 and the KAAL Cases T38 to T42: the consumer holds KAAL's configuration in one data file and binds the capability to it.
// Wired into test:engineering by the DO of release-management/C15.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { render, select, trackWork } from "../track-work/track-work.mjs";

const CONSUMER = dirname(fileURLToPath(import.meta.url));

describe("release-management/T72 the consumer holds KAAL's configuration in one data file and expands views", () => {
  const config = () => JSON.parse(readFileSync(join(CONSUMER, "config.json"), "utf8"));
  it("the configuration defines the model and the views", () => {
    const c = config();
    assert.deepEqual(Object.keys(c).sort(), ["model", "views"]);
    assert.ok(c.model.defaultBranch && c.model.integrationPrefix && c.model.positions && c.model.changeId && c.model.checks?.envelope);
    assert.ok(Object.keys(c.views).length >= 1);
  });
  it("KAAL's views wait on what is waited for at every station: no station, stage or collector restriction", () => {
    const v = config().views;
    assert.deepEqual(v.cpo, { waitingFor: ["approval"] });
    assert.deepEqual(v.cto, { waitingFor: ["fix", "pull-request"] });
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


// KAAL's policy over the capability: the Cases of C7 (T38 to T42) keep their intent, said as what is waited for instead of as a state and an owner.
const HEAD = "a".repeat(40);
const MODEL = JSON.parse(readFileSync(join(CONSUMER, "config.json"), "utf8")).model;
const pr = (change = {}) => ({
  number: 7, title: "release-management/C7 DO: build track Work", head: "claude/x", headSha: HEAD, base: "kaal/engineering-release-management",
  behind: false, ci: "SUCCESS", unresolved: 0, approvedAtHead: false, autoMerge: true, envelope: "pass", paths: [], ...change,
});
const one = (change, facts = {}) => trackWork({ prs: [pr(change)], branches: [], collectors: [], main: {}, ...facts }, { model: MODEL }).work[0];

describe("release-management/T38 KAAL: the Work cannot be reviewed yet, so it waits for a fix", () => {
  for (const [name, change] of [["CI red", { ci: "FAILURE" }], ["CI pending", { ci: "PENDING" }], ["behind its base", { behind: true }], ["an unresolved conversation", { unresolved: 2 }], ["a failing Envelope verdict", { envelope: "fail" }]]) {
    it(name, () => assert.equal(one(change).waitingFor, "fix"));
  }
});

describe("release-management/T39 KAAL: the Envelope is the verdict of the Envelope control, and no verdict is provisional", () => {
  it("no verdict never puts the Work in a fix and never counts as a pass", () => {
    const w = one({ envelope: "unknown" });
    assert.equal(w.waitingFor, "approval");
    assert.deepEqual(w.provisional, ["envelopeFails"]);
    assert.match(render(trackWork({ prs: [pr({ envelope: "unknown" })] }, { model: MODEL })), /provisional: envelopeFails not read/);
  });
  it("the check read is the Envelope control's, named in the configuration", () => assert.equal(MODEL.checks.envelope, "verify Envelope"));
});

describe("release-management/T40 KAAL: reviewable with no approval at the head waits for approval, at the station of its base", () => {
  it("a pull request into a collector is Integration at 12-collectors, with its C id and the collector", () => {
    const w = one();
    assert.deepEqual([w.waitingFor, w.stage, w.station, w.changeId, w.collector], ["approval", "Integration", "12-collectors", "C7", "kaal/engineering-release-management"]);
  });
  it("a pull request into main is Promotion at 11-main", () => {
    const w = one({ base: "main", head: "kaal/x", title: "Promote kaal/x into main: y" });
    assert.deepEqual([w.stage, w.station, w.collector], ["Promotion", "11-main", "kaal/x"]);
  });
  it("the record folder is read from the changed paths", () => {
    assert.equal(one({ paths: ["docs/x.md", ".kaal/changes/change/26/11/10/01/README.md"] }).record, ".kaal/changes/change/26/11/10/01");
  });
});

describe("release-management/T41 KAAL: approved at the head waits for the merge, or for a fix when auto-merge is off; a push sends it back", () => {
  it("approved with auto-merge on", () => assert.equal(one({ approvedAtHead: true }).waitingFor, "merge"));
  it("approved with auto-merge off", () => assert.equal(one({ approvedAtHead: true, autoMerge: false }).waitingFor, "fix"));
  it("a new push: approval no longer matches, CI pending is a fix, then green waits for approval", () => {
    assert.equal(one({ approvedAtHead: false, ci: "PENDING" }).waitingFor, "fix");
    assert.equal(one({ approvedAtHead: false, ci: "SUCCESS" }).waitingFor, "approval");
  });
});

describe("release-management/T42 KAAL: Work not yet opened waits for a pull request", () => {
  const at = (facts) => trackWork({ prs: [], branches: [], collectors: [], main: {}, ...facts }, { model: MODEL }).work;
  it("a pushed branch with no pull request is Development", () => {
    const [w] = at({ branches: [{ name: "claude/x", headSha: HEAD, base: null }] });
    assert.deepEqual([w.waitingFor, w.stage, w.station, w.ref], ["pull-request", "Development", null, "claude/x"]);
  });
  it("a collector ahead of main with no promotion pull request, and none when one is open", () => {
    const collector = { name: "kaal/mnemonics", headSha: HEAD, aheadOfMain: 3 };
    assert.deepEqual(at({ collectors: [collector] }).map((w) => [w.station, w.waitingFor]), [["11-main", "pull-request"]]);
    const promo = pr({ base: "main", head: "kaal/mnemonics", title: "Promote kaal/mnemonics into main: y" });
    assert.ok(!at({ prs: [promo], collectors: [collector] }).some((w) => w.waitingFor === "pull-request"));
  });
  it("main ahead of the last tag with no Release is Publishing at 10-npmjs", () => {
    const [w] = at({ main: { aheadOfLastTag: 4, headSha: HEAD, release: null } });
    assert.deepEqual([w.station, w.stage, w.waitingFor], ["10-npmjs", "Publishing", "pull-request"]);
  });
});

describe("release-management/T72 KAAL's views select what each consumer works on, across every station", () => {
  const facts = { prs: [pr(), pr({ number: 8, ci: "FAILURE" })], branches: [{ name: "claude/x", headSha: HEAD, base: null }], collectors: [], main: {} };
  const views = JSON.parse(readFileSync(join(CONSUMER, "config.json"), "utf8")).views;
  it("the cpo view is the approvals, the cto view the fixes and the pull requests to open", () => {
    const r = trackWork(facts, { model: MODEL });
    assert.deepEqual(select(r, views.cpo).work.map((w) => w.ref), ["#7"]);
    assert.deepEqual(select(r, views.cto).work.map((w) => w.ref).sort(), ["#8", "claude/x"]);
  });
});
