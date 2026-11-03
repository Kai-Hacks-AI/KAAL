#!/usr/bin/env node
// Collect review records from files (bodies or JSON) and print the analysis as JSON. Observations only.
import { readFileSync } from "node:fs";
import { analyse, extractRecords } from "./record.mjs";

const files = process.argv.slice(2);
if (files.length === 0) {
  console.error("usage: collect.mjs <file>...   (each a body containing the marker, or a record)");
  process.exit(2);
}
const items = [];
for (const source of files) {
  const text = readFileSync(source, "utf8");
  let parsed;
  try {
    parsed = [{ record: JSON.parse(text) }];
  } catch {
    parsed = extractRecords(text);
  }
  for (const p of parsed) items.push({ source, ...p });
}
console.log(JSON.stringify(analyse(items), null, 2));
