// An App is declared by the capability that owns it, in KAAL's words and none of GitHub's (hosting/F98). Hosting maps
// each ability to the GitHub permission and level, so the owner says what the App needs and never how GitHub says it.
import { AppAdapterError } from "./app-error.js";

export type Level = "read" | "write";
export type Ability = "read-contents" | "read-pull-requests" | "raise-pull-requests" | "approve-pull-requests" | "read-checks" | "post-checks";

/** The closed vocabulary. No ability writes contents, workflows, administration or secrets: the Apps never push. */
export const ABILITY_PERMISSION: Record<Ability, readonly [string, Level]> = {
  "read-contents": ["contents", "read"],
  "read-pull-requests": ["pull_requests", "read"],
  "raise-pull-requests": ["pull_requests", "write"],
  "approve-pull-requests": ["pull_requests", "write"],
  "read-checks": ["checks", "read"],
  "post-checks": ["checks", "write"],
};

export interface AppDeclaration { app: string; name: string; owner: string; purpose: string; appId: string; abilities: Ability[]; logo?: string }

const FIELDS = ["app", "name", "owner", "purpose", "appId", "abilities", "logo"];
const invalid = (why: string): never => { throw new AppAdapterError(`the App declaration is invalid: ${why}`, "INVALID_APP_DECLARATION"); };
const text = (value: unknown, field: string): string => (typeof value === "string" && value.trim() !== "" ? value : invalid(`${field} is missing or empty`));

export function validateAppDeclaration(value: unknown): AppDeclaration {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return invalid("it is not an object");
  const d = value as Record<string, unknown>;
  const extra = Object.keys(d).find((k) => !FIELDS.includes(k) && d[k] !== undefined);
  if (extra) return invalid(`${extra} is not a field of the format`);
  const app = text(d.app, "app");
  if (!/^[a-z][a-z0-9-]*$/.test(app)) return invalid("app is not lower-case words joined by hyphens");
  const name = text(d.name, "name");
  const owner = text(d.owner, "owner");
  const purpose = text(d.purpose, "purpose");
  const appId = text(d.appId, "appId");
  if (!/^[0-9]+$/.test(appId)) return invalid("appId is not the numeric id of the App");
  if (!Array.isArray(d.abilities) || d.abilities.length === 0) return invalid("abilities is missing or empty");
  const seen = new Set<string>();
  for (const a of d.abilities) {
    if (typeof a !== "string" || !Object.prototype.hasOwnProperty.call(ABILITY_PERMISSION, a)) return invalid(`${String(a)} is not an ability`);
    if (seen.has(a)) return invalid(`${a} is listed twice`);
    seen.add(a);
  }
  if (seen.has("raise-pull-requests") && seen.has("approve-pull-requests")) return invalid("an App never holds both raise-pull-requests and approve-pull-requests");
  if (!seen.has("read-contents")) return invalid("every App holds read-contents, since its declaration is read through it");
  let logo: string | undefined;
  if (d.logo !== undefined) {
    logo = text(d.logo, "logo");
    if (logo.startsWith("/") || logo.split("/").includes("..") || logo.includes("\\")) return invalid("logo is not a path inside the package");
  }
  return { app, name, owner, purpose, appId, abilities: d.abilities as Ability[], ...(logo === undefined ? {} : { logo }) };
}

/** The GitHub permissions of some abilities, the highest level of each, without `metadata` (GitHub always grants that). */
export function permissionsOf(abilities: readonly string[]): Record<string, Level> {
  const out: Record<string, Level> = {};
  for (const a of abilities) {
    const [permission, level] = ABILITY_PERMISSION[a as Ability];
    if (out[permission] !== "write") out[permission] = level;
  }
  return Object.fromEntries(Object.entries(out).sort(([x], [y]) => (x < y ? -1 : 1)));
}
