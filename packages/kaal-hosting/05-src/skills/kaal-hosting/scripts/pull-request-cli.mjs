#!/usr/bin/env node
// kaal-hosting-pull-request --repo <owner/name> --type <TYPE> --head <branch> --base <branch> --title <text> --chapters <file.json>
//   Raises a pull request through Hosting's `raisePullRequest`. The chapters are a JSON file of chapter name to text; the token is
//   GITHUB_TOKEN. It takes no merge, draft or policy option: the type's owners declare those, and Hosting reads them at the base
//   revision. KAAL_GITHUB_API names another API address (a stand-in, for tests). Prints the pull request's address and exits 0;
//   exits 2 on a refusal or bad arguments (nothing was written) and 1 when a step failed after the pull request existed.
import { readFileSync } from "node:fs";
import { PullRequestError, raisePullRequest } from "./index.js";

const OPTIONS = ["repo", "type", "head", "base", "title", "chapters"];
const fail = (status, message) => { console.error(message); process.exit(status); };

const args = process.argv.slice(2);
const given = {};
for (let i = 0; i < args.length; i += 2) {
  const name = args[i]?.startsWith("--") ? args[i].slice(2) : undefined;
  if (!name || !OPTIONS.includes(name)) fail(2, `kaal-hosting-pull-request: ${args[i]} is not an option (${OPTIONS.map((o) => `--${o}`).join(", ")})`);
  if (args[i + 1] === undefined || Object.hasOwn(given, name)) fail(2, `kaal-hosting-pull-request: --${name} needs one value`);
  given[name] = args[i + 1];
}
for (const name of OPTIONS) if (given[name] === undefined) fail(2, `kaal-hosting-pull-request: --${name} is missing`);

let chapters;
try { chapters = JSON.parse(readFileSync(given.chapters, "utf8")); } catch { fail(2, "kaal-hosting-pull-request: --chapters is not a readable JSON file"); }

try {
  const raised = await raisePullRequest(
    { repo: given.repo, type: given.type, chapters, head: given.head, base: given.base, title: given.title },
    { token: process.env.GITHUB_TOKEN ?? "", ...(process.env.KAAL_GITHUB_API ? { api: process.env.KAAL_GITHUB_API } : {}) },
  );
  console.log(raised.url);
} catch (e) {
  if (!(e instanceof PullRequestError)) throw e;
  if (e.code === "RAISE_REFUSED") fail(2, `kaal-hosting-pull-request: refused (${e.rule}${e.owner ? `, ${e.owner}` : ""}): ${e.message}`);
  fail(1, `kaal-hosting-pull-request: ${e.message} (done: ${(e.steps ?? []).join(", ") || "nothing"}; failed: ${e.failed}${e.url ? `; the pull request is ${e.url}` : ""})`);
}
