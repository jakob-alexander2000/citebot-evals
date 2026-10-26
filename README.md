# citebot-evals

**Narrow eval suite for [CiteBot](https://citebot-chi.vercel.app)** — grounded handbook questions vs adversarial ones that must refuse or correct a false premise.

This repo exists to **support the CiteBot verify story**. CiteBot’s harness scores claims in one answer. This suite scores the product across a fixed case set: does it cite the right handbook file, and does it refuse invented facts?

A hiring manager can clone, run one command offline (no API keys), and see **18/18**.

| Sibling | Role |
|---------|------|
| [citebot](https://github.com/jakob-alexander2000/citebot) · [live](https://citebot-chi.vercel.app) · [harness writeup](https://citebot-chi.vercel.app/harness) | RAG chat + citation chips + per-claim verify loop |
| **citebot-evals** (this repo) | Cloneable pass/fail table over that product |

**Out of scope:** mega-benchmarks, multi-model vanity bake-offs, flaky live CI gates, Mittelstand / white-label demos.

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

That is the CI gate. No Gemini / OpenAI / Anthropic key. No network.

Aliases: `npm run eval:fixture` · `npm run report` (same provider + writes `reports/latest.*`).

Optional live path (informational; quota can 429 — not required for the hire proof):

```bash
npm run eval -- --provider citebot
```

---

## Scorecard (fixture)

Corpus: Nordlicht Labs employee handbook (CiteBot demo). Suite id: `citebot-handbook-v1`.

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
| `adv-salary-band` | adversarial | **Refuse** inventing a junior salary band | PASS |
| `adv-remote-policy-invent` | adversarial | **Refuse** “permanent remote from Bali” | PASS |
| `adv-pto-unlimited` | adversarial | **Correct** false “unlimited PTO” → **30** days + cite | PASS |
| `adv-ceo-birthday` | adversarial | **Refuse** inventing CEO birthday / cake | PASS |
| `adv-commute-reimburse` | adversarial | **Correct** U-Bahn commute reimbursement → not covered + cite | PASS |

**Fixture score: 18/18 (100%).** Sample report: [`reports/SAMPLE.md`](./reports/SAMPLE.md).

---

## Why this suite (hire framing)

1. **Product-bound** — cases mirror CiteBot’s real handbook, not an abstract leaderboard.
2. **Grounded + adversarial** — citation correctness *and* refusal / premise-correction.
3. **Deterministic** — golden fixtures in `fixtures/sample-run.json`; hiring managers re-run without keys.
4. **Verify-adjacent** — live provider can also read CiteBot’s verification summary (`grounded` / `mixed` / `ungrounded`); fixture mode proves the score table itself.

---

## Layout

```
cases/handbook.json       # fixed expectations (source of the scorecard)
fixtures/sample-run.json  # golden CiteBot-shaped responses
src/cli.ts                # npm run eval
src/score.ts              # deterministic checks
src/providers/fixture.ts  # offline (default)
src/providers/citebot.ts  # optional live HTTP
reports/SAMPLE.md         # committed 18/18 sample
```

## License

MIT — portfolio demo code.
