// The package structure checker (packaging/C24, packaging/F39 to F45, plan/structure/plan.md).
// checkStructure(dir, { packed, build }) judges ONE package folder against the layout Packaging owns:
//   packed  the paths `npm pack` would deliver, relative to the folder (the caller supplies them)
//   build   (dir, out) => void|Promise, writes dist/ into `out` (the caller supplies it; Packaging requires a
//           reproducible result, not a tool)
// It returns { result, findings }. result is "verified", "failed", "unknown" (could not observe, or a
// refused path) or "not-in-layout" (a package that has not taken the layout is neither verified nor failed).
// Each finding is { kind, path }. It reads no package name and implies no dependency (packaging/N8).
//
// Every host operation goes through Hosting (lib/host.mjs, packaging/A1, T6). Hosting has no operation that lists a
// directory's entries (an empty directory is invisible to `read`), so `entries`, `scratch` and `drop` run a
// one-line Node script through Hosting's `execute`. That is the Boundary Check finding this module carries for
// Hosting's owner to decide (raised to the Owner): a listing operation in Hosting would remove all three.
import { execute, kind, read, readFile } from "./host.mjs";

/** `/`-separated join; Hosting accepts it on every host. */
const join = (...parts) => parts.join("/");

/** Run a small Node script through Hosting; its data is inlined as JSON, so no process state is read. */
async function node(script, cwd) {
  const r = await execute(process.execPath, ["-e", script], { cwd });
  if (r.status !== 0) throw new Error(r.stderr);
  return r.stdout.trim();
}

/** Where each source folder is copied to under dist/ (packaging/F42). Skills are compiled, so only their SKILL.md is required. */
const COPIES = [
  ["01-intent", "docs/intent"],
  ["02-requirements", "docs/requirements"],
  ["03-architecture", "docs/architecture"],
  ["06-defects", "docs/defects"],
  ["kaal", "kaal"],
  ["04-test/package-check", "test/package-check"],
  ["04-test/boundary-check", "test/boundary-check"]
];
/** A file that is a script by its name. */
const SCRIPT = /\.(mjs|cjs|js|ts|sh|ps1|py)$/i;
const NUMBERED = ["00-changes", "01-intent", "02-requirements", "03-architecture", "04-test", "05-src", "06-defects"];
const SUBFOLDERS = {
  "02-requirements": ["functional", "non-functional"],
  "04-test": ["package-check", "boundary-check"]
};
/** Subfolders that are allowed and optional. engineering-check holds non-shipped Engineering Cases and never reaches dist/ (packaging/F52). */
const OPTIONAL_SUBFOLDERS = {
  "04-test": ["engineering-check"]
};
/** Root folders that are not part of the numbered set but belong in the layout. */
const ROOT_FOLDERS = new Set(["kaal", "dist", "node_modules"]);
/** What npm delivers from the root whatever `files` says. */
const NPM_ROOT = /^(package\.json|README(\..*)?|LICEN[CS]E(\..*)?)$/i;

/** The licences a LICENSE text can be recognised as. A text naming none is not judged. */
const FAMILIES = [
  ["MIT", /\bMIT License\b|Permission is hereby granted, free of charge/i],
  ["ISC", /\bISC License\b/i],
  ["Apache-2.0", /Apache License/i],
  ["BSD", /\bBSD\b.*License|Redistribution and use in source and binary forms/i],
  ["AGPL", /GNU AFFERO GENERAL PUBLIC LICENSE/i],
  ["LGPL", /GNU LESSER GENERAL PUBLIC LICENSE/i],
  ["GPL", /GNU GENERAL PUBLIC LICENSE/i],
  ["MPL", /Mozilla Public License/i],
  ["Unlicense", /This is free and unencumbered software/i]
];
/** Families with one text, so a family match is a full match. GPL, LGPL, AGPL, BSD and MPL have versions or variants a family match cannot tell apart. */
const SINGLE = new Set(["MIT", "ISC", "Unlicense", "Apache-2.0"]);
const familyOf = (id) => FAMILIES.map(([f]) => f).find((f) => id.toUpperCase().startsWith(f.toUpperCase()));

/** Directory entries by name; a missing or unreadable directory throws. */
async function entries(path) {
  return JSON.parse(await node(`console.log(JSON.stringify(fs.readdirSync(".",{withFileTypes:true}).map(e=>({name:e.name,dir:e.isDirectory(),link:e.isSymbolicLink()}))))`, path));
}
const present = async (path) => (await kind(path)) !== "missing";

/** A scratch directory for a build, removed afterwards. */
async function scratch(use, cwd) {
  const root = await node(`console.log(fs.mkdtempSync(path.join(os.tmpdir(),"kaal-structure-")))`, cwd);
  try {
    return await use(root);
  } finally {
    await node(`fs.rmSync(${JSON.stringify(root)},{recursive:true,force:true})`, cwd);
  }
}

/** Every file below `base/rel`, `/`-separated; a link anywhere is recorded as refused, never followed. */
async function walk(base, rel, files, dirs, refused) {
  for (const e of await entries(join(base, rel))) {
    const p = `${rel}/${e.name}`;
    if (e.link) refused.push(p);
    else if (e.dir) {
      dirs.add(p);
      await walk(base, p, files, dirs, refused);
    } else files.push(p);
  }
}

const safe = (p) => typeof p === "string" && p !== "" && !p.startsWith("/") && !/^[A-Za-z]:/.test(p) && !p.split("/").some((s) => s === ".." || s === "" || s === ".");

export async function checkStructure(dir, { packed, build } = {}) {
  const findings = [];
  const add = (k, path) => findings.push({ kind: k, path });
  const unknown = (path, why) => ({ result: "unknown", findings: [...findings, { kind: why, path }] });
  try {
    if ((await kind(dir)) !== "directory") return unknown(".", "unreadable");
    if (!Array.isArray(packed) || typeof build !== "function") return unknown(".", "unreadable");
    const pack = packed.map((p) => String(p).replaceAll("\\", "/"));
    for (const p of pack) if (!safe(p)) add("refused-path", p);

    const root = await entries(dir);
    const folders = root.filter((e) => e.dir && !e.name.startsWith("."));
    const numbered = folders.filter((e) => /^\d\d-/.test(e.name)).map((e) => e.name);
    const stray = folders.filter((e) => !/^\d\d-/.test(e.name) && !ROOT_FOLDERS.has(e.name) && e.name !== "scripts");
    if (numbered.length === 0 || stray.length > 0) {
      return findings.length ? { result: "unknown", findings } : { result: "not-in-layout", findings: stray.map((e) => ({ kind: "not-in-layout", path: e.name })) };
    }

    // Links are never followed: a link below any judged tree is refused.
    const files = [];
    const dirs = new Set();
    const refused = [];
    for (const top of [...numbered, ...["kaal", "dist"].filter((n) => folders.some((e) => e.name === n))]) {
      dirs.add(top);
      await walk(dir, top, files, dirs, refused);
    }
    for (const e of root) if (e.link) refused.push(e.name);
    for (const p of refused) add("refused-path", p);
    if (findings.some((f) => f.kind === "refused-path")) return { result: "unknown", findings };

    // The numbered folders: all seven, each number once, nothing else.
    for (const n of NUMBERED) if (!numbered.includes(n)) add("missing-folder", n);
    for (const n of numbered) {
      if (NUMBERED.includes(n)) continue;
      add(NUMBERED.some((m) => m.slice(0, 2) === n.slice(0, 2)) ? "duplicate-number" : "unknown-folder", n);
    }
    for (const [top, subs] of Object.entries(SUBFOLDERS)) {
      if (numbered.includes(top)) for (const s of subs) if (!dirs.has(`${top}/${s}`)) add("missing-folder", `${top}/${s}`);
    }
    for (const [top, subs] of Object.entries(SUBFOLDERS)) {
      const known = new Set([...subs, ...(OPTIONAL_SUBFOLDERS[top] ?? [])]);
      for (const d of dirs) if (d.startsWith(`${top}/`) && !d.slice(top.length + 1).includes("/") && !known.has(d.slice(top.length + 1))) add("unknown-folder", d);
    }
    if (root.some((e) => e.dir && e.name === "scripts")) add("misplaced-script", "scripts");
    for (const e of root) if (!e.dir && !e.link && SCRIPT.test(e.name)) add("misplaced-script", e.name);

    // 05-src: the Agent layer and the skills, whose scripts live inside their skill.
    if (numbered.includes("05-src")) {
      if (!files.includes("05-src/AGENTS.md")) add("missing-file", "05-src/AGENTS.md");
      for (const e of await entries(join(dir, "05-src"))) {
        if (e.name === "scripts") add("misplaced-script", "05-src/scripts");
        else if (e.name === "agent") add("agent-folder", "05-src/agent");
        else if (e.dir && e.name !== "skills") add("unknown-folder", `05-src/${e.name}`);
        else if (!e.dir && e.name !== "AGENTS.md") add(SCRIPT.test(e.name) ? "misplaced-script" : "unknown-file", `05-src/${e.name}`);
      }
      if (dirs.has("05-src/skills")) {
        for (const e of await entries(join(dir, "05-src/skills"))) {
          if (e.dir && !files.includes(`05-src/skills/${e.name}/SKILL.md`)) add("skill-without-skill-md", `05-src/skills/${e.name}`);
          else if (!e.dir && !e.name.startsWith(".")) add(SCRIPT.test(e.name) ? "misplaced-script" : "unknown-file", `05-src/skills/${e.name}`);
        }
      }
    }

    // kaal/: <Name>.md Extension Nodes, and <capability>/ folders with README.md and <command>.md.
    if (dirs.has("kaal")) {
      for (const e of await entries(join(dir, "kaal"))) {
        if (e.name.startsWith(".")) continue;
        if (!e.dir) {
          if (!/^[A-Z][A-Za-z0-9]*\.md$/.test(e.name)) add("kaal-shape", `kaal/${e.name}`);
        } else {
          const sub = `kaal/${e.name}`;
          if (!/^[a-z][a-z0-9-]*$/.test(e.name)) add("kaal-shape", sub);
          else {
            for (const s of await entries(join(dir, sub))) if (s.dir || (!s.name.startsWith(".") && !s.name.endsWith(".md"))) add("kaal-shape", `${sub}/${s.name}`);
            if (!files.includes(`${sub}/README.md`)) add("kaal-shape", `${sub}/README.md`);
          }
        }
      }
    }

    // package.json: only dist ships; the licence field and the LICENSE file agree.
    const pkg = (await present(join(dir, "package.json"))) ? JSON.parse((await readFile(join(dir, "package.json"))).toString("utf8")) : undefined;
    if (!pkg) add("missing-file", "package.json");
    else {
      if (!Array.isArray(pkg.files) || pkg.files.length !== 1 || pkg.files[0] !== "dist") add("files-not-dist", "package.json");
      if (typeof pkg.license !== "string" || pkg.license === "") add("license", "package.json");
      else if (!(await present(join(dir, "LICENSE")))) add("license", "LICENSE");
      else {
        const text = (await readFile(join(dir, "LICENSE"))).toString("utf8");
        const named = FAMILIES.filter(([, re]) => re.test(text)).map(([f]) => f);
        const family = familyOf(pkg.license);
        if (family && named.length > 0 && !named.includes(family)) add("license", "LICENSE");
        else if (!family || named.length === 0 || !SINGLE.has(family)) add("license-unjudged", "LICENSE"); // agreement cannot be established, so it is not certified
      }
    }
    if (!(await present(join(dir, "README.md")))) add("missing-file", "README.md");
    if (!(await present(join(dir, "AGENTS.md")))) add("missing-file", "AGENTS.md");

    // dist/: built from the other folders, reproducible, and equal to what is on disk.
    const onDisk = await read(join(dir, "dist"));
    await scratch(async (tmp) => {
      const [a, b] = [join(tmp, "a"), join(tmp, "b")];
      await node(`fs.mkdirSync(${JSON.stringify(a)});fs.mkdirSync(${JSON.stringify(b)})`, dir);
      await build(dir, a);
      await build(dir, b);
      const [first, second] = [await read(join(a, "dist")), await read(join(b, "dist"))];
      const names = (m) => Object.keys(m);
      for (const n of new Set([...names(first), ...names(second)])) {
        if (!first[n] || !second[n] || !first[n].equals(second[n])) add("dist-not-reproducible", `dist/${n}`);
      }
      for (const n of new Set([...names(first), ...names(onDisk)])) {
        if (!onDisk[n]) add("dist-copy-missing", `dist/${n}`);
        else if (!first[n]) add("dist-not-reproducible", `dist/${n}`);
        else if (!first[n].equals(onDisk[n])) add(n.startsWith("skills/") ? "dist-not-reproducible" : "dist-copy-differs", `dist/${n}`);
      }
    }, dir);

    // Source copies, judged independently of the supplied build, so a build that omits one cannot certify it.
    const expected = new Set();
    const copyOf = (from, to, src) => {
      for (const [n, bytes] of Object.entries(src)) {
        const at = to === "" ? n : `${to}/${n}`;
        expected.add(at);
        if (!onDisk[at]) add("dist-copy-missing", `dist/${at}`);
        else if (!onDisk[at].equals(bytes)) add("dist-copy-differs", `dist/${at}`);
      }
    };
    if (files.includes("05-src/AGENTS.md")) copyOf("05-src", "", { "AGENTS.md": await readFile(join(dir, "05-src/AGENTS.md")) });
    for (const [from, to] of COPIES) if (dirs.has(from)) copyOf(from, to, await read(join(dir, from)));
    // Skills: everything but the compiled scripts is a copy (SKILL.md, references/).
    if (dirs.has("05-src/skills")) {
      const skills = await read(join(dir, "05-src/skills"));
      copyOf("05-src/skills", "skills", Object.fromEntries(Object.entries(skills).filter(([n]) => !/(^|\/)scripts\//.test(n))));
    }

    // The other direction: nothing in dist/ that no source accounts for, but the compiled scripts inside a skill.
    for (const n of Object.keys(onDisk)) {
      const compiled = /^skills\/([^/]+)\/scripts\//.exec(n);
      if (!expected.has(n) && !(compiled && files.includes(`05-src/skills/${compiled[1]}/SKILL.md`))) add("dist-copy-extra", `dist/${n}`);
    }

    // The pack: dist/ and npm's fixed root files, exactly.
    const set = new Set(pack);
    for (const p of pack) if (!p.startsWith("dist/") && !NPM_ROOT.test(p) && safe(p)) add("packed-outside-dist", p);
    for (const p of pack) if (p.startsWith("dist/") && safe(p) && !(p.slice(5) in onDisk)) add("packed-not-in-dist", p);
    for (const f of ["package.json", "README.md", "LICENSE"]) if ((await present(join(dir, f))) && !set.has(f)) add("root-not-packed", f);
    for (const n of Object.keys(onDisk)) if (!set.has(`dist/${n}`)) add("dist-not-packed", `dist/${n}`);

    if (findings.some((f) => f.kind === "refused-path")) return { result: "unknown", findings };
    const failed = findings.some((f) => f.kind !== "license-unjudged");
    return { result: failed ? "failed" : findings.length ? "unknown" : "verified", findings };
  } catch (e) {
    return unknown(".", "unreadable");
  }
}
