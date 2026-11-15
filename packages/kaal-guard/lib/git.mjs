// The Git prerequisite (N1): kaal-guard needs Git 2.26 or later, for git config --show-scope. Imported
// by the command right after the Node prerequisite, so on an older Git every command is cannot judge
// before anything is read, run or written.
import { spawnSync } from "node:child_process";

const NEEDED = [2, 26];

const r = spawnSync("git", ["--version"], { encoding: "utf8" });
const m = /\bgit version (\d+)\.(\d+)/.exec(r.stdout ?? "");
const version = m ? [Number(m[1]), Number(m[2])] : undefined;
if (!version || version[0] < NEEDED[0] || (version[0] === NEEDED[0] && version[1] < NEEDED[1])) {
  const found = m ? `this is Git ${m[1]}.${m[2]}` : "git --version names no Git";
  console.log(`cannot judge: kaal-guard: ${found}, and kaal-guard needs Git ${NEEDED.join(".")} or later`);
  console.log(`  do: put Git ${NEEDED.join(".")} or later on PATH, then run kaal-guard again`);
  process.exit(2);
}
