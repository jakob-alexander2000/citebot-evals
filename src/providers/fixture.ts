import { readFileSync } from "node:fs";
import { join } from "node:path";
import { suiteRoot } from "../cases.js";
import type { ModelResponse } from "../types.js";

export type FixtureFile = {
  description: string;
  responses: Record<string, ModelResponse>;
};

export function loadFixtures(
  path = join(suiteRoot(), "fixtures", "sample-run.json"),
): FixtureFile {
  return JSON.parse(readFileSync(path, "utf8")) as FixtureFile;
}

export function askFixture(
  caseId: string,
  fixtures: FixtureFile,
): ModelResponse {
  const hit = fixtures.responses[caseId];
  if (!hit) {
    return {
      answer: "",
      citations: [],
      error: `No fixture response for case id "${caseId}"`,
    };
  }
  return hit;
}
