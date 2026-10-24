// kaal-guard outer acceptance, Intent validation: each test (T…) names the Intent outcomes (I…) it validates.
// Planned in PLAN; DO and CHECK do not change it.
import assert from "node:assert/strict";
import { readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { consumer, NAME, verdicts } from "./harness.mjs";

describe("Intent outcome validation", () => {
  it("guard/T1 [guard/I2, guard/I3]: one check gives the same verdict through the hook and through CI, for the same facts", () => {
    const c = consumer();
    assert.equal(c.guard(["init"]).status, 0);
    c.checks({ same: { command: "node checks/exit.mjs 1 broken", runs: ["local", "ci"] } });
    const base = c.commit("guard");
    c.write("change.txt", "x\n");
    const head = c.commit("change");

    const hook = c.git("push", "origin", "main");
    assert.notEqual(hook.status, 0, "the hook lets a failing check through");
    const local = verdicts(hook.output).same;

    c.write("changed.txt", "change.txt\0");
    const ci = verdicts(c.guard(["run", "--check", "same", "--github", "--head", head, "--base", base, "--base-ref", "main", "--changed", "changed.txt"]).output).same;
    assert.ok(local && ci, "the hook or CI printed no verdict for the check");
    assert.equal(local.verdict, "fail");
    assert.equal(ci.verdict, local.verdict);
  });

  it("guard/T2 [guard/I1]: removing Guard leaves the repository's own tests intact", () => {
    const c = consumer();
    const before = c.read("test/own.test.mjs");
    assert.equal(c.guard(["init"]).status, 0);
    c.commit("guard");
    assert.equal(c.guard(["remove"]).status, 0);
    assert.equal(c.read("test/own.test.mjs"), before);
    assert.ok(c.exists("checks/exit.mjs") && c.exists("checks/facts.mjs"));
  });

  it("guard/T4 [guard/I5]: the packed package alone installs, operates and removes cleanly, and no other KAAL element appears", () => {
    const c = consumer();
    const own = c.files();
    const foreign = () => {
      // Installed packages, scoped ones as @scope/name: any KAAL element but the package itself is foreign.
      const installed = readdirSync(join(c.dir, "node_modules")).flatMap((n) => (n.startsWith("@") ? readdirSync(join(c.dir, "node_modules", n)).map((m) => `${n}/${m}`) : [n]));
      const modules = installed.filter((n) => /^(@[^/]+\/)?kaal-/.test(n) && n !== NAME);
      // The .kaal namespace is not a KAAL element (guard/F1): Guard's own config and state directories in it are allowed.
      const paths = c.files().filter((p) => /^(\.kaal|engineering)\//.test(p) && !/^\.kaal\/(config|state)\/guard\//.test(p));
      return [...modules, ...paths];
    };

    assert.equal(c.guard(["init"]).status, 0);
    assert.deepEqual(foreign(), []);
    c.checks({ unit: { command: "node --test test/", runs: ["local", "ci"] } });
    c.commit("guard");

    c.write("more.txt", "x\n");
    own.push("more.txt"); // the consumer's own change, pushed through the hook
    c.commit("more");
    const push = c.git("push", "origin", "main");
    assert.equal(push.status, 0, push.output);
    assert.equal(verdicts(push.output).unit?.verdict, "pass", "the hook did not run the local check");
    assert.equal(c.guard(["run", "--ci"]).status, 0);
    assert.equal(c.guard(["upgrade"]).status, 0);
    assert.deepEqual(foreign(), []);

    assert.equal(c.guard(["remove"]).status, 0);
    assert.deepEqual(foreign(), []);
    const left = c.files().filter((p) => !own.includes(p));
    assert.deepEqual(left, [".kaal/config/guard/unit.md"], "remove left files other than the consumer's declaration");
    assert.equal(c.git("config", "--local", "--get", "core.hooksPath").stdout.trim(), "");
  });
});
