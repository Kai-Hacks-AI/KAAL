import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";
export const ROOT="brain/learning";
export type Edge={relation:string;to:string}; export type Frontmatter={name:string;edges?:Edge[]};
export function parseNode(file:string):Frontmatter{const text=fs.readFileSync(file,"utf8");const match=/^---\n([\s\S]*?)\n---\n/.exec(text);if(!match)throw new Error(`${file}: missing YAML frontmatter`);const data=YAML.parse(match[1]) as Partial<Frontmatter>;if(!data.name||typeof data.name!=="string")throw new Error(`${file}: name is required`);if(data.edges&&!Array.isArray(data.edges))throw new Error(`${file}: edges must be an array`);return data as Frontmatter;}
export function nodeFiles(root=ROOT):string[]{if(!fs.existsSync(root))return[];return fs.readdirSync(root,{recursive:true,withFileTypes:true}).filter(e=>e.isFile()&&e.name.endsWith(".md")).map(e=>path.join(e.parentPath,e.name)).sort();}
export function relativeIdentity(root:string,file:string):string{return path.relative(root,file).split(path.sep).join("/");}
export function learningKey(root:string,file:string):string{const parts=relativeIdentity(root,file).split("/");if(parts.length!==7||parts[5]!=="nodes")throw new Error(`${file}: invalid learning path`);const [lineage,yy,mm,dd,cc]=parts;if(!lineage||![yy,mm,dd,cc].every(x=>/^\d{2}$/.test(x)))throw new Error(`${file}: invalid learning path`);return [yy,mm,dd,cc].join("/");}
