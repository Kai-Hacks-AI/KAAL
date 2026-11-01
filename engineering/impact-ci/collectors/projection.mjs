// Descriptive projection only; this function establishes no CI verdict.
const text = value => typeof value === 'string' && value.length > 0 && value === value.trim();
const unique = values => new Set(values).size === values.length;
const list = values => Array.isArray(values) && values.length > 0 &&
  Array.from(values).every(text) && unique(values);
const dimensions = ['product', 'engine', 'mixed', 'cross-cutting'];

export function projectCollectors(workflows, catalog, roots) {
  if (!Array.isArray(workflows) || !workflows.length || !list(roots) ||
      catalog?.schema !== 'kaal.collector-catalog/v1' || !/^\d+\.\d+\.\d+$/.test(catalog.version) ||
      !Array.isArray(catalog.groups) || !catalog.groups.length)
    throw new TypeError('complete descriptive collector inputs required');
  const definitions = new Map();
  for (const group of catalog.groups) {
    if (!group || !text(group.id) || !text(group.name)) throw new TypeError('invalid collector identity');
    if (definitions.has(group.id)) throw new TypeError(`duplicate collector: ${group.id}`);
    const branch = group.children !== undefined;
    if (branch ? !list(group.children) || group.selectors !== undefined :
        !dimensions.includes(group.dimension) || !Array.isArray(group.selectors) || !group.selectors.length)
      throw new TypeError(`invalid collector shape: ${group.id}`);
    if (!branch && group.selectors.some(s => !s || !text(s.workflow) ||
        Object.keys(s).some(k => !['workflow', 'jobKeys', 'checks'].includes(k)) ||
        s.jobKeys !== undefined && !list(s.jobKeys) || s.checks !== undefined && !list(s.checks)))
      throw new TypeError(`invalid collector selector: ${group.id}`);
    definitions.set(group.id, group);
  }
  const visited = new Set(), visiting = new Set(), order = [];
  const visit = id => {
    if (visiting.has(id)) throw new TypeError(`collector cycle: ${id}`);
    if (visited.has(id)) return;
    const group = definitions.get(id);
    if (!group) throw new TypeError(`unknown collector: ${id}`);
    visiting.add(id);
    for (const child of group.children ?? []) visit(child);
    visiting.delete(id); visited.add(id); order.push(id);
  };
  for (const root of roots) visit(root);
  if (visited.size !== definitions.size) throw new TypeError('unreachable collector definitions');
  const leaves = [], ids = new Set();
  for (const workflow of workflows) {
    if (!text(workflow?.path) || !Array.isArray(workflow.jobs) || !workflow.jobs.length)
      throw new TypeError('invalid expected workflow projection');
    for (const job of workflow.jobs) {
      if (!job || ![job.job, job.check, job.os].every(text)) throw new TypeError('invalid expected leaf identity');
      const id = `${workflow.path}::${job.check}@${job.os}`;
      if (ids.has(id)) throw new TypeError(`duplicate expected obligation: ${id}`);
      ids.add(id);
      const owners = catalog.groups.filter(g => g.selectors?.some(s => s.workflow === workflow.path &&
        (s.jobKeys === undefined || s.jobKeys.includes(job.job)) &&
        (s.checks === undefined || s.checks.includes(job.check))));
      if (!owners.length) throw new TypeError(`unassigned obligation: ${id}`);
      if (owners.length !== 1) throw new TypeError(`obligation assigned to multiple collectors: ${id}`);
      leaves.push({id, workflow: workflow.path, workflowId: workflow.id, jobKey: job.job,
        check: job.check, os: job.os, collector: owners[0].id, dimension: owners[0].dimension});
    }
  }
  const memberships = new Map();
  for (const id of order) {
    const group = definitions.get(id);
    const members = group.children ? new Set(group.children.flatMap(child => [...memberships.get(child)])) :
      new Set(leaves.filter(leaf => leaf.collector === id).map(leaf => leaf.id));
    if (!members.size && !group.allowEmpty) throw new TypeError(`empty required collector: ${id}`);
    memberships.set(id, members);
  }
  return {schema: 'kaal.collector-projection/v1', roots: [...roots], leaves,
    groups: catalog.groups.map(group => ({id: group.id, name: group.name,
      children: [...(group.children ?? [])], dimension: group.dimension ?? null,
      applicable: memberships.get(group.id).size > 0,
      leafIds: leaves.filter(leaf => memberships.get(group.id).has(leaf.id)).map(leaf => leaf.id)}))};
}
