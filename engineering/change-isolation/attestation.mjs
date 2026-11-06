// Who may attest a ledger entry that a promotion carries (engineering/change-isolation/ledger-in-promotion-plan.md).
//
// The checker (check.mjs) only compares an attested id and digest with its own canonical digest. This module
// is the trusted adapter's judgment of the facts that make an attestation: reviews read from the GitHub API,
// the pull request, the target-held CODEOWNERS and pinned attesters. It reads nothing itself; the caller
// (the trusted handler workflow, running the default branch's copy) supplies the facts, and any fact it
// cannot read makes the verdict "cannot judge", never a pass.
import { CannotJudge, NotCanonical, appendedEntry, canonicalEntry, entryDigest } from "./check.mjs";

export { CannotJudge, NotCanonical, appendedEntry, canonicalEntry, entryDigest };

const LINE = /^ledger-entry: ([a-z0-9][a-z0-9-]*) sha256:([0-9a-f]{64})$/;
const RULING = new Set(["APPROVED", "CHANGES_REQUESTED", "DISMISSED"]);

/**
 * The code owners the target's CODEOWNERS names, as pinned user ids. Only `* @user [@user...]` lines are
 * understood; any other entry, an empty file, or an owner without a pinned attester cannot be judged.
 */
function pinnedOwnerIds(codeowners, attesters) {
  if (typeof codeowners !== "string" || !Array.isArray(attesters)) throw new CannotJudge("CODEOWNERS or the pinned attesters cannot be read");
  const logins = new Set();
  for (const raw of codeowners.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const [pattern, ...owners] = line.split(/\s+/);
    if (pattern !== "*" || owners.length === 0 || owners.some((o) => !/^@[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?$/.test(o)))
      throw new CannotJudge(`CODEOWNERS entry is not a plain '* @user': ${line}`);
    for (const o of owners) logins.add(o.slice(1).toLowerCase());
  }
  if (logins.size === 0) throw new CannotJudge("CODEOWNERS names no code owner");
  const ids = new Set();
  for (const login of logins) {
    const pinned = attesters.find((a) => typeof a?.login === "string" && a.login.toLowerCase() === login);
    if (!pinned || !Number.isInteger(pinned.id)) throw new CannotJudge(`code owner ${login} has no pinned attester id`);
    ids.add(pinned.id);
  }
  return ids;
}

/**
 * @param {object} input
 * @param {object} input.entry          the carried ledger entry
 * @param {object[]|null} input.reviews reviews from the API: { id, state, commit_id, body, user: { id, login }, submitted_at }
 * @param {object} input.pr             { user: { id }, head: { sha } }, read now
 * @param {string} input.judgedSha      the candidate commit the checker judges
 * @param {string} input.headAtEnd      the pull request's head, read again at the end of the run
 * @param {object[]} input.attesters    target-held [{ login, id }]
 * @param {string} input.codeowners     target-held CODEOWNERS text
 * @returns {{ attested: {id: string, digest: string} | null, violations: string[] }}
 * @throws {CannotJudge}
 */
export function judgeAttestation({ entry, reviews, pr, judgedSha, headAtEnd, attesters, codeowners }) {
  if (!Array.isArray(reviews)) throw new CannotJudge("the reviews cannot be read");
  if (!pr?.head?.sha || !pr?.user || judgedSha !== pr.head.sha || headAtEnd !== judgedSha)
    throw new CannotJudge("the pull request's head is not the judged candidate, or moved during the run");
  const owners = pinnedOwnerIds(codeowners, attesters);
  const digest = entryDigest(entry);
  // GitHub's per-reviewer state: the latest approval, changes-requested or dismissal wins; comments do not move it.
  const latest = new Map();
  const ordered = reviews.filter((r) => RULING.has(r?.state) && r.user && Number.isInteger(r.user.id))
    .sort((a, b) => (a.submitted_at < b.submitted_at ? -1 : a.submitted_at > b.submitted_at ? 1 : a.id - b.id));
  for (const r of ordered) latest.set(r.user.id, r);
  for (const r of latest.values()) {
    if (r.state !== "APPROVED" || r.commit_id !== judgedSha) continue;
    if (!owners.has(r.user.id) || r.user.id === pr.user.id) continue;
    const lines = String(r.body ?? "").split(/\r?\n/).filter((l) => LINE.test(l));
    if (lines.length !== 1) continue;
    const [, id, claimed] = LINE.exec(lines[0]);
    if (id === entry.id && claimed === digest) return { attested: { id, digest }, violations: [] };
  }
  return { attested: null, violations: ["no author-independent code-owner approval at the judged head attests this entry"] };
}

/**
 * The pinned attesters from the target's `attesters.json`: [{ login, id }]. The numeric id is the authority;
 * the login is informational and must match CODEOWNERS. Anything unreadable cannot be judged.
 */
export function readAttesters(text) {
  let doc;
  try { doc = JSON.parse(text); } catch { throw new CannotJudge("attesters.json is not valid JSON"); }
  if (!doc || doc.version !== 1 || !Array.isArray(doc.attesters) ||
      doc.attesters.some((a) => !a || typeof a.login !== "string" || !Number.isInteger(a.id) || a.id <= 0))
    throw new CannotJudge("attesters.json must be { version: 1, attesters: [{ login, id }] }");
  return doc.attesters;
}
