import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { learningKey, nodeFiles, parseNode, relativeIdentity } from "./brain.js";

export function validate(root = "brain/learning"): string[] {
  const files = nodeFiles(root);
  const byId = new Map(files.map(file => [path.relative(root, file).split(path.sep).join("/"), file]));
  const errors: string[] = [];
  for (const file of files) {
    let node;
    try { node = parseNode(file); } catch (error) { errors.push(String(error)); continue; }
    const born = learningKey(file);
    for (const edge of node.edges ?? []) {
      for (const [kind, id] of [["relation", edge.relation], ["target", edge.to]] as const) {
        const known = byId.get(id);
        if (!known) { errors.push(`${relativeIdentity(file)}: missing ${kind} ${id}`); continue; }
        if (learningKey(known) >= born) errors.push(`${relativeIdentity(file)}: ${kind} ${id} was not born earlier`);
      }
    }
  }
  return errors;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const errors = validate();
  if (errors.length) { console.error(errors.join("\n")); process.exitCode = 1; }
}
