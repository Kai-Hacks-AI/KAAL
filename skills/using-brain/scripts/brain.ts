import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";

export const ROOT = "brain/learning";
export type Edge = { relation: string; to: string };
export type Frontmatter = { name: string; edges?: Edge[] };
function isRecord(value: unknown): value is Record<string, unknown> { return typeof value === "object" && value !== null && !Array.isArray(value); }
export function parseNode(file: string): Frontmatter {
  const text=fs.readFileSync(file,"utf8"); const match=/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(text);
  if(!match) throw new Error(`${file}: missing YAML frontmatter`);
  const data:unknown=YAML.parse(match[1]); if(!isRecord(data)) throw new Error(`${file}: frontmatter must be a mapping`);
  if(typeof data.name!=="string" || !data.name.trim()) throw new Error(`${file}: name is required`);
  if(data.edges!==undefined){if(!Array.isArray(data.edges))throw new Error(`${file}: edges must be an array`);for(const edge of data.edges)if(!isRecord(edge)||typeof edge.relation!=="string"||typeof edge.to!=="string")throw new Error(`${file}: each edge needs string relation and to`);}
  return data as Frontmatter;
}
export function nodeFiles(root=ROOT):string[]{if(!fs.existsSync(root))return[];return fs.readdirSync(root,{recursive:true,withFileTypes:true}).filter(e=>e.isFile()&&e.name.endsWith(".md")).map(e=>path.join(e.parentPath,e.name)).sort();}
export function relativeIdentity(root:string,file:string):string{return path.relative(root,file).split(path.sep).join("/");}
export type Learning={lineage:string;key:string};
export function learningOf(root:string,file:string):Learning{const parts=relativeIdentity(root,file).split("/");if(parts.length!==7||parts[5]!=="nodes")throw new Error(`${file}: invalid learning path`);const [lineage,yy,mm,dd,cc]=parts;if(!lineage||![yy,mm,dd,cc].every(x=>/^\d{2}$/.test(x)))throw new Error(`${file}: invalid learning path`);return{lineage,key:[yy,mm,dd,cc].join("/")};}
export function learningKey(root:string,file:string):string{return learningOf(root,file).key;}
export function nodeIndex(root=ROOT):Map<string,string>{return new Map(nodeFiles(root).map(f=>[relativeIdentity(root,f),f]));}
export function edgeErrors(root:string,self:string,born:Learning,edges:Edge[],known=nodeIndex(root)):string[]{const errors:string[]=[];for(const edge of edges)for(const [kind,id] of [["relation",edge.relation],["target",edge.to]] as const){const file=known.get(id);if(!file){errors.push(`${self}: missing ${kind} ${id}`);continue;}try{const theirs=learningOf(root,file);if(theirs.lineage!==born.lineage)errors.push(`${self}: ${kind} ${id} is in another lineage`);else if(theirs.key>=born.key)errors.push(`${self}: ${kind} ${id} was not born earlier`);}catch(e){errors.push(String(e));}}return errors;}
