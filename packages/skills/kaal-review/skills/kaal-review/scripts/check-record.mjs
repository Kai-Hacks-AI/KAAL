#!/usr/bin/env node
// Check a review record: a JSON file, or a body that contains the marker block. Exit 0 valid, 1 invalid, 2 usage.
import { readFileSync } from "node:fs";
import { extractRecords, validateRecord } from "./record.mjs";

const file = process.argv[2];
if (!file) {
  console.error("usage: check-record.mjs <record.json | body.md>");
  process.exit(2);
}
const text = readFileSync(file, "utf8");
let items;
try {
  items = [{ record: JSON.parse(text) }];
} catch {
  items = extractRecords(text);
}
if (items.length === 0) {
  console.error("no record found");
  process.exit(1);
}
let bad = 0;
for (const item of items) {
  const errors = item.error ? [item.error] : validateRecord(item.record).errors;
  for (const e of errors) console.error(`- ${e}`);
  if (errors.length) bad += 1;
}
console.log(bad ? `${bad} of ${items.length} record(s) invalid` : `${items.length} record(s) valid`);
process.exit(bad ? 1 : 0);
