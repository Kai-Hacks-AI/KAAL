// What the packages of this repository deliver, as the files of an installed
// KAAL and of the host's Agent Skills. Nothing here is authored: Core's
// payload() is deployed, each capability's contribution is registered through
// Core's registerSkill() into a throwaway KAAL directory, and the capability's
// Agent Skills are carried as found. The installed files are a projection of
// this; they are never its source.
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

/** The repository these helpers belong to: the source of every package. */
export const SOURCE = fileURLToPath(new URL("../../../../", import.meta.url));
/** `.kaal` is only the default name of the KAAL directory. */
export const KAAL_DIR = ".kaal";
/** The host's Agent Skills directory. */
export const HOST_SKILLS = "skills";
/** Genuine installed state: never derived from a package, never touched by installing. */
export const CHANGES = "changes";

type Files = Record<string, string>;
type Core = { payload(): Files; registerSkill(kaal: string, capability: string, contribution: Files): string[] };
type Capability = { payload(): { kaal: Files; skills: Files } };

export interface Delivery {
  /** Files of the KAAL directory, by path within it. */
  kaal: Files;
  /** Files of the host's skills directory, by path within it. */
  skills: Files;
  /** The capabilities, each registered through Core. */
  capabilities: string[];
}

/** Files under a directory, keyed by path relative to it. */
export function read(dir: string): Files {
  const files: Files = {};
  for (const path of readdirSync(dir, { recursive: true, encoding: "utf8" })) {
    if (statSync(join(dir, path)).isFile()) files[path.split("\\").join("/")] = readFileSync(join(dir, path), "utf8");
  }
  return files;
}

const load = async <T>(pkg: string): Promise<T> => import(pathToFileURL(join(SOURCE, "packages", pkg, "dist", "index.js")).href);

/** Every package under packages/ other than kaal-core is a capability, in name order. */
export function capabilityPackages(): string[] {
  return readdirSync(join(SOURCE, "packages")).filter((d) => d !== "kaal-core" && statSync(join(SOURCE, "packages", d)).isDirectory()).sort();
}

export async function delivery(): Promise<Delivery> {
  const core = await load<Core>("kaal-core");
  const scratch = mkdtempSync(join(tmpdir(), "kaal-delivery-"));
  try {
    const dir = join(scratch, KAAL_DIR);
    for (const [path, content] of Object.entries(core.payload())) {
      mkdirSync(dirname(join(dir, path)), { recursive: true });
      writeFileSync(join(dir, path), content);
    }
    const skills: Files = {};
    const capabilities: string[] = [];
    for (const pkg of capabilityPackages()) {
      const capability = await load<Capability>(pkg);
      if (typeof capability.payload !== "function") throw new Error(`packages/${pkg} is not a KAAL capability: it has no payload()`);
      const { kaal, skills: realization } = capability.payload();
      const names = new Set(Object.keys(realization).map((p) => p.split("/")[0]));
      if (names.size !== 1 || !names.has(pkg)) throw new Error(`packages/${pkg} realizes exactly one Agent Skill, named ${pkg}`);
      core.registerSkill(dir, pkg, kaal);
      Object.assign(skills, realization);
      capabilities.push(pkg);
    }
    return { kaal: read(dir), skills, capabilities };
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
}

