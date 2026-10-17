#!/usr/bin/env node
// kaal-graph: check and navigate the Edges of the Nodes under one or more directories.
//
// Usage: graph.mjs check <dir>...
//        graph.mjs out <id> <dir>...
//        graph.mjs in <id> <dir>...
//        graph.mjs named <name> <dir>...
//        graph.mjs resolve <name> <id> <dir>...
// Files are read through kaal-hosting; Core decides what is a Node and its identity.
// Exits 0 on success, 1 when check reports findings, 2 on misuse, unreadable input or
// a Node not found.
import { identify } from "kaal-core";
import { read } from "kaal-hosting";
import { Graph } from "./edges.mjs";

const USAGE = "usage: graph.mjs check <dir>... | graph.mjs out <id> <dir>... | graph.mjs in <id> <dir>... | graph.mjs named <name> <dir>... | graph.mjs resolve <name> <id> <dir>...";

/** One Node per line: id, name, then its type or `-`. */
const line = (n) => `${n.id}\t${n.name}\t${n.type ? `${n.type.name} ${n.type.id}` : "-"}`;

async function load(dirs) {
  const graph = new Graph();
  const refused = [];
  for (const dir of dirs) {
    const files = await read(dir);
    for (const path of Object.keys(files).sort()) {
      // Only files that begin like frontmatter claim to be Nodes; whether they are is Core's call.
      if (!path.endsWith(".md") || !Buffer.from(files[path].subarray(0, 3)).equals(Buffer.from("---"))) continue;
      try {
        graph.add(identify(files[path]));
      } catch (e) {
        refused.push(`${dir}/${path}: ${e.message}`);
      }
    }
  }
  return { graph, refused };
}

async function main([command, ...rest]) {
  if (command === "check" && rest.length) {
    const { graph, refused } = await load(rest);
    const findings = [...refused, ...graph.check()];
    for (const f of findings) console.log(f);
    return findings.length ? 1 : 0;
  }
  if ((command === "out" || command === "in") && rest.length >= 2) {
    const [id, ...dirs] = rest;
    const { graph } = await load(dirs);
    if (!graph.node(id)) {
      console.error(`no Node with id ${id}`);
      return 2;
    }
    const other = command === "out" ? "target" : "source";
    for (const e of command === "out" ? graph.out(id) : graph.in(id)) console.log(`${e.type.name}\t${e.type.id}\t${e[other].name}\t${e[other].id}`);
    return 0;
  }
  if (command === "named" && rest.length >= 2) {
    const [name, ...dirs] = rest;
    const { graph } = await load(dirs);
    const found = graph.named(name);
    if (found.length === 0) {
      console.error(`no Node is named ${name}`);
      return 2;
    }
    for (const { id } of found) console.log(line(graph.node(id)));
    return 0;
  }
  if (command === "resolve" && rest.length >= 3) {
    const [name, id, ...dirs] = rest;
    const { graph } = await load(dirs);
    const node = graph.resolve({ name, id });
    if (!node) {
      const present = graph.node(id);
      console.error(present ? `Node ${id} is named ${present.name}, not ${name}` : `no Node with id ${id}`);
      return 2;
    }
    console.log(line(node));
    return 0;
  }
  console.error(USAGE);
  return 2;
}

try {
  process.exitCode = await main(process.argv.slice(2));
} catch (e) {
  console.error(`kaal-graph: ${e.message}`);
  process.exitCode = 2;
}
