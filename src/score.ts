import type {
  CaseExpect,
  CheckResult,
  EvalCase,
  ModelResponse,
} from "./types.js";

const REFUSAL_MARKERS = [
  "do not have",
  "don't have",
  "not in the handbook",
  "not covered",
  "handbook does not",
  "no information",
  "i don't know",
  "i do not know",
  "cannot find",
  "can't find",
  "not mentioned",
  "doesn't mention",
  "does not mention",
  "insufficient",
  "no mention",
  "outside the handbook",
  "not stated",
];

function includesAny(haystack: string, needles: string[]): boolean {
  const h = haystack.toLowerCase();
  return needles.some((n) => h.includes(n.toLowerCase()));
}

function includesNone(haystack: string, needles: string[]): boolean {
  return !includesAny(haystack, needles);
}

function looksLikeRefusal(answer: string): boolean {
  return includesAny(answer, REFUSAL_MARKERS);
}

export function scoreCase(
  c: EvalCase,
  response: ModelResponse,
): CheckResult[] {
  const checks: CheckResult[] = [];
  const expect: CaseExpect = c.expect;
  const answer = response.answer || "";
  const citations = response.citations || [];
  const sources = citations.map((x) => x.source).join(" | ");

  if (response.error) {
    checks.push({
      name: "response",
      ok: false,
      detail: response.error,
    });
    return checks;
  }

  if (!answer.trim()) {
    checks.push({
      name: "answer-nonempty",
      ok: false,
      detail: "Empty answer",
    });
    return checks;
  }

  if (expect.answerIncludesAny?.length) {
    const ok = includesAny(answer, expect.answerIncludesAny);
    checks.push({
      name: "answer-includes",
      ok,
      detail: ok
        ? `matched one of: ${expect.answerIncludesAny.join(" | ")}`
        : `missing all of: ${expect.answerIncludesAny.join(" | ")}`,
    });
  }

  if (expect.answerMustNotInclude?.length) {
    const ok = includesNone(answer, expect.answerMustNotInclude);
    checks.push({
      name: "answer-excludes",
      ok,
      detail: ok
        ? "no forbidden substrings"
        : `hit forbidden: ${expect.answerMustNotInclude.filter((n) => includesAny(answer, [n])).join(", ")}`,
    });
  }

  if (typeof expect.minCitations === "number") {
    const ok = citations.length >= expect.minCitations;
    checks.push({
      name: "min-citations",
      ok,
      detail: `${citations.length} citation(s); need ≥ ${expect.minCitations}`,
    });
  }

  if (expect.citationSourcesAny?.length) {
    const ok = expect.citationSourcesAny.some((want) =>
      citations.some((c) =>
        c.source.toLowerCase().includes(want.toLowerCase()),
      ),
    );
    checks.push({
      name: "citation-source",
      ok,
      detail: ok
        ? `sources: ${sources || "(none)"}`
        : `wanted one of [${expect.citationSourcesAny.join(", ")}]; got [${sources || "none"}]`,
    });
  }

  if (expect.verificationSummariesAny?.length && response.verification) {
    const summary = response.verification.summary;
    const ok = expect.verificationSummariesAny.includes(summary);
    checks.push({
      name: "verification-summary",
      ok,
      detail: `summary=${summary}; allowed=${expect.verificationSummariesAny.join("|")}`,
    });
  }

  if (expect.mustRefuse) {
    const ok = looksLikeRefusal(answer);
    checks.push({
      name: "refusal",
      ok,
      detail: ok
        ? "answer looks like a handbook refusal"
        : "expected refusal / not-in-handbook language",
    });
  }

  if (checks.length === 0) {
    checks.push({
      name: "noop",
      ok: true,
      detail: "no expectations configured",
    });
  }

  return checks;
}

export function casePassed(checks: CheckResult[]): boolean {
  return checks.length > 0 && checks.every((c) => c.ok);
}
