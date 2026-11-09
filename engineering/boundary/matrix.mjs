// The applicability matrix over Boundary Tests (engineering/boundary/PLAN.md R6; engineering/C10, F13, N9).
// Each cell is one provider definition against one target supplied by the repository. A cell is run on its own, as its own
// Run, and its evidence is kept unchanged. An exclusion with a reason is not run and is reported; an exclusion without a
// reason is not accepted: the cell is run anyway and the unsupported exclusion is itself reported.
import { scan } from "./scan.mjs";
import { loadDefinition } from "./definition.mjs";

/** cells: [{ definition: <file>, target: <path>, excluded?: { reason?: string } }]. */
export function runMatrix({ cells, base }) {
  const runs = [];
  const notes = [];
  for (const cell of cells) {
    const definition = loadDefinition(cell.definition);
    const reason = typeof cell.excluded?.reason === "string" ? cell.excluded.reason.trim() : "";
    if (cell.excluded && reason) {
      notes.push({ kind: "excluded", provider: definition.provider, target: cell.target, reason });
      continue;
    }
    if (cell.excluded) notes.push({ kind: "unsupported-exclusion", provider: definition.provider, target: cell.target });
    runs.push({ provider: definition.provider, target: cell.target, evidence: scan([definition], [cell.target], base) });
  }
  return { runs, notes };
}
