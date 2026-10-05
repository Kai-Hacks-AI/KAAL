// PROVISIONAL. The Sealing capability's own scripts, reached by their file in
// the package and not through any public surface (a Skill's scripts are not an
// API): the one definition of an artifact's identity and of a seal marker. Nothing in
// this directory computes either; it only says which tree is a Change or a
// named tree, and where each kind of seal is kept.
const SCRIPTS = new URL("../../../../packages/sealing/skills/sealing/scripts/", import.meta.url);

export interface ArtifactIdentity {
  artifactId(path: string, options?: { domain?: string; named?: boolean }): string;
  IdentityError: new (message?: string) => Error;
}
export interface SealMarkers {
  seal(dir: string, id: string): void;
  sealed(dir: string): string[];
}

export const identity: ArtifactIdentity = await import(new URL("artifact-id.mjs", SCRIPTS).href);
export const markers: SealMarkers = await import(new URL("seal.mjs", SCRIPTS).href);
