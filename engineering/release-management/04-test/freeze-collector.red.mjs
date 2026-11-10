// release-management/T31 to T37, T54, T55, T64 and T65 (failing Cases, carried unwired in the PLAN of C6, freeze Collector; freeze-collector-plan.md).
// Run by hand from the repository root; no suite or lane names this file until the DO makes it GREEN:
//
//   node --test engineering/release-management/04-test/freeze-collector.red.mjs
//
// The contract: while a promotion of kaal/<X> is open, kaal/<X> is frozen. A promotion of it is held while any open pull request (drafts included, the
// promotion itself excluded) has kaal/<X> as its base; any pull request that targets a frozen collector fails (GitHub cannot stop it being opened);
// a promotion of kaal/<X> into main is held while any open pull request (drafts included, the promotion itself excluded) has
// kaal/<X> as its base; the verdict names them; it offers exactly two recoveries (retarget to another collector that exists now, or withdraw the promotion, land the dependent pull request and open a fresh one);
// "deliver, then recreate the collector" is never offered. Do not edit a Case to make it pass.
import assert from "node:assert/strict";
import { dirname, join, resolve } from "node:path";
import { test } from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
// lazy, so each Case fails on its own while the module does not exist
const freezeCollector = async () => (await import(pathToFileURL(join(ROOT, "engineering", "release-management", "05-src", "promotion", "freeze-collector.mjs")).href)).freezeCollector;

const PROMOTED = "kaal/mnemonics";
const promotion = { number: 1362, base: "main", head: PROMOTED, draft: false };
const dependent = (number, over = {}) => ({ number, base: PROMOTED, head: `claude/dependent-${number}`, draft: false, ...over });
const facts = (over) => ({ baseRef: "main", headRef: PROMOTED, pull: 1362, openPulls: [promotion], collectors: ["kaal/hosting", "kaal/engineering-release-management", PROMOTED], ...over });
const lines = (v) => v.message.split("\n");
const recoveries = (v) => lines(v).filter((l) => l.startsWith("Recovery:"));

test("T31: a promotion is held while any open pull request, a draft included, targets its collector, and the verdict names each", async () => {
  const v = (await freezeCollector())(facts({ openPulls: [promotion, dependent(1291), dependent(1300, { draft: true }), dependent(1301, { base: "kaal/hosting" })] }));
  assert.equal(v.kind, "held", "held: it waits; it is neither a pass nor a lineage failure");
  assert.ok(v.message.includes("#1291") && v.message.includes("#1300"), "names each pull request that targets the collector");
  assert.ok(!v.message.includes("#1301") && !v.message.includes("#1362"), "not a pull request into another base, and not the promotion itself");
});

test("T32: with no pull request on the collector the promotion passes, and an empty successfully gathered list is not missing evidence", async () => {
  const v = (await freezeCollector())(facts({ openPulls: [promotion, dependent(1301, { base: "kaal/hosting" })] }));
  assert.equal(v.kind, "pass");
  assert.equal((await freezeCollector())(facts({ openPulls: [] })).kind, "pass");
});

test("T33: exactly two executable recoveries are offered: retarget to another existing collector, or withdraw the promotion and land the pull request", async () => {
  const v = (await freezeCollector())(facts({ openPulls: [promotion, dependent(1291)] }));
  const r = recoveries(v);
  assert.ok(r.length >= 1);
  for (const line of r) {
    const retarget = /^Recovery: gh pr edit (\d+) --base (kaal\/[A-Za-z0-9._-]+)( \(re-runs on: .+\))?$/.exec(line);
    const wait = /^Recovery: gh pr close 1362 \(re-runs on: closed\), then land #(\d+) in kaal\/mnemonics and open a fresh promotion$/.exec(line);
    assert.ok(retarget || wait, `a retarget or a withdrawal, nothing else (waiting for a landing that the freeze forbids is a deadlock): ${line}`);
    if (retarget) {
      assert.ok(facts().collectors.includes(retarget[2]), `${retarget[2]} is a collector that exists now`);
      assert.notEqual(retarget[2], PROMOTED, "not the collector being promoted");
    }
  }
  assert.ok(r.some((l) => /gh pr edit 1291 --base /.test(l)) && r.some((l) => /then land #1291 in kaal\/mnemonics/.test(l)), "both routes are offered for the pull request");
});

test("T34: deliver, then recreate is never offered: no recovery creates or pushes the collector, retargets to main, or retargets to the collector being promoted", async () => {
  const v = (await freezeCollector())(facts({ openPulls: [promotion, dependent(1291)], collectors: [PROMOTED] }));
  const text = recoveries(v).join("\n");
  assert.ok(!/--base main\b/.test(text), "no retarget to main");
  assert.ok(!/--base kaal\/mnemonics\b/.test(text), "no retarget to the collector being promoted");
  assert.ok(!/git (push|branch|checkout -b)|gh api|recreate|re-create|create the collector/i.test(text), "no recovery creates the collector");
  assert.ok(!/gh pr edit 1291 --base/.test(text), "with no other collector there is nothing to retarget to, so only the withdrawal is offered");
  assert.match(text, /^Recovery: gh pr close 1362 \(re-runs on: closed\), then land #1291 in kaal\/mnemonics and open a fresh promotion$/m);
});

test("T35: missing facts are no evidence: an open-pull-request list that was not gathered is not a pass", async () => {
  for (const bad of [undefined, null, "x"]) {
    const v = (await freezeCollector())(facts({ openPulls: bad }));
    assert.notEqual(v.kind, "pass");
    assert.match(v.message, /open pull requests were not gathered/);
  }
});

test("T36: it judges only a promotion of a collector into main and a pull request into a frozen collector", async () => {
  const f = await freezeCollector();
  assert.equal(f(facts({ baseRef: "kaal/hosting", headRef: "claude/y", pull: 1301, openPulls: [promotion, dependent(1291)] })).kind, "not-applicable", "a Change into a collector that is not frozen");
  assert.equal(f(facts({ headRef: "claude/x", openPulls: [dependent(1291, { base: "claude/x" })] })).kind, "not-applicable", "a head that is not a collector");
});

test("T37: a fast promotion points at the hotfix route as information, and no override is offered", async () => {
  const v = (await freezeCollector())(facts({ openPulls: [promotion, dependent(1291)] }));
  const fast = lines(v).filter((l) => l.startsWith("Fast path:"));
  assert.equal(fast.length, 1, "one Fast path line");
  assert.match(fast[0], /engineering\/github\/branching\.md#hotfix/, "cites the hotfix as branching.md defines it, by anchor, and does not define it or name its branch (a rename of the route does not touch this control)");
  assert.ok(!recoveries(v).some((l) => /hotfix/.test(l)), "the hotfix route is not a third recovery");
  assert.ok(!/bypass|override|skip|--admin|force/i.test(recoveries(v).join("\n") + fast[0].replace(/not a bypass/i, "")), "nothing offers to skip or override the control");
});

const into = (over) => facts({ baseRef: PROMOTED, headRef: "claude/new", pull: 1400, openPulls: [promotion, dependent(1400, { head: "claude/new" })], ...over });

test("T54: a pull request that targets a frozen collector fails, and its recovery is a retarget to another existing collector or the withdrawal of the promotion", async () => {
  const v = (await freezeCollector())(into());
  assert.equal(v.kind, "fail", "evidence: the pull request is judged, not merely warned about");
  assert.ok(v.message.includes("#1362"), "names the open promotion that freezes the collector");
  const r = recoveries(v);
  assert.ok(r.some((l) => /^Recovery: gh pr edit 1400 --base kaal\/(hosting|engineering-release-management)$/.test(l)), "retarget to another existing collector");
  assert.ok(r.some((l) => /^Recovery: gh pr close 1362 \(re-runs on: closed\), then land #1400 in kaal\/mnemonics and open a fresh promotion$/.test(l)), "or withdraw the promotion, land the pull request, and open a fresh promotion");
  assert.ok(!/--base main\b|--base kaal\/mnemonics\b|git (push|branch)|recreate/i.test(r.join("\n")), "never main, never the frozen collector, never recreate");
});

test("T55: a collector with no open promotion is not frozen, and a closed promotion does not freeze", async () => {
  const f = await freezeCollector();
  assert.equal(f(into({ openPulls: [dependent(1400, { head: "claude/new" })] })).kind, "not-applicable", "no promotion is open for it");
  assert.equal(f(into({ openPulls: [{ ...promotion, state: "closed" }, dependent(1400, { head: "claude/new" })] })).kind, "not-applicable", "a promotion that is closed does not freeze");
  assert.notEqual(f(into({ openPulls: undefined })).kind, "pass", "missing facts are no evidence");
});

test("T64: a promotion is passed only from a fresh inventory taken in the merge-group run, never from an earlier check's", async () => {
  const f = await freezeCollector();
  const base = facts({ openPulls: [promotion] });
  assert.equal(f({ ...base, stage: "merge-group", inventory: { event: "merge_group", fresh: true } }).kind, "pass");
  for (const inventory of [undefined, { event: "pull_request", fresh: true }, { event: "merge_group", fresh: false }, { event: "merge_group" }]) {
    const v = f({ ...base, stage: "merge-group", inventory });
    assert.notEqual(v.kind, "pass", JSON.stringify(inventory));
    assert.match(v.message, /fresh inventory/);
  }
  assert.equal(f({ ...base, stage: "check" }).kind, "pass", "the earlier check may pass; it is the merge group that decides");
});

test("T65: the recoveries are ranked: retarget first, withdraw second, each followed by a Why line with when it applies and its argument", async () => {
  const f = await freezeCollector();
  const v = f(facts({ openPulls: [promotion, dependent(1291)] }));
  const ls = lines(v);
  const at = (re) => ls.findIndex((l) => re.test(l));
  const retarget = at(/^Recovery: gh pr edit 1291 --base /);
  const withdraw = at(/^Recovery: gh pr close 1362 /);
  assert.ok(retarget >= 0 && withdraw > retarget, "retarget is listed before withdraw");
  assert.match(ls[retarget + 1], /^Why first: .*(applies when|when) .+/, "first choice: when it applies, and the argument");
  assert.match(ls[withdraw + 1], /^Why second: .*(applies when|when) .+/, "second choice: when it applies, and the argument");
  assert.ok(ls[retarget + 1].length <= 240 && ls[withdraw + 1].length <= 240, "a Why line is one readable sentence");
  const only = f(facts({ openPulls: [promotion, dependent(1291)], collectors: [PROMOTED] }));
  const ol = lines(only);
  assert.match(ol[ol.findIndex((l) => /^Recovery: gh pr close 1362 /.test(l)) + 1], /^Why only: /, "with one possible route it is the only one, not the second");
  assert.ok(!ol.some((l) => /^Why first:/.test(l)), "no first choice is claimed when retarget is impossible");
  assert.ok(!ls.some((l) => /^Why (first|second|only):/.test(l) && /hotfix/i.test(l)), "the hotfix is not ranked among the recoveries");
});
