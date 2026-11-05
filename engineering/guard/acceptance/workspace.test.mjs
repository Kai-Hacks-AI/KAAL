// Guard outer acceptance, Engineering part: the Test Case that needs KAAL's installed and built
// workspace (guard/C46). guard/T46 checks guard/A13 and guard/A16 with kaal-engineer-skill. guard/T83,
// External's, is in external-workspace.test.mjs (guard/C129). The Guard lane runs
// this file only where npm ci has installed the workspace, never counting it as passed elsewhere
// (guard/C47). Planned in PLAN; DO and CHECK do not change it.
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";
import { describe, it } from "node:test";
import { CHECK_SKILL, deliver, REPO, run, SKILL, target } from "./delivery.mjs";

describe("guard/F25 and guard/A16 [guard/I6, guard/I7] the Skill, judged with KAAL's workspace", () => {
  it("guard/T46 [guard/F19, guard/A13, guard/A16]: kaal-engineer-skill finds no standard or KAAL violation in the Embed Skill or the External variant", () => {
    // The checker judges its own Skill first: where it cannot (no installed and built workspace), the test is
    // blocked, never passed. The Guard lane runs this file only where the workspace is installed (guard/C47).
    const self = run(REPO, process.execPath, [CHECK_SKILL, dirname(dirname(CHECK_SKILL))]);
    assert.equal(self.status, 0, `blocked before behavioural assertion: kaal-engineer-skill cannot judge a Skill here (npm ci and the workspace build): ${self.output}`);
    const embed = join(REPO, "packages", "kaal-guard", "skills", "kaal-guard");
    assert.ok(existsSync(join(embed, "SKILL.md")), "blocked before behavioural assertion: kaal-guard has no skills/kaal-guard/SKILL.md");
    const e = run(REPO, process.execPath, [CHECK_SKILL, embed]);
    assert.equal(e.status, 0, `the Embed Skill: ${e.output}`);
    const t = target();
    const d = deliver(t);
    assert.equal(d.status, 0, d.output);
    t.git("checkout", "-q", "guard");
    assert.ok(existsSync(join(t.dir, SKILL, "SKILL.md")), `blocked before behavioural assertion: the delivery writes no Skill at ${SKILL}/`);
    const x = run(REPO, process.execPath, [CHECK_SKILL, join(t.dir, SKILL)]);
    assert.equal(x.status, 0, `the External variant: ${x.output}`);
  });

});

// guard/T138 (guard/C137): Guard's two ownership claims, in the format #609 settled, for change isolation's
// P3. It reads kaal-graph and kaal-testing, so it sits with the cases that need KAAL's workspace.
describe("guard/C137 [guard/A20] Guard's ownership claims", () => {
  it("guard/T138 [guard/A20, guard/N6]: Guard's two ownership claims each read through Testing's reader, name capability Guard by the exact id of engineering/guard/Guard.md, and claim exactly their own tree; the packed package carries no claim", async () => {
    const { identify } = await import("kaal-graph");
    const { CLAIM_FILE, readClaim } = await import("kaal-testing/attribution");
    // Node identity is the SHA-256 of the committed bytes, which are LF; a Windows checkout may hold CRLF.
    const committed = (path) => Buffer.from(readFileSync(join(REPO, path), "utf8").replace(/\r\n/g, "\n"));
    const node = identify(committed("engineering/guard/Guard.md"));
    assert.equal(node.type.name, "KAAL Capability", "Guard.md is not Guard's Capability Node");
    for (const tree of ["packages/kaal-guard/", "engineering/guard/"]) {
      const path = `${tree}${CLAIM_FILE}`;
      assert.ok(existsSync(join(REPO, path)), `blocked before behavioural assertion: there is no claim at ${path}`);
      const { claim, finding } = readClaim(path, committed(path));
      assert.equal(finding, undefined, `${path} does not read: ${JSON.stringify(finding)}`);
      assert.deepEqual(claim.owner, { kind: "capability", name: node.name, id: node.id }, `${path} does not name Guard's Capability Node exactly`);
      assert.deepEqual(claim.paths, [tree], `${path} claims more or less than its own tree`);
    }
    const { spawnSync } = await import("node:child_process");
    const packed = spawnSync("npm pack --dry-run --json --ignore-scripts", { cwd: join(REPO, "packages", "kaal-guard"), shell: true, encoding: "utf8" });
    assert.equal(packed.status, 0, `npm pack --dry-run failed: ${packed.stderr}`);
    const listed = JSON.parse(packed.stdout)[0].files.map((f) => f.path);
    assert.ok(!listed.includes(CLAIM_FILE), "the packed package carries Guard's ownership claim, a KAAL element");
  });
});

// guard/T129 (guard/C130): the conformance check guard/F1 promises. Guard's validator never accepts what Core's
// refuses. Core's validator is `kaal-core/frontmatter`, which needs KAAL's workspace, so this case is the
// publisher's and never runs in the installed package (guard/A8).
describe("guard/C130 [guard/F1] Guard/Check against Core's validator", () => {
  it("guard/T129 [guard/F1, guard/F2, guard/A8]: over a corpus of declarations, Guard's validator accepts none that Core's validator, given Guard/Check stated in core/F1 kinds, refuses; each declaration only Guard refuses is listed as semantic", async () => {
    const core = await import("kaal-core/frontmatter");
    const { FACTS, check, frontmatter } = await import(pathToFileURL(join(REPO, "packages", "kaal-guard", "lib", "config.mjs")).href);
    // Guard/Check in core/F1 kinds: `command` a parameter, `held` a list of numbers (guard/C130).
    const types = {
      "Guard/Check": {
        keys: {
          command: { value: "parameter", pattern: "^[^\\r\\n]*\\S[^\\r\\n]*$", required: true },
          runs: { value: "enum", values: ["hook", "ci"], list: true, required: true },
          facts: { value: "enum", values: Object.keys(FACTS), list: true },
          trusted: { value: "path" },
          held: { value: "number", list: true },
        },
      },
    };
    const head = 'type: Guard/Check\ncommand: "node x.mjs"\nruns: [hook]\n';
    const doc = (extra, text = head) => `---\n${text}${extra}---\n\nBody.\n`;
    const corpus = [
      ["a minimal check", doc("")],
      ["held", doc("held: [4]\n")],
      ["held with two statuses", doc("held: [4, 7]\n")],
      ["facts and trusted", doc(`facts: [${Object.keys(FACTS)[0]}]\ntrusted: checks/x.mjs\n`)],
      ["outcomes, the 0.0.4 map", doc('outcomes: {"4": held}\n')],
      ["a member nothing defines", doc("owner: me\n")],
      ["a prose member", doc("description: what it does\n")],
      ["runs naming local", doc("", head.replace("[hook]", "[local]"))],
      ["runs empty", doc("", head.replace("[hook]", "[]"))],
      ["command a list", doc("", head.replace('"node x.mjs"', "[node, x]"))],
      ["command blank", doc("", head.replace('"node x.mjs"', '"  "'))],
      ["held a string", doc('held: "4"\n')],
      ["held a map", doc('held: {"4": held}\n')],
      ["held holding a string", doc('held: ["4"]\n')],
      ["trusted a number", doc("trusted: 4\n")],
      ["no frontmatter", "Body only.\n"],
    ];
    // Where Guard alone refuses, the reason is Guard's own semantic rule (core/F8): the listed set must match exactly.
    const semantic = new Set(["runs naming local", "runs empty", "command blank"]);
    const guardRefuses = (text) => {
      try {
        const members = frontmatter(text, "x.md");
        check(members, "x.md");
        return false;
      } catch (e) {
        if (e?.name === "Refusal" || e?.constructor?.name === "Refusal") return true;
        throw e;
      }
    };
    const onlyGuard = [];
    for (const [name, text] of corpus) {
      const coreVerdict = core.validate(Buffer.from(text), types).verdict;
      const refused = guardRefuses(text);
      if (coreVerdict !== "valid") assert.ok(refused, `${name}: Guard accepts what Core refuses (${coreVerdict})`);
      if (refused && coreVerdict === "valid") onlyGuard.push(name);
    }
    for (const name of onlyGuard) assert.ok(semantic.has(name), `${name}: only Guard refuses it, and it is not listed as a semantic rule`);
    assert.ok(onlyGuard.length > 0, "the corpus has no declaration only Guard refuses, so it shows no semantic layer");
    // The valid core declarations Guard accepts, to show the layers agree on them.
    for (const name of ["a minimal check", "held", "held with two statuses", "facts and trusted"]) {
      assert.ok(!guardRefuses(corpus.find(([n]) => n === name)[1]), `${name}: Guard refuses what Core accepts`);
    }
  });
});
