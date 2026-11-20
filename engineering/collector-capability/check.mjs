#!/usr/bin/env node
// engineering/C15: report which collectors are legitimate, from the default branch's tip.
// Usage: check.mjs [--base <ref>] [--json] [<branch> ...]   (default base: origin/main; default
// branches: every remote kaal/* branch). REPORT-ONLY: the exit status is 0 unless the tree of the
// base cannot be listed. Nothing is written, and no ruleset, workflow or hook uses this yet.
import { execute, readRevision } from "@kaihacksai/kaal-hosting";
import { collectorCapability, report } from "./collector-capability.mjs";
import { readEvidence } from "./evidence.mjs";

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const base = args.includes("--base") ? args[args.indexOf("--base") + 1] : "origin/main";
const named = args.filter((a, i) => !a.startsWith("--") && args[i - 1] !== "--base");

const git = async (...a) => execute("git", a, { cwd: process.cwd() });
let files;
try {
  // One Hosting call reads every committed file of the base; Nodes are UTF-8 Markdown, so only .md is kept.
  const revision = await readRevision(process.cwd(), base);
  files = Object.entries(revision).filter(([path]) => path.endsWith(".md")).map(([path, bytes]) => ({ path, bytes: Buffer.from(bytes) }));
} catch (error) {
  const unreadableEntry = error?.code === "REVISION_ENTRY";
  console.error(`collector-capability: cannot ${unreadableEntry ? "read" : "list"} ${base} (${error.message})`);
  process.exit(1);
}
const evidence = readEvidence(files);

let refs = named;
if (refs.length === 0) {
  const remote = await git("for-each-ref", "--format=%(refname:short)", "refs/remotes/origin/kaal/");
  refs = remote.stdout.split("\n").filter(Boolean).map((r) => r.replace(/^origin\//, ""));
}
const result = report(refs, evidence);
if (flag("--json")) console.log(JSON.stringify({ base, ...result }, null, 2));
else {
  console.log(`base ${base}: ${evidence.registrations?.claims.length ?? "unreadable"} registered scope(s), ${evidence.capabilities?.size ?? "unreadable"} admitted Capability Node(s)`);
  for (const r of result.results) console.log(`${r.verdict} ${r.ref}: ${r.reason}`);
  console.log(`${result.findings.length} migration finding(s); report-only, exit status 0`);
}
process.exit(result.exitStatus);
