// PROVISIONAL. Which directory is a Change and which is a named tree, and the
// domain each is identified under, are decided here; how a directory tree is
// given an identity is Sealing's one definition (helpers/sealing.ts reaches it).
// Nothing here hashes.
//
// * A Change, changes/<name>/YY/MM/DD/CC/, is `KAAL Change v1`: the whole tree
//   under it, relative paths included, the Change's own name and address
//   excluded (unlike a Node, whose identity is its bytes alone). v1 is kept
//   exactly as sealed in genesis 01.
// * A named tree is `KAAL Tree v1`: the same, plus the tree's own root name. Its
//   parent and location are excluded, so A/work/ moved to B/work/ keeps its
//   identity and work/ renamed to evidence/ does not. The first consumer is a
//   Change's work/.
import { tree } from "./sealing.js";

/** A tree that cannot be given an identity. */
export const ChangeTreeError = tree.TreeError;

/** The Change ID of the tree at `dir`. */
export const changeId = (dir: string): string => tree.treeId(dir, { domain: "KAAL Change v1" });

/** The ID of the named tree at `dir`: its root name (the last segment of `dir`), relative paths and exact bytes; where `dir` lies is no part of it. */
export const namedTreeId = (dir: string): string => tree.treeId(dir, { domain: "KAAL Tree v1", named: true });
