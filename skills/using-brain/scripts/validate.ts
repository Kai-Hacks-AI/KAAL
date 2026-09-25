import path from "node:path";
import { pathToFileURL } from "node:url";
import { edgeErrors, learningOf, nodeIndex, parseNode, portableNameError, relativeIdentity, ROOT } from "./brain.js";

export function validate(root = ROOT): string[] {
  const known = nodeIndex(root);
  const errors: string[] = [];
  for (const file of known.values()) {
    let node;
    let born;
    try {
      node = parseNode(file);
      born = learningOf(root, file);
    } catch (e) {
      errors.push(String(e));
      continue;
    }
    const id = relativeIdentity(root, file);
    for (const error of [
      portableNameError(born.lineage, "lineage"),
      portableNameError(path.basename(file, ".md"), "slug"),
    ]) {
      if (error) errors.push(`${id}: ${error}`);
    }
    errors.push(...edgeErrors(root, relativeIdentity(root, file), born, node.edges ?? [], known));
  }
  return errors;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const errors = validate();
  if (errors.length) {
    console.error(errors.join("\n"));
    process.exitCode = 1;
  }
}
