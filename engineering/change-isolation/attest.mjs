#!/usr/bin/env node
// The trusted adapter for an in-pull-request ledger entry (engineering/change-isolation/ledger-in-promotion-plan.md).
//
// Run by the review-event handler workflow from the default branch, never from the candidate. It reacquires
// every fact itself (the pull request, its head, the reviews, the target's CODEOWNERS, pinned attesters and
// ledger, and the candidate's ledger as Git data), asks attestation.mjs for the verdict, and prints
//   attested=<id>:<sha256>   when a valid author-independent code-owner approval at the judged head attests
//                            the one entry the candidate appends, and nothing otherwise;
//   head=<sha>               the head that was judged.
// Exit 0 with or without an attestation (the checker then judges the change on its own rules); exit 2 when a
// fact cannot be read (cannot judge). It writes to $GITHUB_OUTPUT when set, and to stdout.
import { spawnSync } from "node:child_process";
import { appendFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { CannotJudge, appendedEntry, judgeAttestation, readAttesters } from "./attestation.mjs";

const LEDGER = "engineering/change-isolation/transitions.json";
const ATTESTERS = "engineering/change-isolation/attesters.json";
const CODEOWNERS = ".github/CODEOWNERS";

/**
 * @param {object} io
 * @param {(path: string) => Promise<any>} io.api    GET a GitHub API path, returns parsed JSON
 * @param {(rev: string, path: string) => string|null} io.show   the file at a Git revision, or null when absent
 * @param {string} io.repo  owner/name
 * @param {number} io.pr
 * @returns {Promise<{ attested: string|null, head: string }>}
 */
export async function attest({ api, show, repo, pr: number }) {
  const first = await api(`/repos/${repo}/pulls/${number}`);
  const head = first?.head?.sha, baseRef = first?.base?.ref, author = first?.user;
  if (!/^[0-9a-f]{40}$/.test(head ?? "") || !baseRef || !author) throw new CannotJudge("the pull request cannot be read");
  const target = show(`origin/${baseRef}`, LEDGER);
  const candidate = show(head, LEDGER);
  if (target === null) throw new CannotJudge("the target holds no ledger");
  if (candidate === null || candidate === target) return { attested: null, head };
  const appended = appendedEntry(target, candidate);
  if (!appended.entry) return { attested: null, head };
  const reviews = [];
  for (let page = 1; ; page++) {
    const batch = await api(`/repos/${repo}/pulls/${number}/reviews?per_page=100&page=${page}`);
    if (!Array.isArray(batch)) throw new CannotJudge("the reviews cannot be read");
    reviews.push(...batch);
    if (batch.length < 100) break;
  }
  const attesters = show(`origin/${baseRef}`, ATTESTERS), codeowners = show(`origin/${baseRef}`, CODEOWNERS);
  if (attesters === null || codeowners === null) throw new CannotJudge("the target holds no pinned attesters or CODEOWNERS");
  // Read the head again at the end of the run: if it moved, this verdict is for a commit nobody is judging now.
  const again = await api(`/repos/${repo}/pulls/${number}`);
  const verdict = judgeAttestation({ entry: appended.entry, reviews, pr: first, judgedSha: head,
    headAtEnd: again?.head?.sha, attesters: readAttesters(attesters), codeowners });
  return { attested: verdict.attested ? `${verdict.attested.id}:${verdict.attested.digest}` : null, head };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const refuse = (m) => { console.error(m); process.exit(2); };
  const number = Number(process.argv[2] === "--pr" ? process.argv[3] : NaN);
  const repo = process.env.GITHUB_REPOSITORY, token = process.env.GH_TOKEN;
  if (!Number.isInteger(number) || number <= 0 || !repo || !token) refuse("usage: attest.mjs --pr <number> (GITHUB_REPOSITORY and GH_TOKEN set)");
  const api = async (path) => {
    const r = await fetch(`https://api.github.com${path}`, { headers: { authorization: `Bearer ${token}`, accept: "application/vnd.github+json" } });
    if (!r.ok) throw new CannotJudge(`GitHub API ${path}: ${r.status}`);
    return r.json();
  };
  const git = (...args) => spawnSync("git", args, { encoding: "utf8" });
  const show = (rev, path) => {
    const r = git("show", `${rev}:${path}`);
    if (r.status === 0) return r.stdout;
    const known = git("cat-file", "-e", `${rev}^{commit}`);
    if (known.status !== 0) throw new CannotJudge(`git cannot resolve ${rev}`);
    return null;
  };
  try {
    const head = (await api(`/repos/${repo}/pulls/${number}`))?.head?.sha;
    if (/^[0-9a-f]{40}$/.test(head ?? "")) git("fetch", "-q", "--no-tags", "origin", head);
    const result = await attest({ api, show, repo, pr: number });
    const lines = [...(result.attested ? [`attested=${result.attested}`] : []), `head=${result.head}`];
    console.log(lines.join("\n"));
    if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, lines.join("\n") + "\n");
  } catch (e) {
    if (e instanceof CannotJudge) refuse(`cannot judge: ${e.message}`);
    throw e;
  }
}
