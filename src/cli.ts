#!/usr/bin/env node
import { join } from "node:path";
import { loadSuite, suiteRoot } from "./cases.js";
import { askCiteBot } from "./providers/citebot.js";
import { askFixture, loadFixtures } from "./providers/fixture.js";
import { formatTable, writeReports } from "./report.js";
import { casePassed, scoreCase } from "./score.js";
import type { CaseResult, RunReport } from "./types.js";

function arg(flag: string): string | undefined {
  const i = process.argv.indexOf(flag);
  if (i >= 0 && process.argv[i + 1] && !process.argv[i + 1]!.startsWith("-")) {
    return process.argv[i + 1];
  }
  return undefined;
}

function has(flag: string): boolean {
  return process.argv.includes(flag);
}

function usage(): never {
  console.log(`citebot-evals — narrow handbook eval suite

Usage:
  npm run eval -- [options]

Options:
  --provider <citebot|fixture>   Default: fixture (no API keys). Use citebot for live scoring.
  --base-url <url>               CiteBot origin (default: https://citebot-chi.vercel.app)
  --limit <n>                    Run only the first n cases
  --case <id>                    Run a single case id
  --write-report                 Write reports/latest.{json,md} and a stamped copy
  --help                         Show this help

Examples:
  npm run eval
  npm run eval -- --provider citebot --write-report
  npm run eval -- --provider fixture --case adv-office-dog
`);
  process.exit(0);
}

async function main() {
  if (has("--help") || has("-h")) usage();

  const provider = (arg("--provider") || "fixture").toLowerCase();
  const baseUrl =
    arg("--base-url") ||
    process.env.CITEBOT_BASE_URL ||
    "https://citebot-chi.vercel.app";
  const limitRaw = arg("--limit");
  const limit = limitRaw ? Number(limitRaw) : undefined;
  const only = arg("--case");
  const writeReport = has("--write-report");

  if (provider !== "citebot" && provider !== "fixture") {
    console.error(`Unknown provider: ${provider}`);
    process.exit(2);
  }

  const suite = loadSuite();
  let cases = suite.cases;
  if (only) {
    cases = cases.filter((c) => c.id === only);
    if (!cases.length) {
      console.error(`No case with id "${only}"`);
      process.exit(2);
    }
  }
  if (limit && Number.isFinite(limit)) {
    cases = cases.slice(0, Math.max(0, limit));
  }

  const fixtures =
    provider === "fixture" ? loadFixtures() : undefined;

  console.log(`Suite:     ${suite.suite}`);
  console.log(`Provider:  ${provider}`);
  console.log(
    `Target:    ${provider === "citebot" ? baseUrl : "fixtures/sample-run.json"}`,
  );
  console.log(`Cases:     ${cases.length}`);
  console.log("");

  const startedAt = new Date().toISOString();
  const results: CaseResult[] = [];

  let consecutiveProviderErrors = 0;
  for (const c of cases) {
    const t0 = Date.now();
    const response =
      provider === "citebot"
        ? await askCiteBot(c.question, { baseUrl })
        : askFixture(c.id, fixtures!);
    const latencyMs = Date.now() - t0;
    const checks = scoreCase(c, response);
    const pass = casePassed(checks) && !response.error;
    const result: CaseResult = {
      id: c.id,
      kind: c.kind,
      question: c.question,
      pass,
      checks,
      answerPreview: (response.answer || "").replace(/\s+/g, " ").slice(0, 140),
      citationSources: (response.citations || []).map((x) => x.source),
      verificationSummary: response.verification?.summary,
      error: response.error,
      latencyMs,
    };
    results.push(result);
    const mark = pass ? "PASS" : "FAIL";
    console.log(`[${mark}] ${c.id} (${latencyMs}ms)`);
    if (!pass) {
      for (const ch of checks.filter((x) => !x.ok)) {
        console.log(`       - ${ch.name}: ${ch.detail}`);
      }
      if (response.error) console.log(`       - error: ${response.error}`);
    }

    if (provider === "citebot" && response.error) {
      consecutiveProviderErrors += 1;
      const quota =
        /429|Too Many Requests|quota|rate.?limit/i.test(response.error);
      if (quota || consecutiveProviderErrors >= 3) {
        console.log("");
        console.log(
          quota
            ? "Aborting live run: CiteBot upstream rate-limited / quota exceeded."
            : "Aborting live run: repeated provider errors.",
        );
        console.log(
          "The default offline check needs no model: npm run eval -- --provider fixture",
        );
        break;
      }
    } else {
      consecutiveProviderErrors = 0;
    }
  }

  const finishedAt = new Date().toISOString();
  const passed = results.filter((r) => r.pass).length;
  const failed = results.length - passed;
  const score = `${passed}/${results.length} (${results.length ? Math.round((passed / results.length) * 100) : 0}%)`;

  console.log("");
  console.log(formatTable(results));
  console.log("");
  console.log(`Score: ${score}`);

  const report: RunReport = {
    suite: suite.suite,
    provider,
    target:
      provider === "citebot" ? baseUrl : "fixtures/sample-run.json",
    startedAt,
    finishedAt,
    passed,
    failed,
    total: results.length,
    score,
    results,
  };

  if (writeReport) {
    const { mdPath } = writeReports(report, join(suiteRoot(), "reports"));
    console.log(`Wrote report: ${mdPath}`);
  }

  // Fixture mode is the continuous integration gate: must be green.
  // Live CiteBot is informational (model drift) unless --strict.
  if (provider === "fixture" && failed > 0) process.exit(1);
  if (provider === "citebot" && has("--strict") && failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
