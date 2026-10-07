// PROVISIONAL. Which directory is a Change and which is a named tree, and the
// domain each is identified under, are Changing KAAL's decision, made once in its
// script (compass.ts reaches it); how a directory tree is given an identity is
// Sealing's one definition. Nothing here decides or hashes.
//
// * A Change, changes/<name>/YY/MM/DD/CC/, is `KAAL Change v1`.
// * A named tree is `KAAL Tree v1`; the first consumer is a Change's work/.
import { identity } from "./sealing.js";

export { changeId, namedTreeId } from "./compass.js";

/** A tree that cannot be given an identity. */
export const ChangeTreeError = identity.IdentityError;
