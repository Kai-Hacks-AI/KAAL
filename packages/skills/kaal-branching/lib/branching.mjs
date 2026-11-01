// Branching's pure configuration contract. No host access and no policy defaults.
// Runtime authority, target facts and transaction execution are separate future slices.
class ConfigurationError extends Error {
  constructor(code, path, message) { super(message); this.finding = {code, path, message}; }
}
const reject = (code, path, message) => { throw new ConfigurationError(code, path, message); };
const object = (x) => x !== null && typeof x === "object" && !Array.isArray(x);
function fields(x, required, at, optional = []) {
  if (!object(x)) reject("object", at, "Expected an object.");
  for (const key of required) if (!Object.hasOwn(x,key)) reject("missing",at+"."+key,"Required field is absent.");
  for (const key of Object.keys(x)) if (!required.includes(key) && !optional.includes(key)) reject("unknown",at+"."+key,"Field is not supported.");
}
function choice(x, values, at) {
  if (!values.includes(x)) reject("unsupported",at,"Value is outside the supported configuration vocabulary.");
}
function string(x,at) {
  if (typeof x !== "string" || !x.length || x.trim() !== x) reject("string",at,"Expected a nonempty string without surrounding whitespace.");
}
function integer(x,at,min=1) {
  if (!Number.isFinite(x) || !Number.isSafeInteger(x) || x < min) reject("number",at,"Expected a safe integer at or above "+min+".");
}
function boolean(x,at) { if (typeof x !== "boolean") reject("boolean",at,"Expected an explicit boolean."); }
function yes(x,at) { choice(x,[true],at); }
function array(x,at) { if(!Array.isArray(x) || !x.length) reject("array",at,"Expected a nonempty array."); }
function id(x,at) {
  if(typeof x!=="string" || !/^[a-z][a-z0-9-]*$/.test(x)) reject("id",at,"Expected a lowercase identifier.");
}
function ref(x,at) {
  if (typeof x!=="string" || x==="@" || x==="HEAD" || !x.length || x.startsWith("-") ||
      /[\x00-\x20\x7f~^:?*\[\\]/.test(x) || x.includes("..") || x.includes("@{") ||
      x.split("/").some(s=>!s || s.startsWith(".") || s.endsWith(".") || s.endsWith(".lock")))
    reject("ref",at,"Expected a valid, non-reserved Git branch name.");
}
function relativePath(x,at) {
  if(typeof x!=="string" || !x.length || /[\\\x00-\x1f]/.test(x) ||
      x.split("/").some(s=>!s || s==="." || s==="..") || /^[A-Za-z]:/.test(x))
    reject("path",at,"Expected a repository-relative path without traversal.");
}

// JSON.parse checks grammar. This second lexical pass detects decoded duplicate keys
// before a parsed object can be used as policy, and rejects nonfinite JSON numbers.
function auditJSON(text) {
  // Scan each code unit once. An unanchored string-token regex can retry at
  // every escaped quote; token boundaries must not depend on backtracking.
  const tokens=[];
  let cursor=0;
  const whitespace=(c)=>c===" "||c==="\n"||c==="\r"||c==="\t";
  const punctuation=(c)=>"{}[],:".includes(c);
  while(cursor<text.length) {
    if(whitespace(text[cursor])) {cursor++;continue;}
    const start=cursor;
    if(text[cursor]==='"') {
      cursor++;
      while(cursor<text.length) {
        const c=text[cursor++];
        if(c==="\\") cursor++;
        else if(c==='"') break;
      }
    } else if(punctuation(text[cursor])) cursor++;
    else while(cursor<text.length && !whitespace(text[cursor]) && !punctuation(text[cursor])) cursor++;
    tokens.push(text.slice(start,cursor));
  }
  let i=0;
  function value(at,depth) {
    if(depth>128) reject("depth",at,"Configuration nesting exceeds the supported bound.");
    const token=tokens[i++];
    if(token==="{") {
      const keys=new Set();
      if(tokens[i]==="}") { i++; return; }
      while(true) {
        const key=JSON.parse(tokens[i++]), path=at+"."+key;
        if(keys.has(key)) reject("duplicate-key",path,"Duplicate decoded JSON key.");
        keys.add(key); i++; // colon; grammar was already checked
        value(path,depth+1);
        if(tokens[i++]==="}") return; // otherwise comma
      }
    }
    if(token==="[") {
      if(tokens[i]==="]") {i++;return;}
      let item=0;
      while(true) {
        value(at+"["+(item++)+"]",depth+1);
        if(tokens[i++]==="]") return;
      }
    }
    if(/^-?\d/.test(token) && !Number.isFinite(Number(token)))
      reject("number",at,"JSON number is not finite.");
  }
  value("$",0);
}

const categories=["promoted","collector","working"];
const lifecycles={promoted:"retain",collector:"delete-after-complete-promotion",working:"delete-after-integration"};
const kinds={
  engineer:{from:"working",to:"collector",method:"squash",obligations:["on-target-tip","no-unincorporated-promoted-history","change-claim","governed-integration"]},
  synchronize:{from:"working",to:"collector",method:"merge",obligations:["on-target-tip","strict-forward-progress","preserve-outstanding-work","explicit-resolutions","governed-integration"]},
  promote:{from:"collector",to:"promoted",method:"squash",obligations:["contains-target-tip","validated-head-tree","promotion-order","governed-integration"]},
};
function rolesOf(c) {
  array(c.roles,"$.roles");
  const roles=new Map(), selectors=[];
  let remainder=0;
  for(const [i,r] of c.roles.entries()) {
    const at="$.roles["+i+"]";
    fields(r,["id","category","selector","lifecycle"],at,["establishFrom"]);
    id(r.id,at+".id");
    if(roles.has(r.id)) reject("duplicate-id",at+".id","Role ID is repeated.");
    roles.set(r.id,r);
    choice(r.category,categories,at+".category");
    if(r.lifecycle!==lifecycles[r.category]) reject("lifecycle",at+".lifecycle","Lifecycle contradicts the role category.");
    if(!object(r.selector) || Object.keys(r.selector).length!==1)
      reject("selector",at+".selector","Select exactly one exact, prefix or remainder selector.");
    const kind=Object.keys(r.selector)[0], v=r.selector[kind];
    if(!["exact","prefix","remainder"].includes(kind)) reject("selector",at+".selector","Unsupported selector.");
    if(kind==="exact") ref(v,at+".selector.exact");
    if(kind==="prefix") {
      if(typeof v!=="string" || !v.endsWith("/")) reject("ref",at+".selector.prefix","Prefix must end at a branch path boundary.");
      ref(v.slice(0,-1),at+".selector.prefix");
    }
    if(kind==="remainder") {
      yes(v,at+".selector.remainder");
      if(r.category!=="working") reject("selector",at+".selector","Only working roles can use the explicit remainder.");
      if(++remainder>1) reject("ambiguous","$.roles","More than one remainder role.");
    } else selectors.push({kind,value:v});
    if(r.category==="promoted" && kind!=="exact") reject("selector",at+".selector","A promoted role names one exact branch.");
    if(r.category==="collector") {
      if(!Object.hasOwn(r,"establishFrom")) reject("missing",at+".establishFrom","Collector establishment source is required.");
    } else if(Object.hasOwn(r,"establishFrom")) reject("unknown",at+".establishFrom","Only collectors declare an establishment source.");
  }
  for(let i=0;i<selectors.length;i++) for(let j=i+1;j<selectors.length;j++) {
    const a=selectors[i],b=selectors[j];
    const overlaps=a.kind==="exact"&&b.kind==="exact" ? a.value===b.value :
      a.kind==="prefix"&&b.kind==="prefix" ? a.value.startsWith(b.value)||b.value.startsWith(a.value) :
      a.kind==="exact" ? a.value.startsWith(b.value) : b.value.startsWith(a.value);
    if(overlaps) reject("overlap","$.roles","Explicit branch selectors overlap; remainder is their complement.");
  }
  for(const [i,r] of c.roles.entries()) if(r.category==="collector" && roles.get(r.establishFrom)?.category!=="promoted")
    reject("role","$.roles["+i+"].establishFrom","Collector must be established from a declared promoted role.");
  return roles;
}
function transactionsOf(c,roles) {
  array(c.transactions,"$.transactions");
  const ids=new Set(), pairs=new Set();
  for(const [i,t] of c.transactions.entries()) {
    const at="$.transactions["+i+"]";
    fields(t,["id","kind","from","to","repositoryRelation","method","obligations"],at,["incorporates"]);
    id(t.id,at+".id");
    if(ids.has(t.id)) reject("duplicate-id",at+".id","Transaction ID is repeated.");
    ids.add(t.id);
    choice(t.kind,Object.keys(kinds),at+".kind");
    const spec=kinds[t.kind];
    choice(t.repositoryRelation,["same"],at+".repositoryRelation");
    for(const side of ["from","to"]) if(!roles.has(t[side])) reject("role",at+"."+side,"Referenced role is absent.");
    if(roles.get(t.from).category!==spec.from || roles.get(t.to).category!==spec.to)
      reject("transaction",at,"Role categories do not support this transaction kind.");
    const key=JSON.stringify([t.kind,t.from,t.to,t.repositoryRelation]);
    if(pairs.has(key)) reject("ambiguous","$.transactions","More than one transaction matches the same kind and role pair.");
    pairs.add(key);
    choice(t.method,[spec.method],at+".method");
    array(t.obligations,at+".obligations");
    for(const v of t.obligations) choice(v,spec.obligations,at+".obligations");
    if(new Set(t.obligations).size!==t.obligations.length || spec.obligations.some(v=>!t.obligations.includes(v)))
      reject("obligation",at+".obligations","Transaction obligations are incomplete or repeated.");
    if(t.kind==="synchronize") {
      if(!Object.hasOwn(t,"incorporates")) reject("missing",at+".incorporates","Synchronization must name its promoted source role.");
      if(roles.get(t.incorporates)?.category!=="promoted") reject("role",at+".incorporates","Synchronization must incorporate a declared promoted role.");
      if(roles.get(t.to).establishFrom!==t.incorporates) reject("contradiction",at+".incorporates","Synchronization source differs from the collector's declared source.");
    } else if(Object.hasOwn(t,"incorporates")) reject("unknown",at+".incorporates","Only synchronization declares an incorporated role.");
  }
}
function governanceOf(g) {
  const at="$.governance";
  fields(g,["pullRequest","autoMerge","strictFreshness","review","checks","claims","bypass","promotionOrder","holds"],at);
  yes(g.pullRequest,at+".pullRequest");
  choice(g.autoMerge,["required"],at+".autoMerge");
  yes(g.strictFreshness,at+".strictFreshness");
  const r=g.review, p=at+".review";
  fields(r,["minimumApprovals","independent","dismissStale","resolveThreads"],p);
  integer(r.minimumApprovals,p+".minimumApprovals",0);
  for(const k of ["independent","dismissStale","resolveThreads"]) boolean(r[k],p+"."+k);
  if(r.independent && r.minimumApprovals<1) reject("contradiction",p,"Independent review requires at least one approval.");
  const checks=g.checks,q=at+".checks";
  fields(checks,["authority","requireCompleteEnumeration","requiredIdentity"],q);
  choice(checks.authority,["effective-host-rules"],q+".authority");
  yes(checks.requireCompleteEnumeration,q+".requireCompleteEnumeration");
  if(checks.requiredIdentity!==null) {
    fields(checks.requiredIdentity,["name","integrationId"],q+".requiredIdentity");
    string(checks.requiredIdentity.name,q+".requiredIdentity.name");
    integer(checks.requiredIdentity.integrationId,q+".requiredIdentity.integrationId");
  }
  const claim=g.claims,h=at+".claims";
  fields(claim,["applicability","provider","contract"],h);
  choice(claim.applicability,["when-provider-admitted"],h+".applicability");
  string(claim.provider,h+".provider");
  choice(claim.contract,["checkClaim"],h+".contract");
  choice(g.bypass,["forbidden"],at+".bypass");
  const order=g.promotionOrder,o=at+".promotionOrder";
  fields(order,["mode","enforcement","authority"],o);
  choice(order.mode,["fifo-owner-override"],o+".mode");
  choice(order.enforcement,["manual-preflight"],o+".enforcement");
  choice(order.authority,["repository-admin"],o+".authority");
  const hold=g.holds,s=at+".holds";
  fields(hold,["authority","source","path","outcome"],s);
  choice(hold.authority,["repository-admin"],s+".authority");
  choice(hold.source,["trusted-revision","authorized-policy-interface"],s+".source");
  choice(hold.outcome,["held"],s+".outcome");
  if(hold.source==="trusted-revision") relativePath(hold.path,s+".path");
  else if(hold.path!==null) reject("contradiction",s+".path","External policy-interface holds do not name a required target file.");
}

/**
 * Validate JSON configuration structure and supported vocabulary only.
 * A pass does not authenticate its source, read a target, resolve runtime provider
 * availability, classify a proposed transaction or establish effective enforcement.
 * No source object is accepted: exact JSON text is needed to detect duplicate keys.
 */
export function validateConfiguration(text) {
  const failed=(finding)=>({kind:"fail",findings:[finding]});
  if(typeof text!=="string") return failed({code:"input",path:"$",message:"Configuration must be explicit JSON text."});
  let c;
  try {c=JSON.parse(text);} catch {return failed({code:"json",path:"$",message:"Configuration is not valid JSON."});}
  try {
    auditJSON(text);
    fields(c,["schema","repository","roles","transactions","governance","evidence"],"$");
    choice(c.schema,["kaal-branching/1"],"$.schema");
    fields(c.repository,["host","id","name"],"$.repository");
    choice(c.repository.host,["https://github.com"],"$.repository.host");
    if(typeof c.repository.id!=="string" || !/^[1-9]\d*$/.test(c.repository.id)) reject("identity","$.repository.id","Expected an explicit numeric repository ID string.");
    if(typeof c.repository.name!=="string" || !/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(c.repository.name)) reject("identity","$.repository.name","Expected an owner/repository display name.");
    const roles=rolesOf(c);
    transactionsOf(c,roles);
    governanceOf(c.governance);
    const e=c.evidence,at="$.evidence";
    fields(e,["maxObservationAgeSeconds","recheckBeforeMutation","recheckAfterMutation","requireCompletePagination","requireRevisionBinding"],at);
    integer(e.maxObservationAgeSeconds,at+".maxObservationAgeSeconds");
    for(const k of ["recheckBeforeMutation","recheckAfterMutation","requireCompletePagination","requireRevisionBinding"]) yes(e[k],at+"."+k);
    return {kind:"pass",configuration:c,findings:[]};
  } catch(e) {
    if(e instanceof ConfigurationError) return failed(e.finding);
    throw e;
  }
}



// Resolve configured branch roles; the remainder is the explicit complement.
function roleFor(configuration, name) {
  ref(name,"$.observation.ref");
  return configuration.roles.find(r=>r.selector.exact===name ||
    (r.selector.prefix!==undefined && name.startsWith(r.selector.prefix))) ??
    configuration.roles.find(r=>r.selector.remainder===true) ?? null;
}
function sha(value,at) {
  if(typeof value!=="string" || !(/^[0-9a-f]{40}$/.test(value)||/^[0-9a-f]{64}$/.test(value)))
    reject("evidence",at,"Expected a complete Git object ID.");
}
function graphOf(observation) {
  if(!Array.isArray(observation.commits)||observation.commits.length===0)
    reject("evidence","$.observation.commits","Commit ancestry was not supplied.");
  const graph=new Map();
  for(const [i,node]of observation.commits.entries()) {
    const at="$.observation.commits["+i+"]";
    fields(node,["sha","parents"],at);sha(node.sha,at+".sha");
    if(node.sha.length!==observation.head.tip.length) reject("evidence",at+".sha","One repository observation cannot mix Git object ID formats.");
    if(!Array.isArray(node.parents)) reject("evidence",at+".parents","Parent list is absent.");
    if(graph.has(node.sha)) reject("evidence",at+".sha","Commit ID was supplied more than once.");
    const seen=new Set();
    for(const parent of node.parents) {
      sha(parent,at+".parents");
      if(parent.length!==node.sha.length || seen.has(parent)) reject("evidence",at+".parents","Parent identities are inconsistent or repeated.");
      seen.add(parent);
    }
    graph.set(node.sha,node.parents);
  }
  const children=new Map([...graph.keys()].map(id=>[id,[]]));
  const remaining=new Map();
  for(const [id,parents]of graph) {
    remaining.set(id,parents.length);
    for(const parent of parents) {
      if(!graph.has(parent)) reject("evidence","$.observation.commits","A referenced parent is missing.");
      children.get(parent).push(id);
    }
  }
  const ready=[...remaining].filter(([,n])=>n===0).map(([id])=>id);
  for(let i=0;i<ready.length;i++) for(const child of children.get(ready[i])) {
    const count=remaining.get(child)-1;remaining.set(child,count);
    if(count===0) ready.push(child);
  }
  if(ready.length!==graph.size) reject("evidence","$.observation.commits","Commit graph contains a cycle.");
  return graph;
}
function ancestors(graph,start) {
  if(!graph.has(start)) reject("evidence","$.observation","An observed tip has no commit evidence.");
  const seen=new Set(), pending=[start];
  while(pending.length) {
    const id=pending.pop();if(seen.has(id))continue;
    seen.add(id);pending.push(...graph.get(id));
  }
  return seen;
}
const classifiedFailure=(kind,code,message,path="$")=>({kind,scope:"classification",findings:[{code,path,message}]});

/**
 * Classify a proposal from complete, caller-supplied commit-parent observations.
 * The result names a configured transaction and method, not its acceptance:
 * tree preservation, source authority, live freshness/reviews/checks remain pending.
 */
export function classify(configurationText,observationText) {
  const validated=validateConfiguration(configurationText);
  if(validated.kind!=="pass") return {...validated,scope:"classification"};
  const c=validated.configuration;
  if(typeof observationText!=="string") return classifiedFailure("cannot-judge","evidence","Observation must be explicit JSON text.");
  let o;
  try {o=JSON.parse(observationText);} catch {return classifiedFailure("cannot-judge","evidence","Observation is not valid JSON.");}
  try {
    auditJSON(observationText);
    fields(o,["schema","repository","head","base","promoted","commits"],"$.observation");
    choice(o.schema,["kaal-branching-observation/1"],"$.observation.schema");
    fields(o.repository,["host","id"],"$.observation.repository");
    fields(o.head,["repositoryId","ref","tip"],"$.observation.head");
    fields(o.base,["ref","tip"],"$.observation.base");
    for(const side of ["head","base"]) {ref(o[side].ref,"$.observation."+side+".ref");sha(o[side].tip,"$.observation."+side+".tip");}
    if(o.repository.host!==c.repository.host || o.repository.id!==c.repository.id)
      return classifiedFailure("fail","target","Observation identifies a different governed repository.");
    if(o.head.repositoryId!==o.repository.id)
      return classifiedFailure("fail","source","Supported transactions require the configured same-repository source.");
    const source=roleFor(c,o.head.ref), target=roleFor(c,o.base.ref);
    if(!source||!target) return classifiedFailure("fail","prohibited","A branch has no configured role.");
    const graph=graphOf(o), headAncestors=ancestors(graph,o.head.tip), baseAncestors=ancestors(graph,o.base.tip);
    const promoted=new Map();
    if(!Array.isArray(o.promoted)) reject("evidence","$.observation.promoted","Promoted observations are absent.");
    for(const [i,p]of o.promoted.entries()) {
      const at="$.observation.promoted["+i+"]";fields(p,["role","ref","tip"],at);
      const role=c.roles.find(r=>r.id===p.role);
      if(!role||role.category!=="promoted"||role.selector.exact!==p.ref||promoted.has(p.role))
        reject("evidence",at,"Promoted role binding is unknown, conflicting or repeated.");
      sha(p.tip,at+".tip");ancestors(graph,p.tip);
      if((p.ref===o.base.ref&&p.tip!==o.base.tip)||(p.ref===o.head.ref&&p.tip!==o.head.tip))
        reject("evidence",at,"One branch is observed at inconsistent tips.");
      promoted.set(p.role,p);
    }
    if(c.roles.filter(r=>r.category==="promoted").some(r=>!promoted.has(r.id)))
      reject("evidence","$.observation.promoted","A configured promoted role has no observation.");
    let kind,incorporates;
    if(source.category==="collector"&&target.category==="promoted") kind="promote";
    else if(source.category==="working"&&target.category==="collector") {
      const upstream=promoted.get(target.establishFrom);
      const upstreamAncestors=ancestors(graph,upstream.tip);
      const parents=graph.get(o.head.tip);
      const syncCandidate=parents.length===2 && upstreamAncestors.has(parents[1]) && !baseAncestors.has(parents[1]);
      const carriesPromoted=[...headAncestors].some(id=>upstreamAncestors.has(id)&&!baseAncestors.has(id));
      if(syncCandidate) {
        if(!ancestors(graph,parents[0]).has(o.base.tip))
          return classifiedFailure("fail","synchronization-base","Synchronization does not build on the collector tip.");
        const firstParent=new Set();let current=upstream.tip;
        while(current!==undefined) {firstParent.add(current);current=graph.get(current)[0];}
        if(!firstParent.has(parents[1]))
          return classifiedFailure("fail","synchronization-source","Synchronization source is not an admitted first-parent promoted state.");
        kind="synchronize";incorporates=parents[1];
      } else if(carriesPromoted) return classifiedFailure("fail","mixed-history","Unincorporated promoted history is neither an ordinary Change nor a head synchronization.");
      else kind="engineer";
    } else return classifiedFailure("fail","prohibited","Role categories do not support a transaction.");
    const transaction=c.transactions.find(t=>t.kind===kind&&t.from===source.id&&t.to===target.id&&t.repositoryRelation==="same");
    if(!transaction) return classifiedFailure("fail","prohibited","The consumer does not permit this transaction.");
    return {
      kind:"pass",scope:"classification",transaction:{...transaction,obligations:[...transaction.obligations]},
      binding:{repository:{...o.repository},head:{...o.head},base:{...o.base},...(incorporates?{incorporates}:{})},
      pendingObligations:[...transaction.obligations],findings:[]
    };
  } catch(e) {
    if(e instanceof ConfigurationError) return {kind:"cannot-judge",scope:"classification",findings:[e.finding]};
    throw e;
  }
}

