import { digest, type Files } from "./index.js";

/** Why `describeRun` or `contentIdentity` refused. */
export type RunFactsCode = "UNSUPPORTED_EVENT" | "NOT_A_REVISION" | "INVALID_SOURCE";

export class RunFactsError extends Error {
  constructor(message: string, readonly code: RunFactsCode) {
    super(message);
    this.name = "RunFactsError";
  }
}

/** The identity of a set of files, by their bytes and their paths: nothing of Git, no mode, no time. */
export interface ContentIdentity {
  readonly algorithm: "sha256";
  readonly digest: string;
  readonly files: number;
}

/** What a run says about itself: the name of the event, its payload, and the revision of the trigger (`GITHUB_SHA`). */
export interface RunSource {
  eventName: string;
  event: object;
  trigger?: string;
}

/** What a reader found, given as it is: the content of the working copy, the content of the commit the event names when that commit was readable, and the Git provenance of the working copy. */
export interface ObservedRun {
  content?: ContentIdentity | null;
  headContent?: ContentIdentity | null;
  git?: { commit: string; parents: readonly string[] } | null;
}

/**
 * The facts of a run, side by side. `content` is what the working copy holds and `headContent` what the commit the event names
 * holds: content, identified by bytes and paths. `provenance` is where the run says it comes from (the event, the trigger,
 * the Git commit of the working copy) and how those relate; a relation between commits is provenance and is never the
 * identity of content. `null` is "not given": nothing is said.
 */
export interface RunFacts {
  readonly event: string;
  readonly content: ContentIdentity | null;
  readonly headContent: ContentIdentity | null;
  readonly provenance: {
    readonly eventHead: { readonly revision: string; readonly source: "pull_request.head.sha" | "push.after" | "merge_group.head_sha" };
    readonly trigger: string | null;
    readonly git: { readonly commit: string; readonly parents: readonly string[] } | null;
    readonly relations: {
      readonly triggerIsEventHead: boolean | null;
      readonly gitCommitIsEventHead: boolean | null;
      readonly gitCommitIsTrigger: boolean | null;
      readonly eventHeadIsGitParent: boolean | null;
    };
  };
  readonly relations: { readonly contentIsHeadContent: boolean | null };
}

const REVISION = /^(?:[0-9a-f]{40}|[0-9a-f]{64})$/;
const isObject = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);

function revisionOf(value: unknown, what: string): string {
  const text = typeof value === "string" ? value.toLowerCase() : "";
  if (!REVISION.test(text) || /^0+$/.test(text)) throw new RunFactsError(`${what} is not a full commit id`, "NOT_A_REVISION");
  return text;
}

function only(value: Record<string, unknown>, allowed: string[], what: string): void {
  for (const key of Object.keys(value)) if (!allowed.includes(key)) throw new RunFactsError(`${what} takes no \`${key}\``, "INVALID_SOURCE");
}

/**
 * The identity of a set of files: SHA-256 over one line per file, in the order of the paths as strings, each line the JSON
 * array `[path, sha256 of the bytes]` and a line feed. The bytes and the paths are the identity; the order they were given
 * in, the modes, the times and any Git object are not. An empty set has an identity.
 */
export function contentIdentity(files: Files): ContentIdentity {
  if (!isObject(files)) throw new RunFactsError("files are an object of paths to bytes", "INVALID_SOURCE");
  const paths = Object.keys(files).sort();
  const lines = paths.map((path) => {
    const bytes = files[path] as unknown;
    if (!(bytes instanceof Uint8Array)) throw new RunFactsError(`${JSON.stringify(path)} is not bytes`, "INVALID_SOURCE");
    return `${JSON.stringify([path, digest(bytes)])}\n`;
  });
  return Object.freeze({ algorithm: "sha256" as const, digest: digest(Buffer.from(lines.join(""), "utf8")), files: paths.length });
}

function identityOf(value: unknown, what: string): ContentIdentity | null {
  if (value === undefined || value === null) return null;
  if (!isObject(value)) throw new RunFactsError(`${what} is a content identity`, "INVALID_SOURCE");
  only(value, ["algorithm", "digest", "files"], what);
  if (value.algorithm !== "sha256" || typeof value.digest !== "string" || !/^[0-9a-f]{64}$/.test(value.digest) || !Number.isInteger(value.files) || (value.files as number) < 0) {
    throw new RunFactsError(`${what} is a content identity`, "INVALID_SOURCE");
  }
  return Object.freeze({ algorithm: "sha256" as const, digest: value.digest, files: value.files as number });
}

/**
 * The facts of a run, stated and not judged: the head the event names (read from the event and from nowhere else), the
 * trigger, what a reader found (content, the content of the event's head commit, the Git commit and parents), and how they
 * relate. Pure: it reads no environment, no file and no Git. A relation that is false is stated, not refused. No fact says
 * what was examined, and no relation is called enough: the consumer determines what content it examined, and Testing checks
 * evidence against it. It refuses only what it cannot read: an event it does not know, an id that is not a revision, a source
 * or an observation of the wrong form.
 */
export function describeRun(source: RunSource, observed: ObservedRun = {}): RunFacts {
  if (!isObject(source)) throw new RunFactsError("the source of a run is an object", "INVALID_SOURCE");
  only(source, ["eventName", "event", "trigger"], "the source of a run");
  if (!isObject(source.event)) throw new RunFactsError("the event of a run is an object", "INVALID_SOURCE");
  if (!isObject(observed)) throw new RunFactsError("what was observed is an object", "INVALID_SOURCE");
  only(observed, ["content", "headContent", "git"], "what was observed");
  const event = source.event as Record<string, any>;
  const name = source.eventName;
  let head: string;
  let from: RunFacts["provenance"]["eventHead"]["source"];
  if (name === "pull_request" || name === "pull_request_target") {
    head = revisionOf(event.pull_request?.head?.sha, "the head of the pull request");
    from = "pull_request.head.sha";
  } else if (name === "push") {
    head = revisionOf(event.after, "the new commit of the push");
    from = "push.after";
  } else if (name === "merge_group") {
    head = revisionOf(event.merge_group?.head_sha, "the head of the merge group");
    from = "merge_group.head_sha";
  } else {
    throw new RunFactsError(`${JSON.stringify(name)} is not an event whose head is known`, "UNSUPPORTED_EVENT");
  }
  const trigger = source.trigger === undefined ? null : revisionOf(source.trigger, "the trigger revision");
  const content = identityOf(observed.content, "the content");
  const headContent = identityOf(observed.headContent, "the content of the head");
  let git: RunFacts["provenance"]["git"] = null;
  if (observed.git !== undefined && observed.git !== null) {
    const held = observed.git;
    if (!isObject(held) || !Array.isArray(held.parents)) throw new RunFactsError("the Git provenance of a checkout is `{ commit, parents }`", "INVALID_SOURCE");
    only(held, ["commit", "parents"], "the Git provenance of a checkout");
    git = Object.freeze({ commit: revisionOf(held.commit, "the commit of the checkout"), parents: Object.freeze(held.parents.map((p) => revisionOf(p, "a parent of the checkout"))) });
  }
  return Object.freeze({
    event: name,
    content,
    headContent,
    provenance: Object.freeze({
      eventHead: Object.freeze({ revision: head, source: from }),
      trigger,
      git,
      relations: Object.freeze({
        triggerIsEventHead: trigger === null ? null : trigger === head,
        gitCommitIsEventHead: git === null ? null : git.commit === head,
        gitCommitIsTrigger: git === null || trigger === null ? null : git.commit === trigger,
        eventHeadIsGitParent: git === null ? null : git.parents.includes(head),
      }),
    }),
    relations: Object.freeze({ contentIsHeadContent: content === null || headContent === null ? null : content.digest === headContent.digest }),
  });
}
