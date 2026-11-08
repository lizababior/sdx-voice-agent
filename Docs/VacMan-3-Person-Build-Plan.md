# VacMan — 3-Person Build Plan

Nov 8, 2026 · @Jake

## Overview

VacMan is a voice agent HVAC techs talk to on their phone mid-repair. It logs parts, labor and damage, finds substitute parts, and builds the customer invoice at close-out. Submissions are due at 4:15; record the Loom by 3:50.

- **Track:** 04 Open
- **User:** An HVAC tech mid-repair whose hands are full.
- **Finish line:** A customer-ready invoice built from what the tech said on the job.
- **ElevenLabs:** VacMan's voice agent, knowledge base (pricing, troubleshooting, past jobs) and 4 webhook tools.
- **Daytona:** The substitute-part matcher and the invoice generator both run as scripts in a sandbox.
- **Cut for today:** real login, the knowledge base learning from techs, and updating the knowledge base from chat. If judges ask, these are the roadmap.

## 0. Shared contract (all three, 2:00–2:05)

Agree on this first. After that, each person builds alone against mocks until the merge at 3:15.

### Repo layout

```
/backend    main.py, db.py, daytona_runner.py, sandbox/matcher.py, sandbox/invoice.py
/data       jobs.json, parts.csv, pricing.json
/kb         business.md, troubleshooting.md, past_jobs.md
/frontend   index.html (job list), job.html (VacMan session), app.js
```

### API

**API.** FastAPI also serves `/frontend`, so everything sits behind one ngrok HTTPS URL. The phone mic requires HTTPS.

| Endpoint | Body | Returns |
| --- | --- | --- |
| `GET /api/jobs?tech_id=t1` | — | List of jobs (id, customer, address, time, status) |
| `GET /api/jobs/{id}` | — | Job + customer + equipment + complaint |
| `GET /api/jobs/{id}/events` | — | Timeline events (frontend polls every 2s) |
| `POST /tools/log_event` | `{job_id, type, item, qty, labor_min, notes}` | `{ok, summary}` |
| `POST /tools/undo_last` | `{job_id}` | `{ok, removed}` |
| `POST /tools/find_substitute` | `{job_id, part_description}` | `{options:[{part_no, name, price, why}]}` |
| `POST /tools/generate_invoice` | `{job_id}` | `{total, invoice_url}` |

`type` is one of `part | tool | labor | damage | note`.

The frontend passes `job_id`, `customer_name`, `equipment` and `complaint` to the agent as dynamic variables when it starts the session.

## Deandre: Backend + Daytona

This person owns the server, the database and everything that runs in Daytona.

- [ ] **2:05 — Stub server.** Build the FastAPI skeleton with every endpoint returning hardcoded stub JSON. Start ngrok and post the URL in the group chat by 2:20. This unblocks the other two.
- [ ] **2:20 — Database.** Set up SQLite in `db.py` with `jobs` and `events` tables, seeded from `data/jobs.json` (use placeholder rows until Liz delivers the real file). Wire real reads and writes for jobs, events, `log_event` and `undo_last`.
- [ ] **2:40 — Daytona runner.** In `daytona_runner.py`, create one sandbox on startup and upload `parts.csv`, `pricing.json` and the `sandbox/` scripts. Add a `run(script, args_json)` helper that executes `python script.py '<json>'` and parses the JSON it prints.
- [ ] **2:50 — Part matcher.** `sandbox/matcher.py` loads `parts.csv` and filters by category. Rules: capacitor µF within ±6% and voltage at or above the original; contactor amps at or above the original. Return the top 3 options with a `why` line each.
- [ ] **3:05 — Invoice generator.** `sandbox/invoice.py` takes the events plus `pricing.json` and computes trip fee, labor, part markup and tax. It outputs `{total, line_items}` and a styled HTML invoice, saved so it's served at `/invoices/{job_id}`.
- [ ] **3:15 — Merge.** Test every tool with curl, then with the live agent.

## Liz: VacMan agent + data + knowledge base

This person owns the fake data, the ElevenLabs agent and the Loom script.

- [ ] **2:05 — Data files.** Generate with Claude and hand to Deandre by 2:20:
  - `jobs.json`: 1 tech, 6 jobs (3 today, 2 past, 1 upcoming), each with customer, address, equipment model and complaint.
  - `parts.csv`: about 100 parts with columns `part_no, category, name, spec_uf, spec_v, spec_amps, price`.
  - `pricing.json`: trip fee, hourly rate, markup %, tax.
- [ ] **2:20 — Knowledge base docs.** Write and upload to the agent's ElevenLabs knowledge base:
  - `business.md`: how the company operates.
  - `troubleshooting.md`: short cycling, no cooling, frozen coil, and similar.
  - `past_jobs.md`: 10 past jobs with symptom, cause and fix.
- [ ] **2:35 — Create the agent.** In the ElevenLabs dashboard, pick a calm, clear voice. Add dynamic variables `job_id`, `customer_name`, `equipment`, `complaint`. First message: "You're at {{customer_name}}'s, {{equipment}}, complaint is {{complaint}}. Ready when you are."
- [ ] **2:45 — System prompt.** Rules:
  - Keep replies to 1–2 sentences.
  - Log everything the tech says they did, used, or broke.
  - Say "checking" before slow tools.
  - "Scratch that" calls `undo_last`.
  - Off-topic questions get a one-line answer, then a nudge back to the job.
  - "Close out" or "wrap up" calls `generate_invoice` and reads the total aloud.
- [ ] **2:55 — Tools and turn-taking.** Add the 4 webhook tools pointing at Deandre's ngrok URL, with `job_id` filled from the `{{job_id}}` dynamic variable. Tune turn-taking and interruptions so the agent handles being interrupted.
- [ ] **3:15 — Merge.** Run the full demo script, fix the prompt, and own the Loom script.

## Jake: Mobile frontend

This person owns everything the judges see. Polish matters more than accuracy.

- [ ] **2:05 — Job list.** Build `index.html` with Tailwind via CDN, dark and mobile-first. Show "Hi, Mike" and job cards grouped into Today, Upcoming and Past. Use a hardcoded mock array until `/api/jobs` is live.
- [ ] **2:30 — Job screen.** Build `job.html`:
  - Header: customer, address, equipment, complaint.
  - Middle: a large mic button with a "VacMan is listening / speaking" state.
  - Below: a live timeline of event cards, with an icon and color per type.
- [ ] **2:50 — Wire the voice.** Use the ElevenLabs client SDK (`@elevenlabs/client` via CDN ESM) and call `Conversation.startSession({agentId, dynamicVariables: {job_id, customer_name, equipment, complaint}})`. Drive the speaking/listening indicator from its mode callback.
- [ ] **3:00 — Live timeline.** Poll `/api/jobs/{id}/events` every 2 seconds and animate new cards in. Substitute options render as a special card listing the 3 parts.
- [ ] **3:10 — Invoice view.** When an invoice event appears, show a slide-up panel that loads `/invoices/{job_id}`, with "Send to customer" and "Print" buttons.
- [ ] **3:15 — Merge.** Test on a real phone through the ngrok URL. Polish spacing, loading states and the empty timeline.

## Together: merge, demo, submit

- [ ] **3:15–3:40 — Demo loop.** Run it end to end at least 5 times:
  1. Open a job.
  2. Log 2 parts.
  3. Say "missing a capacitor" and get a substitute.
  4. Say "scratch that."
  5. Ask one off-topic question.
  6. Say "close it out" and show the invoice.
- [ ] **3:40 — Stretch,** only if the loop is solid. Photo upload, then a vision model reads the part label, then Daytona parses the model and serial number onto the job.
- [ ] **3:50 — Loom.** Record the demo loop, stopping before 2:00. Finish the README with track (Open), user and finish line.
- [ ] **4:10 — Submit.** Repo link, Loom, and track/user/finish line.
