// kaal-testing/reentry: a test run never re-enters itself (testing/C55, testing/F102–testing/F104, testing/N22).
// The run carries one marker in its environment, whose value is the level of the deepest entry that has entered.
// An entry enters only below its own level, so the normal handoff from the run entry to the verification is allowed
// and any return to the same or an outer entry is refused. Pure: it reads only the environment it is given.

export const MARKER = "KAAL_TESTING_RUN";

/** `guard(env, level)`: `{ entered, env, findings }`; see testing/F102. A marker that does not read as a level is never entered. */
export function guard(env, level) {
  const own = env !== null && typeof env === "object" && !Array.isArray(env) ? env : {};
  if (!Number.isInteger(level) || level < 1) return { entered: false, env: own, findings: ["the entry's level is not a positive integer"] };
  if (!Object.hasOwn(own, MARKER) || own[MARKER] === undefined) return { entered: true, env: { ...own, [MARKER]: String(level) }, findings: [] };
  const value = own[MARKER];
  if (typeof value !== "string" || !/^(0|[1-9][0-9]*)$/.test(value)) return { entered: false, env: own, findings: [`${MARKER} does not read as a level, so the run was possibly re-entered`] };
  if (Number(value) >= level) return { entered: false, env: own, findings: [`the run was re-entered: ${MARKER} is already ${value}, at or above this entry's level ${level}`] };
  return { entered: true, env: { ...own, [MARKER]: String(level) }, findings: [] };
}
