import { embed, external } from "./configuration.mjs";
export { embed, external };
export const SHA=Object.fromEntries(["A","B","C","M","S","N"].map((x,i)=>[x,(i+1).toString(16).repeat(40)]));
export function observation(c=embed,kind="engineer") {
  const promoted=c.roles.find(r=>r.category==="promoted"), collector=c.roles.find(r=>r.category==="collector");
  const collectorRef=collector.selector.prefix+"topic";
  return {
    schema:"kaal-branching-observation/1",
    repository:{host:c.repository.host,id:c.repository.id},
    head:{repositoryId:c.repository.id,ref:kind==="promote"?collectorRef:"task/proposal",tip:kind==="engineer"?SHA.C:SHA.S},
    base:{ref:kind==="promote"?promoted.selector.exact:collectorRef,tip:kind==="promote"?SHA.M:SHA.B},
    promoted:[{role:promoted.id,ref:promoted.selector.exact,tip:SHA.M}],
    commits:[
      {sha:SHA.A,parents:[]},{sha:SHA.B,parents:[SHA.A]},{sha:SHA.C,parents:[SHA.B]},
      {sha:SHA.M,parents:[SHA.A]},{sha:SHA.S,parents:[SHA.B,SHA.M]},{sha:SHA.N,parents:[SHA.S]}
    ]
  };
}

