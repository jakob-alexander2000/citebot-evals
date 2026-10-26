import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { SuiteFile } from "./types.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

export function loadSuite(path = join(root, "cases", "handbook.json")): SuiteFile {
  const raw = readFileSync(path, "utf8");
  const parsed = JSON.parse(raw) as SuiteFile;
  if (!parsed.cases?.length) {
    throw new Error(`Suite has no cases: ${path}`);
  }
  return parsed;
}

export function suiteRoot(): string {
  return root;
}
