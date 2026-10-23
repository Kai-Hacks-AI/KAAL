// Guard outer acceptance, Engineering part: KAAL as Guard's first consumer. Intent validation I5 [O4],
// Requirements verification N7 [O4] and Architecture conformance A11. Planned in PLAN; DO and CHECK do
// not change it.
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, "../../..");
const WORKFLOWS = join(REPO, ".github", "workflows");
const FIXTURE = JSON.parse(readFileSync(join(HERE, "fixtures", "check-identities.json"), "utf8"));

const read = (path) => readFileSync(join(REPO, path), "utf8");
const lines = (text) => text.split(/\r?\n/).map((l) => l.trim());

/** The text of one job in a workflow, from its key to the next job's key. */
function job(workflow, key) {
  const text = readFileSync(join(WORKFLOWS, workflow), "utf8");
  const start = text.search(new RegExp(`^  ${key}:\\s*$`, "m"));
  assert.ok(start >= 0, `${workflow} has no job ${key}`);
  const rest = text.slice(start + 1);
  const end = rest.search(/^  [A-Za-z0-9_-]+:\s*$/m);
  return end < 0 ? rest : rest.slice(0, end);
}

/** The KAAL jobs Guard runs, by workflow and job key, and the check each runs. */
const JOBS = [
  ["ci.yml", "hosting"],
  ["ci.yml", "acceptance"],
  ["ci.yml", "lane"],
  ["change-isolation.yml", "change-isolation"],
  ["promotion-source.yml", "promotion-source"],
  ["lineage-synchronization.yml", "lineage-synchronization"],
  ["branching-audit.yml", "audit"],
];

/** KAAL's guard.json. While there is none, the test is blocked here, before its assertions. */
function guard() {
  assert.ok(existsSync(join(REPO, "guard.json")), "blocked before behavioural assertion: KAAL lists no checks for Guard (guard.json)");
  return JSON.parse(read("guard.json"));
}

describe("N7 [O4] KAAL's check identities", () => {
  it("every check identity and OS matrix entry on main before migration is still present", () => {
    for (const [workflow, expected] of Object.entries(FIXTURE.workflows)) {
      const present = lines(readFileSync(join(WORKFLOWS, workflow), "utf8"));
      for (const l of expected) assert.ok(present.includes(l), `${workflow} lost: ${l}`);
    }
    const acceptance = lines(job("ci.yml", "acceptance"));
    for (const l of FIXTURE.matrices["ci.yml"].Acceptance) assert.ok(acceptance.includes(l), `Acceptance lost: ${l}`);
  });
});

describe("KAAL's own checks run through Guard", () => {
  it("A11 [N7]: KAAL lists its checks in guard.json, its branching checkers trusted and 4 declared as held", () => {
    const { checks } = guard();
    assert.ok(checks && Object.keys(checks).length > 0);
    const branching = Object.entries(checks).filter(([, c]) => /lineage\.ts/.test(c.command));
    assert.ok(branching.length > 0, "guard.json lists no branching check");
    for (const [name, c] of branching) {
      assert.match(c.trusted ?? "", /engineering\/github\/lineage\.ts$/, `${name} is not run from the target ref`);
      assert.equal(c.outcomes?.["4"], "held", `${name} does not declare 4 as held`);
    }
  });

  it("I5 [O4]: the pre-push hook runs the local checks through Guard", () => {
    assert.match(read(".githooks/pre-push"), /kaal-guard run --local/);
  });

  it("A11 [N7, G5]: every Guard-run job keeps its name and runs its check through Guard", () => {
    const { checks } = guard();
    for (const [workflow, key] of JOBS) {
      const text = job(workflow, key);
      const run = [...text.matchAll(/kaal-guard run --check ("[^"]+"|\S+)/g)].map((m) => m[1].replace(/"/g, ""));
      assert.ok(run.length > 0, `${workflow} ${key} does not run its check through Guard`);
      for (const name of run) if (!name.includes("${{")) assert.ok(checks[name], `${workflow} ${key} runs ${name}, which guard.json does not list`);
    }
  });

  it("A11 [G10]: the Guard job checks that the workflow files name a job for every ci check", () => {
    const all = Object.keys(guard().checks);
    assert.ok(all.length > 0);
    const workflows = ["ci.yml", "change-isolation.yml", "promotion-source.yml", "lineage-synchronization.yml", "branching-audit.yml"].map((w) => readFileSync(join(WORKFLOWS, w), "utf8")).join("\n");
    assert.match(workflows, /name: Guard\s*$[\s\S]*?kaal-guard verify/m);
  });
});
