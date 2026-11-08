// Permanent regression guard for the Defect in plan/defects/c8-transitive-audit.md
// (answered by making c8 an optional peer): the tree a consumer gets by
// installing kaal-testing has no moderate-or-worse npm advisory, and c8 is not
// installed with it. It packs kaal-hosting and kaal-testing, installs them into
// an empty project and audits that project, so it needs the npm registry. It
// runs as the `test:defects` suite, after `test:publisher`, never inside it:
// packing Hosting rebuilds its `dist`, which would break files running beside it.
//
// An unreachable registry is not a finding. It is reported as UNKNOWN (nothing
// was proven either way) and never as an advisory; only audited vulnerabilities
// are findings. It still fails the suite: an unproven guard is not a pass.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

const root = fileURLToPath(new URL("../../../../", import.meta.url));
const win = process.platform === "win32";
const run = (args, cwd) => execFileSync("npm", args, { cwd, encoding: "utf8", shell: win, stdio: ["ignore", "pipe", "pipe"] });

const NETWORK = /\b(ENOTFOUND|EAI_AGAIN|ECONNRESET|ECONNREFUSED|ETIMEDOUT|ENETUNREACH|EHOSTUNREACH|ESOCKETTIMEDOUT|E50[0-4]|ERR_SOCKET_TIMEOUT)\b|fetch failed|network (?:error|request)|registry\.npmjs\.org.*(?:failed|unreachable)/i;

/** What an npm failure means: `unavailable` when the registry could not be reached, otherwise `failed`. */
export const classify = (text) => (NETWORK.test(String(text)) ? "unavailable" : "failed");

const unknown = (what, text) => new Error(`UNKNOWN: ${what}; the npm registry could not be reached, so nothing was proven either way. This is not an advisory and not a Defect. ${String(text).split("\n")[0]}`);

/** Runs an npm command whose non-zero exit may still carry JSON output (`audit`, `ls`); an unreachable registry throws UNKNOWN. */
const json = (args, cwd, what) => {
  let out;
  try {
    out = run(args, cwd);
  } catch (e) {
    out = e.stdout || "";
    if (!out.trim() || classify(`${out}\n${e.stderr}`) === "unavailable") {
      if (classify(`${out}\n${e.stderr}`) === "unavailable") throw unknown(what, e.stderr || out);
      throw e;
    }
  }
  const parsed = JSON.parse(out);
  if (parsed.error && classify(JSON.stringify(parsed.error)) === "unavailable") throw unknown(what, parsed.error.summary ?? parsed.error.code);
  return parsed;
};

describe("registry failures are unknown, never a finding", () => {
  it("classifies an unreachable registry apart from anything else", () => {
    for (const t of ["npm error code ENOTFOUND", "npm error code EAI_AGAIN", "npm error network request failed", "request to https://registry.npmjs.org/x failed, reason: ECONNRESET", "fetch failed"]) {
      assert.equal(classify(t), "unavailable", t);
    }
    for (const t of ["npm error code E404 Not Found", "npm error code ELSPROBLEMS", "npm error 5 moderate severity vulnerabilities", ""]) {
      assert.equal(classify(t), "failed", t);
    }
  });
});

describe("the installed kaal-testing tree", () => {
  it("has no c8 and no moderate-or-worse npm audit finding", { timeout: 300000 }, () => {
    const dir = mkdtempSync(join(tmpdir(), "kaal-testing-audit-"));
    try {
      const packed = [["@kaihacksai/kaal-hosting@0.0.1"], ["-w", "kaal-testing"]].map((which) => {
        const [{ filename }] = JSON.parse(run(["pack", ...which, "--json", "--pack-destination", dir], root));
        return join(dir, filename);
      });
      writeFileSync(join(dir, "package.json"), '{"name":"consumer","version":"1.0.0","private":true,"type":"module"}');
      try {
        run(["install", "--no-audit", "--no-fund", ...packed], dir);
      } catch (e) {
        if (classify(`${e.stderr}\n${e.stdout}`) === "unavailable") throw unknown("the tarballs could not be installed", e.stderr);
        throw e;
      }
      const listed = json(["ls", "c8", "--json"], dir, "the installed tree could not be listed");
      assert.equal(listed.dependencies?.["kaal-testing"]?.dependencies?.c8, undefined, "c8 is not installed with kaal-testing");
      const { vulnerabilities } = json(["audit", "--json"], dir, "the installed tree could not be audited");
      assert.ok(vulnerabilities, "npm audit returned no vulnerability report");
      const found = Object.entries(vulnerabilities).filter(([, v]) => ["moderate", "high", "critical"].includes(v.severity)).map(([n, v]) => `${n}:${v.severity}`);
      assert.deepEqual(found, []);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
