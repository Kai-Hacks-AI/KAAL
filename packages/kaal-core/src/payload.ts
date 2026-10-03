import { KERNEL_PATH, kernelMarkdown } from "./kernel.js";
import {
  CASE_PATH, CORE_PATH, EDGE_PATH, KAAL_DEFINITION_PATH, NODE_PATH,
  caseMarkdown, coreMarkdown, edgeMarkdown, kaalDefinitionMarkdown, nodeMarkdown,
} from "./nodes.js";
import { IDS, SEALED } from "./seals.js";

/**
 * The payload as files, keyed by path relative to the KAAL directory: the
 * Kernel (genesis), the foundation Nodes, and one empty marker `seals/<ID>` per
 * sealed Node. A marker records that the Node with that ID was admitted.
 */
export function payload(): Record<string, string> {
  const files: Record<string, string> = {
    [KERNEL_PATH]: kernelMarkdown(),
    [NODE_PATH]: nodeMarkdown(),
    [EDGE_PATH]: edgeMarkdown(IDS),
    [KAAL_DEFINITION_PATH]: kaalDefinitionMarkdown(IDS),
    [CASE_PATH]: caseMarkdown(IDS),
    [CORE_PATH]: coreMarkdown(IDS),
  };
  for (const id of SEALED) files[`seals/${id}`] = "";
  return files;
}
