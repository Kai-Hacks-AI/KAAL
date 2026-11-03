#!/usr/bin/env node
// Engineering's Release engine, its steps (engineering/C12). The workflow supplies facts and acts on
// the exit status: 0 verified, 1 failed, 2 cannot judge (unknown). Every host operation goes
// through Hosting; the registry is reached through npm, and through `attest`, the one read npm has
// no command for (an attestation bundle, from the registry's own URL).
//
//   run.mjs pack    --package <name> --out <dir> --commit <sha> --run <id>
//   run.mjs bind    --record <release.json> --id <artifact-id> --digest <sha256> --out <dir>
//   run.mjs publish --record <release.json> --tarball <file> --commit <sha> --run <id>
//   run.mjs accept  --record <release.json> --run <id> --out <dir>
//
// Each step writes summary.md into --out (publish: next to nothing) for the run's summary.
import { basename, dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { execute, initialize, readFile } from "kaal-hosting";
import { integrity, sha256 } from "kaal-testing/acceptance";
import { pack as packOnce, workspaces as listWorkspaces } from "../delivery/pack.mjs";
import { EXIT, acceptance, bind, firstSteps, locate, publishable, readiness, record, verification, weakest } from "./release.mjs";

const QUIET = { npm_config_audit: "false", npm_config_fund: "false", npm_config_update_notifier: "false" };

/** npm through Hosting, by default: (args, cwd, env?) → { status, stdout, stderr }. */
export const npm = (args, cwd, env) => execute("npm", args, { cwd, env: { ...process.env, ...QUIET, ...env } });

/** The registry's attestation bundle at `url`, decoded to in-toto statements. Only npm's registry is read. */
export async function attest(url) {
  if (!String(url).startsWith("https://registry.npmjs.org/-/npm/v1/attestations/")) throw new Error(`not the npm registry's attestation URL: ${url}`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url}: ${res.status}`);
  const { attestations = [] } = await res.json();
  return attestations.map((a) => JSON.parse(Buffer.from(a.bundle.dsseEnvelope.payload, "base64").toString("utf8")));
}

const json = (value) => Buffer.from(`${JSON.stringify(value, null, 2)}\n`);
const parse = (s) => JSON.parse(s.slice(s.search(/[[{"]/)));

/** Published versions of `name`, or null when the registry does not know it. Anything else cannot be judged. */
async function versions(name, cwd, run) {
  const r = await run(["view", name, "versions", "--json"], cwd);
  if (r.status !== 0) {
    if (/E404|404 Not Found/.test(r.stderr + r.stdout)) return null;
    throw new Error(`npm view ${name} failed: ${r.stderr.trim()}`);
  }
  const v = parse(r.stdout);
  return Array.isArray(v) ? v : [v];
}

/** A fresh consumer in `dir` (missing or empty), with its own HOME and npm cache; installs `spec` and runs the installed npm test. */
async function consume(name, spec, dir, run) {
  await initialize(dir, { "package.json": json({ name: "kaal-release-consumer", version: "0.0.0", private: true }) });
  const env = { HOME: join(dir, ".home"), USERPROFILE: join(dir, ".home"), npm_config_cache: join(dir, ".cache") };
  const i = await run(["install", spec], dir, env);
  if (i.status !== 0) return { result: "failed", cause: `npm install ${spec} failed: ${i.stderr.trim().split("\n").at(-1)}` };
  // The cases the installed candidate itself declares, read from its own test/verify.json.
  let declared;
  try {
    declared = JSON.parse((await readFile(join(dir, "node_modules", ...name.split("/"), "test", "verify.json"))).toString("utf8")).cases;
  } catch {
    declared = undefined;
  }
  const t = await run(["explore", name, "--", "npm", "test"], dir, env);
  return verification(t.stdout, name, { status: t.status, declared });
}

const NOT_RUN = {
  packaging: { result: "not run", reason: "kaal-packaging is not on main yet (engineering/C12, Decision 3)" },
  conformance: { result: "not run", reason: "engineering/C7's consumer-verification conformance is not on main yet" },
};

/** F28–F32: readiness, source tests, one pack, installed verification, and the release record. */
export async function packStep({ name, root, out, commit, run: runId, npm: run = npm }) {
  const lines = [`## Release: ${name}`, ""];
  const done = async (result, rec, extra = []) => {
    await initialize(join(out, "report"), { "summary.md": Buffer.from([...lines, ...extra, "", `Result: **${result}**`, ""].join("\n")) });
    if (rec) await initialize(join(out, "record"), { "release.json": json(rec) });
    return { result, record: rec };
  };
  const ws = await listWorkspaces(root);
  const at = locate(ws, name);
  if (at.findings.length) return done("failed", null, at.findings.map((f) => `- ${f}`));
  const manifest = JSON.parse((await readFile(join(at.workspace.location, "package.json"))).toString("utf8"));
  const registry = { [manifest.name]: await versions(manifest.name, root, run) };
  for (const dep of Object.keys(manifest.dependencies ?? {})) registry[dep] = await versions(dep, root, run);
  const ready = readiness({ manifest, directory: relative(root, at.workspace.location).split("\\").join("/"), registry });
  lines.push(`Path: \`${ready.path}\``, "");
  if (ready.findings.length) return done("failed", null, ["Not ready:", ...ready.findings.map((f) => `- ${f}`)]);
  const source = await run(["test"], at.workspace.location);
  if (source.status !== 0) return done("failed", null, [`Source npm test exited ${source.status}.`]);
  const packed = (await packOnce([at.workspace], join(out, "artifact")))[name];
  const installed = await consume(name, packed.tarball, join(out, "consumer"), run);
  const checks = { installed, ...NOT_RUN };
  const rec = record({ manifest, commit, run: runId, tarball: basename(packed.tarball), sha256: packed.sha256, integrity: packed.integrity, path: ready.path, checks });
  lines.push(`Tarball \`${rec.tarball}\` from \`${commit}\``, "", `SHA-256 \`${rec.sha256}\``, "", `Integrity \`${rec.integrity}\``, "");
  for (const [k, c] of Object.entries(checks)) lines.push(`- ${k}: ${c.result}${c.cause ? ` (${c.cause})` : ""}${c.reason ? ` (${c.reason})` : ""}`);
  const result = weakest([installed.result]);
  return done(result, rec, result === "verified" && rec.path === "first" ? ["", firstSteps(rec)] : []);
}

/** F31: binds the uploaded artifact to the record. */
export async function bindStep({ record: rec, id, digest, out }) {
  const b = bind(rec, { id, digest });
  if (b.result === "verified") await initialize(out, { "release.json": json(b.record) });
  return b;
}

/** F33: publishes the downloaded tested tarball, never packing. */
export async function publishStep({ record: rec, tarball, commit, run: runId, npm: run = npm }) {
  const p = publishable(rec, { sha256: await sha256(await readFile(tarball)), run: runId, commit });
  if (p.result !== "verified") return p;
  const r = await run(["publish", tarball, "--access", "public"], dirname(tarball));
  return r.status === 0 ? { result: "verified" } : { result: "failed", cause: `npm publish exited ${r.status}: ${r.stderr.trim().split("\n").at(-1)}` };
}

/** F35: registry acceptance of the released version. */
export async function acceptStep({ record: rec, run: runId, out, npm: run = npm, attest: read = attest }) {
  const spec = `${rec.package}@${rec.version}`;
  const write = async (a) => {
    const text = [`## Registry acceptance: ${spec}`, "", ...a.findings.map((f) => `- ${f}`), "", a.record.provenance ?? "", "", `Result: **${a.result}**`, ""];
    await initialize(join(out, "report"), { "summary.md": Buffer.from(text.join("\n")), "acceptance.json": json(a.record) });
    return a;
  };
  // Every npm command runs in a directory that exists: spawning in a missing cwd fails as ENOENT.
  const work = join(out, "work");
  await initialize(work, {});
  const view = await run(["view", spec, "dist", "--json"], work);
  if (view.status !== 0) return write({ result: "unknown", findings: [`npm view ${spec} failed`], record: rec });
  const dist = parse(view.stdout);
  await initialize(join(out, "registry"), {});
  const p = await run(["pack", spec, "--json", "--pack-destination", join(out, "registry")], work);
  if (p.status !== 0) return write({ result: "unknown", findings: [`npm pack ${spec} failed`], record: rec });
  const bytes = await readFile(join(out, "registry", parse(p.stdout)[0].filename));
  const installed = await consume(rec.package, spec, join(out, "consumer"), run);
  const statements = dist.attestations?.url ? await read(dist.attestations.url) : null;
  return write(acceptance(rec, { run: runId, registry: { sha256: await sha256(bytes), integrity: await integrity(bytes), distIntegrity: dist.integrity }, installed, statements }));
}

function options(argv) {
  const o = {};
  for (let i = 0; i < argv.length; i += 2) {
    if (!argv[i].startsWith("--") || argv[i + 1] === undefined) throw new Error(`usage: run.mjs <step> --name value …`);
    o[argv[i].slice(2)] = argv[i + 1];
  }
  return o;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [step, ...rest] = process.argv.slice(2);
  try {
    const o = options(rest);
    const root = fileURLToPath(new URL("../../", import.meta.url));
    const rec = o.record ? JSON.parse((await readFile(o.record)).toString("utf8")) : undefined;
    const steps = {
      pack: () => packStep({ name: o.package, root, out: o.out, commit: o.commit, run: o.run }),
      bind: () => bindStep({ record: rec, id: o.id, digest: o.digest, out: o.out }),
      publish: () => publishStep({ record: rec, tarball: o.tarball, commit: o.commit, run: o.run }),
      accept: () => acceptStep({ record: rec, run: o.run, out: o.out }),
    };
    if (!steps[step]) throw new Error(`unknown step ${JSON.stringify(step)}: pack, bind, publish or accept`);
    const r = await steps[step]();
    for (const f of r.findings ?? []) console.error(f);
    if (r.cause) console.error(r.cause);
    console.log(`kaal-release ${step}: ${r.result}`);
    process.exit(EXIT[r.result]);
  } catch (e) {
    console.error(`kaal-release: cannot judge: ${e.message}`);
    process.exit(2);
  }
}
