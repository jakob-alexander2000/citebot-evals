import type { ModelResponse } from "../types.js";

export type CiteBotProviderOptions = {
  baseUrl: string;
  timeoutMs?: number;
};

/**
 * Live CiteBot HTTP provider.
 * POST {baseUrl}/api/chat  body: { question }
 * Response: { answer, citations, verification }
 */
export async function askCiteBot(
  question: string,
  opts: CiteBotProviderOptions,
): Promise<ModelResponse> {
  const url = `${opts.baseUrl.replace(/\/$/, "")}/api/chat`;
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    opts.timeoutMs ?? 60_000,
  );

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({ question }),
      signal: controller.signal,
    });

    const text = await res.text();
    let json: unknown;
    try {
      json = JSON.parse(text);
    } catch {
      return {
        answer: "",
        citations: [],
        error: `Non-JSON response (${res.status}): ${text.slice(0, 200)}`,
      };
    }

    if (!res.ok) {
      const err =
        json &&
        typeof json === "object" &&
        typeof (json as { error?: unknown }).error === "string"
          ? (json as { error: string }).error
          : `HTTP ${res.status}`;
      return { answer: "", citations: [], error: err };
    }

    const row = json as {
      answer?: string;
      citations?: ModelResponse["citations"];
      verification?: ModelResponse["verification"];
    };

    return {
      answer: row.answer ?? "",
      citations: Array.isArray(row.citations) ? row.citations : [],
      verification: row.verification,
    };
  } catch (err) {
    const message =
      err instanceof Error
        ? err.name === "AbortError"
          ? "Request timed out"
          : err.message
        : "Unknown fetch error";
    return { answer: "", citations: [], error: message };
  } finally {
    clearTimeout(timeout);
  }
}
