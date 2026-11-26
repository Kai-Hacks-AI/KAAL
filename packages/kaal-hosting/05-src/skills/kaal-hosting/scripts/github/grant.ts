// A grant: the authority of one minted installation token (hosting/F99, hosting/A44). Hosting creates it and holds its
// token, abilities, identity, repository and transport privately, in a table the caller cannot reach. What the caller
// holds is a frozen handle, so a copy, a clone, a plain object or a bare token is not a grant and is refused.
import { AppAdapterError } from "./app-error.js";

export const DEFAULT_API = "https://api.github.com";

/** What the caller holds. It names the App and the repository and says when it ends; it carries no authority of its own. */
export interface Grant { readonly app: string; readonly repo: string; readonly expiresAt: string }

interface Held { token: string; abilities: readonly string[]; appId: string; login: string; repo: string; origin: string; fetch: typeof fetch; expiresAt: number }
const held = new WeakMap<object, Held>();

export const origin = (api: string | undefined): string => (api ?? DEFAULT_API).replace(/\/+$/, "");

export function issue(app: string, info: Held): Grant {
  const grant: Grant = Object.freeze({ app, repo: info.repo, expiresAt: new Date(info.expiresAt).toISOString().replace(/\.\d+Z$/, "Z") });
  held.set(grant, Object.freeze({ ...info, abilities: Object.freeze([...info.abilities]) }));
  return grant;
}

const untrusted = (): never => { throw new AppAdapterError("the grant was not minted by Hosting", "GRANT_UNTRUSTED"); };
const lookup = (grant: unknown): Held => (typeof grant === "object" && grant !== null ? held.get(grant) ?? untrusted() : untrusted());

/** The abilities a grant really holds. */
export function grantAbilities(grant: unknown): string[] { return [...lookup(grant).abilities]; }
/** The verified identity of the App behind a grant: its id and its bot login, as GitHub reported them. */
export function grantIdentity(grant: unknown): { appId: string; login: string } { const h = lookup(grant); return { appId: h.appId, login: h.login }; }

/**
 * Where a grant is used: the token it holds, after every check, each before any call. The grant must be Hosting's, not
 * expired by the clock it is given, for this repository, and for the origin and the `fetch` it was minted against, and
 * it must hold the ability the call needs. A token is sent only where it was minted.
 */
export function useGrant(grant: unknown, need: string, where: { repo: string; api?: string; fetch?: typeof fetch; now?: () => number }): string {
  const h = lookup(grant);
  if ((where.now ?? Date.now)() >= h.expiresAt) throw new AppAdapterError("the grant has expired", "GRANT_EXPIRED");
  if (h.repo !== where.repo) throw new AppAdapterError("the grant was minted for another repository", "GRANT_REPO_MISMATCH");
  if (h.origin !== origin(where.api) || h.fetch !== (where.fetch ?? globalThis.fetch)) throw new AppAdapterError("the grant was minted against another transport; its token is sent only where it was minted", "GRANT_TRANSPORT_MISMATCH");
  if (!h.abilities.includes(need)) throw new AppAdapterError(`the grant does not hold ${need}`, "ABILITY_REFUSED");
  return h.token;
}
