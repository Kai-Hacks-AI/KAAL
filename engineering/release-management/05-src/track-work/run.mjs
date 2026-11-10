// track Work: `node run.mjs --role cto|cpo [--repo owner/name]`. Read-only; prints what the role can work on next.
import { execFileSync } from "node:child_process";
import { gather } from "./gather.mjs";
import { render, trackWork } from "./track-work.mjs";

const args = process.argv.slice(2);
const opt = (flag) => args[args.indexOf(flag) + 1];
const role = args.includes("--role") ? opt("--role") : undefined;
const repo = args.includes("--repo") ? opt("--repo") : "Kai-Hacks-AI/KAAL";
if (role !== "cto" && role !== "cpo") {
  console.error("usage: node run.mjs --role cto|cpo [--repo owner/name]");
  process.exit(2);
}
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
try {
  console.log(render(trackWork(await gather(gh, repo), { role }), { role }));
} catch (e) {
  console.error(`track Work could not read GitHub: ${e.message}`);
  process.exit(1);
}
