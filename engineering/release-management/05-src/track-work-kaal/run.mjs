// track Work for KAAL: `node run.mjs [--view <name>] [--stage s] [--station s] [--collector c] [--waiting-for w] [--repo owner/name]`.
// Read-only. Binds the capability (../track-work/) to KAAL's configuration (config.json); a view is a named set of selectors, and a selector given
// on the command line replaces the same selector of the view. Several values are separated by commas.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { gather } from "../track-work/gather.mjs";
import { render, select, trackWork } from "../track-work/track-work.mjs";

const config = JSON.parse(readFileSync(join(dirname(fileURLToPath(import.meta.url)), "config.json"), "utf8"));
const FLAGS = { "--stage": "stage", "--station": "station", "--collector": "collector", "--waiting-for": "waitingFor" };
const usage = `usage: node run.mjs [--view ${Object.keys(config.views).join("|")}] [--stage s] [--station s] [--collector c] [--waiting-for w] [--repo owner/name]`;
const fail = (message) => { console.error(`${message}\n${usage}`); process.exit(2); };

const args = process.argv.slice(2);
const flags = {};
for (let i = 0; i < args.length; i += 2) {
  const known = args[i] === "--view" || args[i] === "--repo" || args[i] in FLAGS;
  if (!known || args[i + 1] === undefined) fail(`unknown or incomplete argument ${args[i]}`);
  flags[args[i]] = args[i + 1];
}
if ("--view" in flags && !(flags["--view"] in config.views)) fail(`unknown view ${flags["--view"]}; configured: ${Object.keys(config.views).join(", ")}`);
const selectors = { ...(config.views[flags["--view"]] ?? {}) };
for (const [flag, key] of Object.entries(FLAGS)) if (flag in flags) selectors[key] = flags[flag].split(",");
const repo = flags["--repo"] ?? "Kai-Hacks-AI/KAAL";

// GitHub's gateway answers 502 or 504 now and then: read again a few times, then say so plainly instead of a stack trace.
const pause = (ms) => new Promise((r) => setTimeout(r, ms));
const gh = async (a) => {
  for (let attempt = 1; ; attempt++) {
    try {
      return JSON.parse(execFileSync("gh", ["api", ...a], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024, stdio: ["ignore", "pipe", "pipe"] }));
    } catch (e) {
      if (attempt === 4) throw new Error(`gh api ${a[0]} failed ${attempt} times: ${String(e.stderr || e.message).split("\n")[0]}`);
      await pause(2000 * attempt);
    }
  }
};
let result;
try {
  result = trackWork(await gather(gh, repo, config.model), { model: config.model });
} catch (e) {
  console.error(`track Work could not read GitHub: ${e.message}`);
  process.exit(1);
}
try {
  console.log(render(select(result, selectors)));
} catch (e) {
  fail(e.message);
}
