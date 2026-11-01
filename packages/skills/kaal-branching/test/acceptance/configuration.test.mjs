// T12-T15: installed public validator; no target filesystem or host operation.
import assert from "node:assert/strict";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { before, it } from "node:test";
import { update } from "kaal-hosting";
import { install } from "kaal-testing/acceptance";
import { embed, external } from "../fixtures/configuration.mjs";

let validate;
before(async () => {
  const host = await install(["@kaihacksai/kaal-foundation", "kaal-hosting", "kaal-branching"], { offline: true });
  await update(host, () => ({prefix:"consumer", files:{"public.mjs":Buffer.from('export {validateConfiguration} from "kaal-branching";\n')}}));
  ({validateConfiguration:validate} = await import(pathToFileURL(join(host,"consumer","public.mjs")).href));
});
const text = (x) => JSON.stringify(x);
const changed = (fn) => { const c = structuredClone(embed); fn(c); return text(c); };
function refused(input, code, path) {
  const r = validate(input);
  assert.equal(r.kind, "fail", JSON.stringify(r));
  assert.equal(Object.hasOwn(r, "configuration"), false, "invalid input never exposes usable policy");
  assert.ok(r.findings.some(f => f.code === code && (!path || f.path === path)), JSON.stringify(r.findings));
  assert.ok(r.findings.every(f => typeof f.message === "string" && f.message.length));
}
it("branching/T12: accepts two consumer naming schemes, including controller policy without target KAAL files/checks", () => {
  for(const c of [embed, external()]) {
    const before = text(c);
    const r = validate(before);
    assert.equal(r.kind,"pass",JSON.stringify(r.findings));
    assert.deepEqual(r.configuration,c);
    assert.deepEqual(r.findings,[]);
    assert.equal(text(c),before);
  }
});
it("branching/T13: absent, incomplete, duplicate, unknown and unsupported configuration is refused", () => {
  for(const input of [undefined, null, {}, 12]) refused(input,"input");
  for(const input of ["", "{", "{} trailing"]) refused(input,"json");
  for(const input of ["[]","null","42"]) refused(input,"object","$");
  refused(text({...embed, schema:"kaal-branching/2"}),"unsupported","$.schema");
  refused(text({...embed, experimental:true}),"unknown","$.experimental");
  refused(changed(c=>{delete c.evidence;}),"missing","$.evidence");
  refused(changed(c=>{delete c.governance.review.resolveThreads;}),"missing","$.governance.review.resolveThreads");
  refused(changed(c=>{c.governance.review.surprise=true;}),"unknown","$.governance.review.surprise");
  refused(text(embed).replace('"schema":','"schema":"kaal-branching/1","sche\\u006da":'),"duplicate-key","$.schema");
  refused(text(embed).replace('"minimumApprovals":1','"minimumApprovals":1,"minimumApprovals":2'),"duplicate-key","$.governance.review.minimumApprovals");
  refused(text(embed).replace('"maxObservationAgeSeconds":60','"maxObservationAgeSeconds":1e400'),"number","$.evidence.maxObservationAgeSeconds");
});
it("branching/T14: ambiguous roles, selectors, transactions and malformed refs are refused", () => {
  refused(changed(c=>{c.roles.push({...c.roles[1],id:"nested",selector:{prefix:"kaal/deep/"}});}),"overlap","$.roles");
  refused(changed(c=>{c.roles.push({...c.roles[0],id:"other",selector:{exact:"kaal/x"}});}),"overlap","$.roles");
  refused(changed(c=>{c.roles.push({...c.roles[2],id:"remainder"});}),"ambiguous","$.roles");
  refused(changed(c=>{c.roles[0].selector={exact:"main",prefix:"main/"};}),"selector","$.roles[0].selector");
  refused(changed(c=>{c.roles[1].id=c.roles[0].id;}),"duplicate-id","$.roles[1].id");
  refused(changed(c=>{c.transactions.push({...c.transactions[0],id:"another"});}),"ambiguous","$.transactions");
  refused(changed(c=>{c.transactions[1].id=c.transactions[0].id;}),"duplicate-id","$.transactions[1].id");
  for(const ref of ["HEAD","bad..ref","bad.lock","bad ref","a//b","a/@{b","a/.hidden","a\\\\b","a/","@","a?b"])
    refused(changed(c=>{c.roles[0].selector.exact=ref;}),"ref","$.roles[0].selector.exact");
});
it("branching/T15: unsupported methods, broken role references and contradictory obligations fail closed", () => {
  refused(changed(c=>{c.transactions[0].from="missing";}),"role","$.transactions[0].from");
  refused(changed(c=>{c.transactions[0].from="release";}),"transaction","$.transactions[0]");
  refused(changed(c=>{c.transactions[1].method="rebase";}),"unsupported","$.transactions[1].method");
  refused(changed(c=>{delete c.transactions[1].incorporates;}),"missing","$.transactions[1].incorporates");
  refused(changed(c=>{c.transactions[1].incorporates="change";}),"role","$.transactions[1].incorporates");
  refused(changed(c=>{c.transactions[0].obligations=c.transactions[0].obligations.filter(x=>x!=="on-target-tip");}),"obligation","$.transactions[0].obligations");
  refused(changed(c=>{c.transactions[0].obligations.push("invented");}),"unsupported","$.transactions[0].obligations");
  refused(changed(c=>{c.roles[1].lifecycle="retain";}),"lifecycle","$.roles[1].lifecycle");
  refused(changed(c=>{c.roles[1].establishFrom="change";}),"role","$.roles[1].establishFrom");
  refused(changed(c=>{delete c.governance.claims.provider;}),"missing","$.governance.claims.provider");
  refused(changed(c=>{c.governance.holds.path="../untrusted.json";}),"path","$.governance.holds.path");
  refused(changed(c=>{c.governance.review.minimumApprovals=0;}),"contradiction","$.governance.review");
  refused(changed(c=>{c.evidence.recheckBeforeMutation=false;}),"unsupported","$.evidence.recheckBeforeMutation");
});

