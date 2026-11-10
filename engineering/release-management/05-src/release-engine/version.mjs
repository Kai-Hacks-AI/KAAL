// release-management/C3 DO (F3, version Package): the pure judgments of PLAN version-package-plan.md. Each is a function of data the caller
// gathers (registry versions, tags, Change Records), so it runs the same on a package-change pull request and in the release; the engine
// touches no host. Nothing here creates a tag, writes a record or publishes: the `.github` step that gathers and calls these is a later Change.
import semver from "semver";
import { Parser } from "commonmark";

/** T1. The highest published version, or null when there is none. Ordering is plain semver; the comparator is the `semver` package's. */
export function highestPublished(versions) {
  const valid = (versions ?? []).filter((v) => semver.valid(v));
  return valid.length === 0 ? null : valid.reduce((a, b) => (semver.gt(b, a) ? b : a));
}

/**
 * T1. Findings for a version against the published ones: refused unless greater than the highest published (a prerelease below a published
 * stable is refused like any lower version), and a prerelease is refused until the Owner decides the prerelease policy.
 */
export function versionFindings({ name, version, published }) {
  if (!semver.valid(version)) return [`the version ${JSON.stringify(version)} is not a semantic version`];
  const f = [];
  if (semver.prerelease(version)) f.push(`${name}@${version} is a prerelease; no prerelease policy is decided, raise it to a stable version`);
  const top = highestPublished(published);
  if (top !== null && !semver.gt(version, top)) f.push(`${name}@${version} is not greater than the highest published version ${top}; raise the version`);
  return f;
}

/**
 * T2, before the tag is created; writes nothing. `tags` maps a tag name to the commit it names, `published` maps a published version of
 * this package to the commit it was built from (null when unknown). Passes when no tag `<name>@<version>` exists, or when it exists at
 * this commit for a version not yet published (a retry of the same release). Fails when it names another commit, and when the version is
 * on the registry at another commit. Missing facts are no evidence: `tags` and `published` must each be an object the caller successfully
 * gathered (an empty one is a successful query that found nothing); an absent one is a non-passing verdict, never permission to create.
 * "Retry" claims commit equality only: the peeled commit of the existing tag. That the existing annotated tag object and annotation are
 * the expected ones is for the tag writer to check before it writes nothing on a retry; this function does not prove it.
 */
export function tagPreflight({ name, version, commit, tags, published }) {
  const tag = `${name}@${version}`;
  const f = unknown({ tags, published });
  if (f.length > 0) return { findings: f, create: false, retry: false };
  const at = tags?.[tag];
  if (at !== undefined && at !== commit) f.push(`the tag ${tag} names ${at}, not ${commit}`);
  if (published && Object.hasOwn(published, version)) {
    const built = published[version];
    if (built !== null && built !== commit) f.push(`${tag} is on the registry from ${built}, not ${commit}`);
  }
  return { findings: f, create: f.length === 0 && at === undefined, retry: f.length === 0 && at !== undefined };
}

/**
 * T2, after publication: the version is on the registry and the tag still names exactly the released commit. A package tag is never
 * moved or deleted by this judgment or by KAAL's own jobs; a failure here is an incident, not a repair.
 */
export function tagAfterRelease({ name, version, commit, tags, published }) {
  const tag = `${name}@${version}`;
  const f = unknown({ tags, published });
  if (f.length > 0) return { findings: f };
  if (!published || !Object.hasOwn(published, version)) f.push(`${tag} is not on the registry`);
  if (tags?.[tag] === undefined) f.push(`the tag ${tag} does not exist`);
  else if (tags[tag] !== commit) f.push(`the tag ${tag} names ${tags[tag]}, not the released commit ${commit}`);
  return { findings: f };
}

/**
 * T3, traceability, not authorization. If the version differs from the base commit's, one of the Change Records (Markdown texts the caller
 * read from the trusted baseline) must carry a `Version:` member naming `<name>@<version>`, read with the Markdown parser, never a pattern
 * over prose. An unchanged version needs no record. This proves the version is traceable to a recorded Change and nothing more.
 */
export function versionRecorded({ name, version, previous, records }) {
  if (version === previous) return { findings: [] };
  if (!Array.isArray(records)) return { findings: ["the Change Records were not read from the trusted baseline, so the version cannot be traced"] };
  const wanted = `${name}@${version}`;
  for (const text of records ?? []) {
    const walker = new Parser().parse(String(text)).walker();
    for (let e = walker.next(); e; e = walker.next()) {
      if (!e.entering || (e.node.type !== "paragraph" && e.node.type !== "item")) continue;
      const line = flat(e.node);
      const m = /^Version:\s*(.*)$/s.exec(line);
      if (m && m[1].split(/[\s,]+/).map((t) => t.replace(/^`|`$/g, "")).includes(wanted)) return { findings: [] };
    }
  }
  return { findings: [`${wanted} changed from ${previous} but no Change Record names it in a Version: member`] };
}

/** Findings for facts the caller did not gather: a collection that is absent is unknown, an empty one is a successful query. */
function unknown(facts) {
  return Object.entries(facts)
    .filter(([, v]) => v === null || typeof v !== "object" || Array.isArray(v))
    .map(([k]) => `${k} was not gathered, so the tag cannot be judged`);
}

/** The text of a node, as one line. */
function flat(node) {
  const parts = [];
  const w = node.walker();
  for (let e = w.next(); e; e = w.next()) {
    if (!e.entering) continue;
    if (e.node.type === "text" || e.node.type === "code") parts.push(e.node.literal);
    else if (e.node.type === "softbreak" || e.node.type === "linebreak") parts.push(" ");
  }
  return parts.join("").replace(/\s+/g, " ").trim();
}
