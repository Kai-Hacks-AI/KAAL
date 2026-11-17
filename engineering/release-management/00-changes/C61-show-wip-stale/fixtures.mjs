// Fixtures of release/C61, on top of the fixtures of release/C39. Not a Case.
export { branches, config, entryOf, load, piece, placeOf, scriptPath, readerPath } from '../C39-show-wip-branches/fixtures.mjs';
// a branch with the facts of its state
export const facts = (name, over = {}) => ({ name, ...over });
