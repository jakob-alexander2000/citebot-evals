export type CaseKind = "grounded" | "adversarial";

export type VerificationSummary = "grounded" | "mixed" | "ungrounded";

export type CaseExpect = {
  /** At least one of these substrings must appear in the answer (case-insensitive). */
  answerIncludesAny?: string[];
  /** None of these may appear in the answer (case-insensitive). */
  answerMustNotInclude?: string[];
  /** At least one citation.source must match one of these (substring). */
  citationSourcesAny?: string[];
  minCitations?: number;
  /** Soft cap when refusal is the goal (unused citations ok). */
  maxCitationsForRefuseOk?: number;
  verificationSummariesAny?: VerificationSummary[];
  /** Answer should refuse / say not in handbook. */
  mustRefuse?: boolean;
};

export type EvalCase = {
  id: string;
  kind: CaseKind;
  question: string;
  expect: CaseExpect;
};

export type SuiteFile = {
  suite: string;
  corpus: string;
  description: string;
  cases: EvalCase[];
};

export type Citation = {
  id: string;
  source: string;
  title: string;
  snippet: string;
  score: number;
};

export type EvidenceClaim = {
  claim: string;
  verdict: "pass" | "fail" | "unsupported";
  evidence: string;
  citationId?: string;
};

export type Verification = {
  summary: VerificationSummary;
  claims: EvidenceClaim[];
};

export type ModelResponse = {
  answer: string;
  citations: Citation[];
  verification?: Verification;
  error?: string;
};

export type CheckResult = {
  name: string;
  ok: boolean;
  detail: string;
};

export type CaseResult = {
  id: string;
  kind: CaseKind;
  question: string;
  pass: boolean;
  checks: CheckResult[];
  answerPreview: string;
  citationSources: string[];
  verificationSummary?: VerificationSummary;
  error?: string;
  latencyMs: number;
};

export type RunReport = {
  suite: string;
  provider: string;
  target: string;
  startedAt: string;
  finishedAt: string;
  passed: number;
  failed: number;
  total: number;
  score: string;
  results: CaseResult[];
};
