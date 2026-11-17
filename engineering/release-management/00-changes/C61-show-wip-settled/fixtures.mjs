// Fixtures of release/C61, on top of the fixtures of release/C39. Not a Case.
export { branches, config, entryOf, load, piece, placeOf, scriptPath, readerPath } from '../C39-show-wip-branches/fixtures.mjs';
// a branch with the facts the host answered
export const facts = (name, over = {}) => ({ name, ...over });
// the newest closed or merged piece of a branch
export const merged = (head) => ({ outcome: 'delivered', head });
// a piece that closed unmerged: the transport's outcome, no decision about the work
export const closed = (head) => ({ outcome: 'closed', head });
// an explicit, separate decision to discard the work
export const discarded = (head) => ({ outcome: 'discarded', head });
