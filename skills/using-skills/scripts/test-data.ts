// Loads named test data from ../test-data so test cases hold no data themselves.
import path from "node:path";
import { fileURLToPath } from "node:url";

const DATA = fileURLToPath(new URL("../test-data/", import.meta.url));

/** The directory holding every example skill. */
export const SKILLS = path.join(DATA, "skills");

/** An example skill from test-data/skills. */
export function skill(name: string): string {
  return path.join(SKILLS, name);
}
