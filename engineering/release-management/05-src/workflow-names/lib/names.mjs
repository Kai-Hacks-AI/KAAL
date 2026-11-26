// Pure: which workflows can not be told apart by their display name? It imports nothing, reads nothing, knows no baseline and no verdict.
export const GENERIC = 'KAAL';

// workflows: a list of { file, name }, where name is the top-level `name:` or undefined when there is none.
// A finding is `<file>:missing-name`, `<file>:generic-name` (the bare repository name) or `<file>:duplicate-name` (a name another workflow also has).
export function workflowNamesFindings(workflows) {
  const named = workflows.filter((w) => w.name !== undefined && w.name !== GENERIC);
  const count = (n) => named.filter((w) => w.name === n).length;
  return workflows.flatMap(({ file, name }) => {
    if (name === undefined) return [`${file}:missing-name`];
    if (name === GENERIC) return [`${file}:generic-name`];
    return count(name) > 1 ? [`${file}:duplicate-name`] : [];
  }).sort();
}
