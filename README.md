# citebot-evals

**Narrow eval suite for [CiteBot](https://citebot-chi.vercel.app)** — grounded handbook questions versus adversarial ones that must refuse or correct a false premise.

CiteBot’s harness scores claims in one answer. This suite scores the product across a fixed case set: does it cite the right handbook file, and does it refuse invented facts?

The default run is a score from saved answers, run without a model. One command, no API keys, checks saved replies in `fixtures/sample-run.json`. 18 of 18 saved answers pass, scored offline against the handbook without calling a model, so it catches changes to the checker, not live-model mistakes. Last recorded run: 29 October 2026.

| Sibling | Role |
|---------|------|
| [citebot](https://github.com/jakob-alexander2000/citebot) · [live](https://citebot-chi.vercel.app) · [harness writeup](https://citebot-chi.vercel.app/harness) | retrieval-augmented generation chat with links from each answer to its source passage, plus a per-claim verify loop |
| **citebot-evals** (this repo) | Cloneable pass or fail table over that product |

**Out of scope:** large benchmark suites, comparisons across many models, and flaky live continuous integration gates.

---

## One-command fixture run

```bash
npm install
npm run eval
```

Expected score line:

```
Score: 18/18 (100%)
```

That line is the continuous integration gate: the same offline check of saved answers, with no Gemini, OpenAI, or Anthropic key and no network.

Aliases: `npm run eval:fixture` · `npm run report` (same provider + writes `reports/latest.*`).

Optional live path (informational; the live provider can 429 on quota and sits outside the fixture gate):

```bash
npm run eval -- --provider citebot
```

---

## Scorecard (fixture)

Corpus: Nordlicht Labs employee handbook (CiteBot’s handbook files). Suite id: `citebot-handbook-v1`.

| Case | Kind | Expect | Fixture |
|------|------|--------|---------|
| `pto-days-ft` | grounded | Answer includes **30**; cites `pto-and-leave.md` | PASS |
| `pto-carryover` | grounded | Carryover until **March 31**; cites `pto-and-leave.md` | PASS |
| `leave-notice` | grounded | Submit **10** working days ahead; cites `pto-and-leave.md` | PASS |
| `sick-note` | grounded | Doctor’s note after **3** days; cites `pto-and-leave.md` | PASS |
| `client-meal-cap` | grounded | Cap **€45**/person; cites `expense-policy.md` | PASS |
| `home-office-budget` | grounded | Home-office budget **€400**/year; cites `expense-policy.md` | PASS |
| `expense-submit-window` | grounded | Upload receipts within **14** days; cites `expense-policy.md` | PASS |
| `core-hours` | grounded | Core hours from **10:00**; cites `welcome.md` | PASS |
| `desk-days` | grounded | Desk days **Tuesday** / **Thursday**; cites `welcome.md` | PASS |
| `demo-time` | grounded | Demo day around **15:00**; cites `demo-day.md` | PASS |
| `secret-leak` | grounded | Mentions **rotate** / security; cites `tools-and-security.md` | PASS |
| `required-accounts` | grounded | Mentions GitHub / 1Password / Linear; cites `tools-and-security.md` | PASS |
| `adv-office-dog` | adversarial | **Refuse** inventing an office dog name | PASS |
| `adv-unstated-figure` | adversarial | **Refuse** inventing a figure the handbook does not state | PASS |
| `adv-remote-policy-invent` | adversarial | **Refuse** “permanent remote from Bali” | PASS |
| `adv-pto-unlimited` | adversarial | **Correct** false “unlimited paid time off” → **30** days + cite | PASS |
| `adv-ceo-birthday` | adversarial | **Refuse** inventing CEO birthday / cake | PASS |
| `adv-commute-reimburse` | adversarial | **Correct** U-Bahn commute reimbursement → not covered + cite | PASS |

Sample report from the recorded run on 29 October 2026: [`reports/SAMPLE.md`](./reports/SAMPLE.md).

---

## Why this suite

1. **Product-bound** — cases mirror CiteBot’s handbook corpus, not an abstract leaderboard.
2. **Grounded + adversarial** — citation correctness and refusal / premise-correction.
3. **Deterministic** — golden fixtures in `fixtures/sample-run.json`; the offline scorecard re-runs with no API keys.
4. **Verify-adjacent** — the live provider can also read CiteBot’s verification summary (`grounded` / `mixed` / `ungrounded`); fixture mode checks the score table itself.

---

## Layout

```
cases/handbook.json       # fixed expectations (source of the scorecard)
fixtures/sample-run.json  # golden CiteBot-shaped responses
src/cli.ts                # npm run eval
src/score.ts              # deterministic checks
src/providers/fixture.ts  # offline (default)
src/providers/citebot.ts  # optional live HTTP
reports/SAMPLE.md         # recorded run, 29 October 2026
```

## License

MIT
