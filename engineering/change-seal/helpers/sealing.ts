// PROVISIONAL. The Sealing capability's own scripts, reached by their file in
// the package and not through any public surface (a Skill's scripts are not an
// API): the one definition of a tree's identity and of a seal marker. Nothing in
// this directory computes either; it only says which tree is a Change or a
// named tree, and where each kind of seal is kept.
const SCRIPTS = new URL("../../../../packages/sealing/skills/sealing/scripts/", import.meta.url);

export interface TreeIdentity {
  treeId(dir: string, options: { domain: string; named?: boolean }): string;
  TreeError: new (message?: string) => Error;
}
export interface SealMarkers {
  seal(dir: string, id: string): void;
  sealed(dir: string): string[];
}

export const tree: TreeIdentity = await import(new URL("tree-id.mjs", SCRIPTS).href);
export const markers: SealMarkers = await import(new URL("seal.mjs", SCRIPTS).href);
