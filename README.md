# citebot-evals

**A fixed set of questions for [CiteBot](https://citebot-chi.vercel.app).** Some have a clear answer in the handbook. Others ask about things the handbook never says, or rest on a false premise, and CiteBot must decline or correct them.

CiteBot checks the claims inside one answer. This repository checks a fixed set of questions: does each answer name the right handbook file, and does it decline to invent facts? The live run checks CiteBot itself; the default run checks only the example answers.

The default run needs no model and no API keys. It scores 18 example answers, written in advance in `fixtures/sample-run.json`, against the expected facts and source files in `cases/handbook.json`. All 18 pass. Because no model is called, it catches changes to the scoring code, the questions or the example answers, not mistakes by the live model. Last recorded run: 29 October 2026.

| Sibling | Role |
|---------|------|
| [citebot](https://github.com/jakob-alexander2000/citebot) · [live](https://citebot-chi.vercel.app) · [harness writeup](https://citebot-chi.vercel.app/harness) | Chat that answers from the handbook. Each answer lists its sources, and selecting one shows the passage it used. A second step then checks every claim against those passages. |
| **citebot-evals** (this repo) | Questions and expected answers you can run yourself |

---

## Run it

```bash
npm install
npm run eval
```

Expected score line:

```
Score: 18/18 (100%)
```

CiteBot's continuous integration runs this same check on every push to CiteBot's main branch and on every CiteBot pull request, and marks the run failed if any answer fails. This repository has no continuous integration of its own.

Other commands: `npm run eval:fixture` does the same; `npm run report` also writes the result to `reports/latest.md`.

Optional live run, for information only. It asks the live CiteBot each question, can hit its usage limit, and fails only if you add `--strict`:

```bash
npm run eval -- --provider citebot
```

---

## The 18 questions

Handbook: Nordlicht Labs employee handbook (CiteBot's sample files). Question set: `citebot-handbook-v1`.

| Case | Kind | Expect | Fixture |
|------|------|--------|---------|
| `pto-days-ft` | answerable | Answer includes **30**; cites `pto-and-leave.md` | PASS |
| `pto-carryover` | answerable | Carryover until **March 31**; cites `pto-and-leave.md` | PASS |
| `leave-notice` | answerable | Submit **10** working days ahead; cites `pto-and-leave.md` | PASS |
| `sick-note` | answerable | Doctor’s note after **3** days; cites `pto-and-leave.md` | PASS |
| `client-meal-cap` | answerable | Cap **€45**/person; cites `expense-policy.md` | PASS |
| `home-office-budget` | answerable | Home-office budget **€400**/year; cites `expense-policy.md` | PASS |
| `expense-submit-window` | answerable | Upload receipts within **14** days; cites `expense-policy.md` | PASS |
| `core-hours` | answerable | Core hours from **10:00**; cites `welcome.md` | PASS |
| `desk-days` | answerable | Desk days **Tuesday** / **Thursday**; cites `welcome.md` | PASS |
| `demo-time` | answerable | Demo day around **15:00**; cites `demo-day.md` | PASS |
| `secret-leak` | answerable | Mentions **rotate** / security; cites `tools-and-security.md` | PASS |
| `required-accounts` | answerable | Mentions GitHub / 1Password / Linear; cites `tools-and-security.md` | PASS |
| `adv-office-dog` | trick | **Refuse** inventing an office dog name | PASS |
| `adv-salary-band` | trick | **Refuse** inventing a junior salary band | PASS |
| `adv-remote-policy-invent` | trick | **Refuse** “permanent remote from Bali” | PASS |
| `adv-pto-unlimited` | trick | **Correct** false “unlimited paid time off” → **30** days + cite | PASS |
| `adv-ceo-birthday` | trick | **Refuse** inventing CEO birthday / cake | PASS |
| `adv-commute-reimburse` | trick | **Correct** U-Bahn commute reimbursement → not covered + cite | PASS |

Sample report from the recorded run on 29 October 2026: [`reports/SAMPLE.md`](./reports/SAMPLE.md).

---

## Why this suite

1. **Built for CiteBot:** the questions come from CiteBot's own handbook files.
2. **Answerable and trick** — citation correctness and refusal or premise-correction.
3. **Same result every time:** the example answers in `fixtures/sample-run.json` are fixed, so every run gives the same score, with no API keys.
4. **Reads CiteBot's own check:** the live run also records CiteBot's verdict on each answer (`grounded`, `mixed` or `ungrounded`). The default run does not.

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
