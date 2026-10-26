# citebot-evals

Narrow eval suite for [CiteBot](https://citebot-chi.vercel.app) — grounded handbook Qs vs adversarial / unsupported ones.

This is **not** a giant benchmark clone. It is a fixed 18-case harness a hiring manager can clone, run in under a minute offline, or point at the live CiteBot API.

| Sibling | Role |
|---------|------|
| [citebot](https://github.com/jakob-alexander2000/citebot) | RAG chat + citation chips + verify harness |
| **citebot-evals** (this repo) | Pass/fail table over that product |

## What it measures

| Kind | Intent |
|------|--------|
| **grounded** | Answer must include key handbook facts and cite the right corpus file |
| **adversarial** | Must refuse invented facts (office dog, CEO birthday, salary bands) or correct a false premise (unlimited PTO, Bali remote, U-Bahn commute) |

Optional live path also reads CiteBot’s **verification** summary (`grounded` / `mixed` / `ungrounded`) from the shared verify harness.

**Out of scope (killed):** mega-benchmarks, multi-model vanity bake-offs, Electron.

## Quick start

```bash
npm install
npm run build
npm run eval                 # fixture provider — no API keys
npm run eval -- --write-report
```

Sample offline score line:

```
Score: 18/18 (100%)
```

### Live CiteBot

Hits the deployed demo (or your own base URL). **No Gemini/OpenAI/Anthropic key required on this machine** — CiteBot already holds the model key server-side.

```bash
npm run eval -- --provider citebot --write-report
# optional:
# CITEBOT_BASE_URL=http://localhost:3000 npm run eval -- --provider citebot
```

Add `--strict` to fail the process on live misses (default live run is informational; fixture mode always exits non-zero on fail).

### Providers

| Provider | Needs | Notes |
|----------|-------|-------|
| `fixture` (default) | nothing | Scores `fixtures/sample-run.json` — CI gate |
| `citebot` | network | `POST /api/chat` on CiteBot |

OpenAI / Anthropic adapters are intentionally **not** required. If you add a thin chat wrapper later, keep keys optional via env (see `.env.example`).

## Case set

`cases/handbook.json` — Nordlicht Labs handbook corpus mirrored from CiteBot (`pto-and-leave`, `expense-policy`, `welcome`, `demo-day`, `tools-and-security`).

```bash
npm run eval -- --case adv-office-dog
npm run eval -- --limit 5
```

## Output

```
ID                         KIND         RESULT   CHECKS     LATENCY
------------------------------------------------------------------------
pto-days-ft                grounded     PASS     4/4        2ms
…
adv-office-dog             adversarial  PASS     2/2        1ms

Score: 18/18 (100%)
```

With `--write-report`, also writes `reports/latest.md` + `reports/latest.json` (gitignored) and a stamped copy. Committed sample: [`reports/SAMPLE.md`](./reports/SAMPLE.md).

## Layout

```
cases/handbook.json      # fixed expectations
fixtures/sample-run.json # golden CiteBot-shaped responses
src/cli.ts               # npm run eval
src/score.ts             # deterministic checks
src/providers/citebot.ts # live HTTP
src/providers/fixture.ts # offline
```

## License

MIT — portfolio demo code.

## Live runs and quotas

`--provider citebot` depends on the deployed CiteBot Gemini quota. Free-tier daily limits will abort the live run early; that is expected. Use fixture mode for a deterministic score a hiring manager can reproduce without keys.


## CI

GitHub Actions needs the `workflow` OAuth scope to push `.yml` from this bot. Until that is granted, run locally (or add this workflow by hand):

```yaml
# .github/workflows/eval.yml
name: eval
on: [push, pull_request]
jobs:
  fixture:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: "22", cache: npm }
      - run: npm ci
      - run: npm run build
      - run: npm run eval -- --provider fixture --write-report
```
